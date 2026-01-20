// responses/success/GetInfoSuccess.js
const BaseSuccess = require('./BaseSuccess');

class GetInfoSuccess extends BaseSuccess {
  constructor(data, message = "Get information success") {
    super({
      statusCode: 200,
      message,
      data
    });
  }
}

module.exports = GetInfoSuccess;
