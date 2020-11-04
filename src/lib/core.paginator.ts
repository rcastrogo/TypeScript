
export declare interface PaginationInfo {
  totalItems: number,
  currentPage: number,
  pageSize: number,
  totalPages: number,
  startIndex: number,
  endIndex: number,
  allItems: any[],
  visibleItems: any[],
  title:string,
  getChecked: () => any[]
}

export class Paginator {

  static paginate(data: any[],
                  currentPage: number = 1,
                  pageSize: number = 10,
                  title:string): PaginationInfo {

    let startPage: number, endPage: number;
    let totalPages = Math.ceil(data.length / pageSize);
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, data.length - 1);

    return { totalItems   : data.length,
             currentPage  : currentPage,
             pageSize     : pageSize,
             totalPages   : totalPages,
             startIndex   : startIndex,
             endIndex     : endIndex,
             allItems     : data,
             visibleItems : data.slice(startIndex, endIndex + 1),
             title        : title,
             getChecked : () => data.where({ '__checked' : true })
                                    .map( (item, i) => {
                                      return { index : data.indexOf(item),
                                               item  : item }
                                    })
    }
  }
}
