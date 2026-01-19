// responses/success/GetListSuccess.js
const BaseSuccess = require('./BaseSuccess');

class GetListSuccess extends BaseSuccess {
  constructor(data, pagination, message = "Get list success") {
    super({
      statusCode: 200,
      message,
      data
    });
    this.pagination = pagination;
  }
}

module.exports = GetListSuccess;
