"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginator = void 0;
class Paginator {
    static paginate(data, currentPage = 1, pageSize = 10, title) {
        let startPage, endPage;
        let totalPages = Math.ceil(data.length / pageSize);
        if (currentPage < 1) {
            currentPage = 1;
        }
        else if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, data.length - 1);
        return { totalItems: data.length,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startIndex: startIndex,
            endIndex: endIndex,
            allItems: data,
            visibleItems: data.slice(startIndex, endIndex + 1),
            title: title,
            getChecked: () => data.where({ '__checked': true })
                .map((item, i) => {
                return { index: data.indexOf(item),
                    item: item };
            })
        };
    }
}
exports.Paginator = Paginator;
//# sourceMappingURL=core.paginator.js.map