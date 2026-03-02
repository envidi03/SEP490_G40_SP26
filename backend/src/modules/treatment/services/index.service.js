const TreatmentService = require('./treatment.service');
const DentalService = require('./dental.record.service');

module.exports = {
    treatment: TreatmentService,
    dental: DentalService        
};