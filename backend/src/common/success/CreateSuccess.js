// responses/success/CreateSuccess.js
import BaseSuccess from "./BaseSuccess";

class CreateSuccess extends BaseSuccess {
  constructor(data, message = "Create success") {
    super({
      statusCode: 201,
      message,
      data
    });
  }
}

export default CreateSuccess;
