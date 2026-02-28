const Medicine = require("../model/medicine.model");
const Treatment = require("../../treatment/models/treatment.model");

exports.getDashboardStats = async () => {
    const [totalActive, lowStock, urgentStock, inventoryResult, pendingDispense] = await Promise.all([
        Medicine.countDocuments({ status: "AVAILABLE" }),
        Medicine.countDocuments({ $expr: { $lte: ["$quantity", "$min_quantity"] }, quantity: { $gt: 0 } }),
        Medicine.countDocuments({
            $or: [
                { quantity: 0 },
                { $expr: { $lte: ["$quantity", { $multiply: ["$min_quantity", 0.1] }] } }
            ]
        }),
        Medicine.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$quantity" }
                }
            }
        ]),
        Treatment.countDocuments({
            "medicine_usage.0": { $exists: true },
            "medicine_usage.dispensed": false
        })
    ])
    return {
        totalMedicines: totalActive,
        totalInventoryQuantity: inventoryResult[0]?.totalQuantity || 0,
        pendingOrders: pendingDispense,
        lowStockCount: lowStock,
        urgentStockCount: urgentStock
    }
}

exports.getLowStockMedicines = async (limit = 3) => {
    return await Medicine.find({
        $expr: { $lte: ["$quantity", "$min_quantity"] },
        quantity: { $gt: 0 }
    },
        {
            medicine_name: 1,
            quantity: 1,
            min_quantity: 1,
        }
    ).sort({ quantity: 1 })
        .limit(limit)
}

exports.getNearExpiredMedicines = async (days = 30) => {
    const today = new Date();
    const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return await Medicine.find(
        {
            expiry_date: { $gte: today, $lte: future },
        },
        { medicine_name: 1, expiry_date: 1, quantity: 1 }
    ).sort({ expiry_date: 1 })
}

/**
 * Lấy danh sách theo dõi tồn kho (search, pagination)
 */
exports.getStockTracking = async ({ page = 1, limit = 10, search }) => {
    const query = {};

    if (search && search.trim()) {
        query.medicine_name = new RegExp(search.trim(), "i");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [medicines, totalCount] = await Promise.all([
        Medicine.find(query)
            .select("medicine_name quantity min_quantity last_import_date status")
            .sort({ quantity: 1 })
            .skip(skip)
            .limit(limitNum),
        Medicine.countDocuments(query)
    ]);

    const data = medicines.map((med) => {
        const stockStatus = med.quantity <= 0
            ? "Hết hàng"
            : med.quantity <= med.min_quantity
                ? "Thấp"
                : "Đủ hàng";

        return {
            _id: med._id,
            medicine_name: med.medicine_name,
            quantity: med.quantity,
            min_quantity: med.min_quantity,
            stock_status: stockStatus,
            last_import_date: med.last_import_date
        };
    });

    return {
        medicines: data,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limitNum),
            totalItems: totalCount,
            itemsPerPage: limitNum
        }
    };
};
