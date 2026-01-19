// responses/success/UpdateSuccess.js
import BaseSuccess from "./BaseSuccess";

class UpdateSuccess extends BaseSuccess {
  constructor(data, message = "Update success") {
    super({
      statusCode: 200,
      message,
      data
    });
  }
}

export default UpdateSuccess;
