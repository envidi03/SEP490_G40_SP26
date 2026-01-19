// responses/success/GetInfoSuccess.js
import BaseSuccess from "./BaseSuccess";

class GetInfoSuccess extends BaseSuccess {
  constructor(data, message = "Get information success") {
    super({
      statusCode: 200,
      message,
      data
    });
  }
}

export default GetInfoSuccess;
