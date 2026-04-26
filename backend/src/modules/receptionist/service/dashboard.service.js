const AppointmentModel = require('../../appointment/models/appointment.model');
const PatientModel = require('../../patient/model/patient.model');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');


const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);
const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

exports.getDashboard = async () => {
    try {
        //thieu unpaidcount
        const [todayCount, pendingCount, newPatientCount, todayAppointments, recentPatient] = await Promise.all([
            AppointmentModel.countDocuments({
                appointment_date: { $gte: startOfToday, $lte: endOfToday }
            }),

            AppointmentModel.countDocuments({
                appointment_date: { $gte: startOfToday, $lte: endOfToday },
                status: "SCHEDULED"
            }),

            //chua co billing nen de sau unpaidcount

            PatientModel.countDocuments({
                createdAt: { $gte: startOfMonth }
            }),

            AppointmentModel.find({
                appointment_date: { $gte: startOfToday, $lte: endOfToday }
            })
                .sort({ appointment_time: 1 })
                .limit(5)
                .select('full_name phone appointment_time status reason'),

            PatientModel.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('profile_id', 'full_name dob')
        ]);

        return {
            stats: {
                today_appointment: todayCount,
                pending_confirm: pendingCount,
                pending_invoices: 0,
                new_patient: newPatientCount
            },
            today_appointment_list: todayAppointments,
            unpaid_invoices: [],
            recent_patients: recentPatient
        }
    } catch (error) {
        logger.error('Error getting dashboard data', {
            context: 'DashboardService.getDashboardService',
            message: error.message,
        })
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau")
    }

}



