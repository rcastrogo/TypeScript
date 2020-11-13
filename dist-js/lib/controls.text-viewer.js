"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextViewer = void 0;
var core_1 = require("./core");
var __template = '<div class="scv_overlayText"></div><div class="scv_overlayLine"></div>' +
    '<div class="scv_Main">' +
    '  <pre class="scv_LineContainer" id="svc_{0}_line"></pre>' +
    '  <pre class="scv_TextContainer" id="svc_{0}_code"></pre>' +
    '</div>';
var __counter = 0;
var TextViewer = /** @class */ (function () {
    function TextViewer() {
        var _this = this;
        this._control = core_1.core.build('div', { className: 'svc_viewer',
            id: 'svc_{0}'.format(++__counter),
            innerHTML: __template.format(__counter) });
        this._control
            .querySelector('.scv_Main')
            .onscroll = function (event) {
            var __target = event.target;
            _this._control
                .querySelector('.scv_overlayText')
                .style.left = '-{0}px'.format(__target.scrollLeft);
            _this._control
                .querySelector('.scv_overlayLine')
                .style.left = '-{0}px'.format(__target.scrollLeft);
        };
    }
    TextViewer.prototype.setContent = function (value) {
        var __i = 0;
        this._control
            .querySelector('.scv_LineContainer')
            .innerHTML = (value + '\r\n').replace(/(.*)\r\n|\r|\n/mg, function () { return ++__i + '<br/>'; });
        var __div = this._control.querySelector('.scv_TextContainer');
        __div.textContent = value;
        // onLineClick
        // __div.innerHTML = (__div.innerHTML + '\n').replace(/^(.*)\r\n|\r|\n/gim, '<span>$1</span><br/>')
        return this;
    };
    TextViewer.prototype.getControl = function () {
        return this._control;
    };
    return TextViewer;
}());
exports.TextViewer = TextViewer;
