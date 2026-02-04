// responses/pagination/Pagination.js
class Pagination {
  constructor({ page, size, totalItems }) {
    this.page = page || null;
    this.size = size || null;
    this.totalItems = totalItems || 0;
    this.totalPages = Math.ceil(totalItems / size) || 0;
  }
}
module.exports = Pagination;
