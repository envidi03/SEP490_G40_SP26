// responses/success/DeleteSuccess.js
class DeleteSuccess {
  constructor(message = "Delete success") {
    this.success = true;
    this.statusCode = 200;
    this.message = message;
  }
}

module.exports = DeleteSuccess;
