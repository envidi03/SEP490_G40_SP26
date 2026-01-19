class BaseSuccess {
  constructor(statusCode, message, data = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }
}

export default BaseSuccess;
