"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginator = void 0;
var Paginator = (function () {
    function Paginator() {
    }
    Paginator.paginate = function (data, currentPage, pageSize, title) {
        if (currentPage === void 0) { currentPage = 1; }
        if (pageSize === void 0) { pageSize = 10; }
        var startPage, endPage;
        var totalPages = Math.ceil(data.length / pageSize);
        if (currentPage < 1) {
            currentPage = 1;
        }
        else if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, data.length - 1);
        return { totalItems: data.length,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startIndex: startIndex,
            endIndex: endIndex,
            allItems: data,
            visibleItems: data.slice(startIndex, endIndex + 1),
            title: title, getChecked: function () { return data.where({ '__checked': true })
                .map(function (item, i) {
                return { index: data.indexOf(item),
                    item: item };
            }); }
        };
    };
    return Paginator;
}());
exports.Paginator = Paginator;
