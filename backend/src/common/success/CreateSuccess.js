// responses/success/CreateSuccess.js
const BaseSuccess = require('./BaseSuccess');

class CreateSuccess extends BaseSuccess {
  constructor(data, message = "Create success") {
    super({
      statusCode: 201,
      message,
      data
    });
  }
}

module.exports = CreateSuccess;
