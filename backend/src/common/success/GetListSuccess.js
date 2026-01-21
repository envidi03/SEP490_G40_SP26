// responses/success/GetListSuccess.js
import BaseSuccess from "./BaseSuccess";

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

export default GetListSuccess;
