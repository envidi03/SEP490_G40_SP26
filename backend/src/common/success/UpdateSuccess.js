// responses/success/UpdateSuccess.js
const BaseSuccess = require('./BaseSuccess');

class UpdateSuccess extends BaseSuccess {
  constructor(data, message = "Update success") {
    super({
      statusCode: 200,
      message,
      data
    });
  }
}

module.exports = UpdateSuccess;
