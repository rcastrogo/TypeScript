"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogHelper = void 0;
var DialogHelper = (function () {
    function DialogHelper() {
    }
    DialogHelper.getWrapper = function (id) {
        var __container = document.getElementById(id);
        var __dlg = { container: __container, title: __container.querySelector('.js-title'),
            body: __container.querySelector('.js-content'),
            closeButton: __container.querySelector('.js-close-button'),
            acceptButton: __container.querySelector('.js-accept-button'), close: function () {
                __container.style.display = 'none';
                return __dlg;
            }, show: function (onConfirm) {
                if (onConfirm) {
                    __dlg.acceptButton.onclick = function () {
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
            setTitle: function (title) {
                __dlg.title.innerHTML = title;
                return __dlg;
            },
            setBody: function (content) {
                if (content.tagName) {
                    __dlg.body.innerHTML = '';
                    __dlg.body.appendChild(content);
                }
                else {
                    __dlg.body.innerHTML = content;
                }
                return __dlg;
            },
            disableClickOutside: function () {
                __dlg.container.onclick = function () { };
                return __dlg;
            }
        };
        __dlg.acceptButton.onclick = __dlg.close;
        __dlg.closeButton.onclick = __dlg.close;
        __dlg.container.onclick = function (sender) { if (sender.target === __dlg.container)
            __dlg.close(); };
        return __dlg;
    };
    return DialogHelper;
}());
exports.DialogHelper = DialogHelper;
