const mongoose = require('mongoose');

/**
 * Hàm generate báo cáo dòng tiền dùng chung
 * @param {Object} params
 * @param {mongoose.Model} params.model - Mongoose Model cần query
 * @param {String} [params.dateField='createdAt'] - Trường lưu thời gian trong DB
 * @param {Array<String>} params.nameFieldMoneyIn - Mảng các field tiền vào (VD: ['cashIn', 'bankIn'])
 * @param {Array<String>} params.nameFieldMoneyOut - Mảng các field tiền ra (VD: ['cashOut'])
 * @param {String|Date} params.fromDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {String|Date} params.toDate - Ngày kết thúc (YYYY-MM-DD)
 * @param {String} [params.timezone='Asia/Ho_Chi_Minh'] - Timezone để group ngày chính xác
 */
const generateCashFlowReport = async ({
      model,
      dateField = 'createdAt',
      nameFieldMoneyIn = [],
      nameFieldMoneyOut = [],
      fromDate,
      toDate,
      timezone = 'Asia/Ho_Chi_Minh',
      extraConditions = {}
}) => {
      // 1. Xử lý logic Date
      const now = new Date();
      const start = fromDate
            ? new Date(new Date(fromDate).setHours(0, 0, 0, 0))
            : new Date(now.getFullYear(), now.getMonth(), 1);

      const end = toDate
            ? new Date(new Date(toDate).setHours(23, 59, 59, 999))
            : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // 2. Hàm helper build biểu thức cộng tiền động ($add)
      const buildSumExpr = (fields) => {
            if (!fields || fields.length === 0) return { $literal: 0 };
            return { $add: fields.map(field => ({ $ifNull: [`$${field}`, 0] })) };
      };

      // 3. Xây dựng Aggregation Pipeline
      const pipeline = [
            // Bước 1: Lọc dữ liệu trong khoảng thời gian
            {
                  $match: {
                        [dateField]: { $gte: start, $lte: end },
                        ...extraConditions
                  }
            },
            // Bước 2: Chuẩn bị dữ liệu, tính tổng In/Out trên từng document và format ngày
            {
                  $project: {
                        yearString: { $dateToString: { format: "%Y", date: `$${dateField}`, timezone } },
                        monthString: { $dateToString: { format: "%Y-%m", date: `$${dateField}`, timezone } },
                        dateString: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}`, timezone } },
                        totalIn: buildSumExpr(nameFieldMoneyIn),
                        totalOut: buildSumExpr(nameFieldMoneyOut),
                  }
            },
            // Bước 3: Phân nhánh (Facet) để group theo nhiều cấp độ cùng lúc
            {
                  $facet: {
                        summary: [
                              {
                                    $group: {
                                          _id: null,
                                          totalCount: { $sum: 1 },
                                          // Nếu totalIn > 0 thì cộng 1, ngược lại cộng 0
                                          totalCountIn: { $sum: { $cond: [{ $gt: ["$totalIn", 0] }, 1, 0] } },
                                          // Nếu totalOut > 0 thì cộng 1, ngược lại cộng 0
                                          totalCountOut: { $sum: { $cond: [{ $gt: ["$totalOut", 0] }, 1, 0] } },
                                          totalIn: { $sum: "$totalIn" },
                                          totalOut: { $sum: "$totalOut" }
                                    }
                              }
                        ],
                        daily: [
                              {
                                    $group: {
                                          _id: "$dateString",
                                          totalCount: { $sum: 1 },
                                          totalCountIn: { $sum: { $cond: [{ $gt: ["$totalIn", 0] }, 1, 0] } },
                                          totalCountOut: { $sum: { $cond: [{ $gt: ["$totalOut", 0] }, 1, 0] } },
                                          totalIn: { $sum: "$totalIn" },
                                          totalOut: { $sum: "$totalOut" }
                                    }
                              },
                              { $sort: { _id: 1 } }
                        ],
                        monthly: [
                              {
                                    $group: {
                                          _id: "$monthString",
                                          totalCount: { $sum: 1 },
                                          totalCountIn: { $sum: { $cond: [{ $gt: ["$totalIn", 0] }, 1, 0] } },
                                          totalCountOut: { $sum: { $cond: [{ $gt: ["$totalOut", 0] }, 1, 0] } },
                                          totalIn: { $sum: "$totalIn" },
                                          totalOut: { $sum: "$totalOut" }
                                    }
                              },
                              { $sort: { _id: 1 } }
                        ],
                        yearly: [
                              {
                                    $group: {
                                          _id: "$yearString",
                                          totalCount: { $sum: 1 },
                                          totalCountIn: { $sum: { $cond: [{ $gt: ["$totalIn", 0] }, 1, 0] } },
                                          totalCountOut: { $sum: { $cond: [{ $gt: ["$totalOut", 0] }, 1, 0] } },
                                          totalIn: { $sum: "$totalIn" },
                                          totalOut: { $sum: "$totalOut" }
                                    }
                              },
                              { $sort: { _id: 1 } }
                        ]
                  }
            }
      ];

      const result = await model.aggregate(pipeline);
      const data = result[0];

      // Format lại summary cho gọn, cập nhật thêm giá trị mặc định cho các count
      const summary = data.summary[0] || {
            totalCount: 0,
            totalCountIn: 0,
            totalCountOut: 0,
            totalIn: 0,
            totalOut: 0
      };
      delete summary._id;
      summary.balance = summary.totalIn - summary.totalOut;

      // 4. Logic quyết định trả về dữ liệu dựa trên khoảng thời gian
      const spansMultipleYears = start.getFullYear() !== end.getFullYear();
      const spansMultipleMonths = spansMultipleYears || start.getMonth() !== end.getMonth();

      const finalReport = {
            timeRange: { start, end },
            summary,
            daily: data.daily
      };

      if (spansMultipleMonths) {
            finalReport.monthly = data.monthly;
      }

      if (spansMultipleYears) {
            finalReport.yearly = data.yearly;
      }

      return finalReport;
};

module.exports = { generateCashFlowReport };

/*
hướng dẫn sử dụng: 

const { generateCashFlowReport } = require('./reportService');
const TransactionModel = require('./models/Transaction');

const getReport = async (req, res) => {
    try {

        const conditions = {
            status: 'COMPLETED', // Bắt buộc giao dịch phải thành công
            isDeleted: false     // Không tính các record đã xóa mềm
        };

        const { fromDate, toDate } = req.query;

        const report = await generateCashFlowReport({
            model: TransactionModel,
            dateField: 'createdAt', // hoặc 'paymentDate' tùy schema của bạn
            nameFieldMoneyIn: ['cashAmount', 'bankTransferAmount'], 
            nameFieldMoneyOut: ['supplierPayment', 'refundAmount', 'operationalCost'],
            fromDate: fromDate, // VD: '2026-02-15'
            toDate: toDate,      // VD: '2026-03-15'
            extraConditions: conditions
        });

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi xuất báo cáo' });
    }
};

*/