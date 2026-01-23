// responses/success/GetDetailSuccess.js
const BaseSuccess = require('./BaseSuccess');

class GetDetailSuccess extends BaseSuccess {
  constructor(data, message = "Get detail success") {
    super({
      statusCode: 200,
      message,
      data
    });
  }
}

module.exports = GetDetailSuccess;
