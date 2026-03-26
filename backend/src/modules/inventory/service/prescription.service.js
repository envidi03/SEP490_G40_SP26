const Treatment = require("../../treatment/models/treatment.model");
const Medicine = require("../model/medicine.model");
const notificationService = require("../../notification/service/notification.service");

/**
 * Lấy danh sách đơn thuốc sau khám (chỉ treatments có medicine_usage)
 */
exports.getPrescriptions = async ({ status, search, page = 1, limit = 10, date }) => {
    const query = {
        "medicine_usage.0": { $exists: true }
    };

    // Filter theo trạng thái xuất thuốc
    if (status === "pending") {
        query["medicine_usage.dispensed"] = false;
    } else if (status === "dispensed") {
        query["medicine_usage"] = { $not: { $elemMatch: { dispensed: false } } };
    }

    // Filter theo ngày (YYYY-MM-DD)
    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let treatmentQuery = Treatment.find(query)
        .populate({
            path: "patient_id",
            populate: { path: "profile_id", select: "full_name phone" }
        })
        .populate({
            path: "doctor_id",
            populate: { path: "profile_id", select: "full_name" }
        })
        .populate("medicine_usage.medicine_id", "medicine_name unit dosage")
        .select("patient_id doctor_id medicine_usage createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const [treatments, totalCount] = await Promise.all([
        treatmentQuery,
        Treatment.countDocuments(query)
    ]);

    // Format kết quả
    const prescriptions = treatments.map((t) => {
        const allDispensed = t.medicine_usage.every((m) => m.dispensed);
        const patientProfile = t.patient_id?.profile_id;
        const doctorProfile = t.doctor_id?.profile_id;

        return {
            _id: t._id,
            patient_name: patientProfile?.full_name || "N/A",
            patient_phone: patientProfile?.phone || "",
            doctor_name: doctorProfile?.full_name || "N/A",
            created_at: t.createdAt,
            dispense_status: allDispensed ? "Đã xuất" : "Chờ xuất",
            medicines: t.medicine_usage.map((m) => ({
                _id: m._id,
                medicine_name: m.medicine_id?.medicine_name || "N/A",
                unit: m.medicine_id?.unit || "",
                dosage: m.medicine_id?.dosage || "",
                quantity: m.quantity,
                usage_instruction: m.usage_instruction,
                dispensed: m.dispensed
            }))
        };
    });

    // Filter search sau populate (tên bệnh nhân, bác sĩ)
    let filtered = prescriptions;
    if (search && search.trim()) {
        const searchLower = search.trim().toLowerCase();
        filtered = prescriptions.filter(
            (p) =>
                p.patient_name.toLowerCase().includes(searchLower) ||
                p.doctor_name.toLowerCase().includes(searchLower)
        );
    }

    return {
        prescriptions: filtered,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limitNum),
            totalItems: totalCount,
            itemsPerPage: limitNum
        }
    };
};

/**
 * Xuất thuốc điều trị — trừ kho theo medicine_usage
 */
exports.dispensePrescription = async (treatmentId) => {
    const treatment = await Treatment.findById(treatmentId)
        .populate("medicine_usage.medicine_id", "medicine_name quantity");

    if (!treatment) {
        const error = new Error("Không tìm thấy đơn thuốc");
        error.statusCode = 404;
        throw error;
    }

    if (!treatment.medicine_usage || treatment.medicine_usage.length === 0) {
        const error = new Error("Đơn thuốc không có thuốc nào");
        error.statusCode = 400;
        throw error;
    }

    const allDispensed = treatment.medicine_usage.every((m) => m.dispensed);
    if (allDispensed) {
        const error = new Error("Đơn thuốc đã được xuất rồi");
        error.statusCode = 400;
        throw error;
    }

    // Kiểm tra tồn kho đủ trước khi xuất
    const insufficientStock = [];
    for (const item of treatment.medicine_usage) {
        if (item.dispensed) continue;

        const medicine = await Medicine.findById(item.medicine_id._id || item.medicine_id);
        if (!medicine) {
            insufficientStock.push({ name: "Thuốc không tồn tại", required: item.quantity, available: 0 });
            continue;
        }

        // Quy đổi từ base_unit sang selling_unit
        // item.quantity là số lượng theo base_unit (Viên)
        // medicine.units_per_selling_unit là số lượng base_unit trong 1 đơn vị bán (Vỉ)
        const requiredInSellingUnit = item.quantity / (medicine.units_per_selling_unit || 1);

        if (medicine.quantity < requiredInSellingUnit) {
            insufficientStock.push({
                name: medicine.medicine_name,
                required: `${item.quantity} ${medicine.base_unit || ''} (~${requiredInSellingUnit.toFixed(2)} ${medicine.selling_unit})`,
                available: `${medicine.quantity} ${medicine.selling_unit}`
            });
        }
    }

    if (insufficientStock.length > 0) {
        const error = new Error(
            `Tồn kho không đủ: ${insufficientStock.map((s) => `${s.name} (cần ${s.required}, còn ${s.available})`).join(", ")}`
        );
        error.statusCode = 400;
        throw error;
    }

    // Trừ kho và đánh dấu đã xuất
    const dispensedItems = [];
    for (const item of treatment.medicine_usage) {
        if (item.dispensed) continue;

        const factor = medicine.units_per_selling_unit || 1;
        const deduction = item.quantity / factor;

        const updatedMedicine = await Medicine.findByIdAndUpdate(
            item.medicine_id._id || item.medicine_id,
            { $inc: { quantity: -deduction } },
            { new: true }
        );

        // Cảnh báo Tồn kho thấp (Low Stock) nếu số lượng mới <= min_quantity
        if (updatedMedicine && updatedMedicine.quantity <= updatedMedicine.min_quantity) {
            try {
                await notificationService.sendToRole(['PHARMACIST'], {
                    type: 'LOW_STOCK',
                    title: 'Cảnh báo Tồn kho thấp',
                    message: `Thuốc/Vật tư "${updatedMedicine.medicine_name}" sắp hết (Còn lại: ${updatedMedicine.quantity} ${updatedMedicine.selling_unit}). Vui lòng nhập thêm.`,
                    action_url: `/inventory/medicines/${updatedMedicine._id}`
                });
            } catch (err) {
                console.error("Lỗi gửi cảnh báo LOW STOCK:", err.message);
            }
        }

        item.dispensed = true;
        item.dispensed_at = new Date();
        dispensedItems.push(item);
    }

    await treatment.save();

    return {
        treatment_id: treatment._id,
        dispensed_count: dispensedItems.length,
        message: "Xuất thuốc thành công"
    };
};
