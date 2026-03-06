const TreatmentController = require('./treatment.controller');
const DentalRecordController = require('./dental.record.controller');

module.exports = {
    treatment: TreatmentController,
    dental: DentalRecordController        
};