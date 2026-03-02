class BaseSuccess {
  constructor({ statusCode, message, data = null, statistics = null } = {}) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (statistics !== null) this.statistics = statistics;
  }

  // Thêm hàm này để tự gửi response
  send(res, headers = {}) {
    return res.status(this.statusCode).json(this);
  }
}
module.exports = BaseSuccess;