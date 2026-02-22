// responses/success/GetListSuccess.js
const BaseSuccess = require('./BaseSuccess');

class GetListSuccess extends BaseSuccess {
  constructor(data, pagination, message = "Get list success", statistics = null) {
    super({
      statusCode: 200,
      message,
      data,
      statistics
    });
    this.pagination = pagination;
  }
}

module.exports = GetListSuccess;
