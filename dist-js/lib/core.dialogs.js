"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogHelper = void 0;
class DialogHelper {
    constructor() { }
    static getWrapper(id) {
        let __container = document.getElementById(id);
        let __dlg = { container: __container, title: __container.querySelector('.js-title'),
            body: __container.querySelector('.js-content'),
            closeButton: __container.querySelector('.js-close-button'),
            acceptButton: __container.querySelector('.js-accept-button'), close: function () {
                __container.style.display = 'none';
                return __dlg;
            }, show: function (onConfirm) {
                if (onConfirm) {
                    __dlg.acceptButton.onclick = () => {
                        onConfirm(__dlg);
                    };
                }
                __container.style.display = 'block';
                return __dlg;
            },
            init: function (onInit) {
                if (onInit)
                    onInit(__dlg);
                return __dlg;
            },
            setTitle: (title) => {
                __dlg.title.innerHTML = title;
                return __dlg;
            },
            setBody: (content) => {
                if (content.tagName) {
                    __dlg.body.innerHTML = '';
                    __dlg.body.appendChild(content);
                }
                else {
                    __dlg.body.innerHTML = content;
                }
                return __dlg;
            }, disableClickOutside: () => {
                __dlg.container.onclick = () => { };
                return __dlg;
            } };
        __dlg.acceptButton.onclick = __dlg.close;
        __dlg.closeButton.onclick = __dlg.close;
        __dlg.container.onclick = (sender) => { if (sender.target === __dlg.container)
            __dlg.close(); };
        return __dlg;
    }
}
exports.DialogHelper = DialogHelper;
//# sourceMappingURL=core.dialogs.js.map