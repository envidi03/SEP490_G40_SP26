const Medicine = require("../model/medicine.model");

exports.getDashboardStats = async () => {
    const [totalActive, lowStock, inventoryResult] = await Promise.all([
        Medicine.countDocuments({ status: "AVAILABLE" }),
        Medicine.countDocuments({ $expr: { $lte: ["$quantity", "$min_quantity"] }, quantity: { $gt: 0 } }),
        Medicine.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$quantity" }
                }
            }
        ])
    ])
    return {
        totalMedicines: totalActive,
        totalInventoryQuantity: inventoryResult[0]?.totalQuantity || 0,
        pendingOrders: 0,
        lowStockCount: lowStock
    }
}