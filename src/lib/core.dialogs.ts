
export declare interface Dialog {
  container: HTMLElement;
  title: HTMLElement;
  body: HTMLElement;
  closeButton: HTMLButtonElement;
  acceptButton: HTMLButtonElement;
  setTitle(title:string): Dialog;
  setBody(content:string | HTMLElement):Dialog;
  close(): Dialog;
  show(onConfirm?: (dlg:Dialog) => any):Dialog;
  init(onInit?: (dlg:Dialog) => any):Dialog;
  disableClickOutside(): Dialog;
}

export class DialogHelper {

  constructor() {}

  static getWrapper(id: string) : Dialog {
    let __container = document.getElementById(id);
    let __dlg = { container   : __container,
                  title       : __container.querySelector<HTMLElement>('.js-title'),
                  body        : __container.querySelector<HTMLElement>('.js-content'),
                  closeButton : __container.querySelector<HTMLButtonElement>('.js-close-button'),
                  acceptButton: __container.querySelector<HTMLButtonElement>('.js-accept-button'),
                  close : function(){ 
                    __container.style.display = 'none';
                    return __dlg;
                  },
                  show  : function(onConfirm?: (dlg:any) => any){
                    if (onConfirm) {
                      __dlg.acceptButton.onclick = () => {
                        onConfirm(__dlg);
                      };
                    }
                    __container.style.display = 'block';
                    return __dlg;
                  },
                  init : function(onInit?: (dlg:any) => any){
                    if (onInit) onInit(__dlg);
                    return __dlg;
                  },
                  setTitle: (title:string) => {
                    __dlg.title.innerHTML = title;
                    return __dlg;
                  },
                  setBody: (content:string | HTMLElement) => {
                    if ((content as HTMLElement).tagName) {
                      __dlg.body.innerHTML = '';
                      __dlg.body.appendChild(content as HTMLElement);
                    }else{
                      __dlg.body.innerHTML = content as string;
                    }
                    return __dlg;
                  },
                  disableClickOutside: () => {
                    __dlg.container.onclick = () => {};
                    return __dlg;
                  }
                };
    __dlg.acceptButton.onclick = __dlg.close;
    __dlg.closeButton.onclick = __dlg.close;
    __dlg.container.onclick   = (sender) => { if (sender.target === __dlg.container) __dlg.close(); }
    return __dlg;
  }

}
