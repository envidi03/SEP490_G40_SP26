// responses/pagination/Pagination.js
class Pagination {
  constructor({ page, size, totalItems }) {
    this.page = page;
    this.size = size;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / size);
  }
}
module.exports = Pagination;
