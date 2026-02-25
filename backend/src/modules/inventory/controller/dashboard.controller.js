const dashboardService = require("../service/dashboard.service");

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};