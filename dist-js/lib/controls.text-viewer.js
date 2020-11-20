"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextViewer = void 0;
var core_1 = require("./core");
var core_events_1 = require("./core.events");
var controls_text_viewer_ts_css_1 = require("./controls.text-viewer.ts.css");
var __data_Uri = 'data:text/css;base64,' + window.btoa(controls_text_viewer_ts_css_1.default);
var __template = '<div class="scv_Main">' +
    '  <pre class="scv_LineContainer" id="svc_{0}_line"></pre>' +
    '  <pre class="scv_TextContainer" id="svc_{0}_code"></pre>' +
    '</div>';
var __counter = 0;
var __css = false;
function __initCss() {
    if (__css)
        return;
    document.querySelector('head')
        .appendChild(core_1.core.build('link', { rel: 'stylesheet',
        type: 'text/css',
        href: __data_Uri }));
    __css = true;
}
var TextViewer = (function () {
    function TextViewer() {
        var _this = this;
        this.id = 'svc_{0}'.format(++__counter);
        __initCss();
        this._control = core_1.core.build('div', { className: 'svc_viewer',
            id: this.id,
            innerHTML: __template.format(__counter) });
        this._control
            .querySelector('.scv_Main')
            .onscroll = function (event) {
            var __target = event.target;
            _this._control
                .querySelector('.scv_LineContainer')
                .style.left = '{0}px'.format(__target.scrollLeft);
        };
        this.onclick = new core_events_1.CoreEvent('txt-viewer.onclick');
    }
    TextViewer.prototype.setContent = function (value) {
        var _this = this;
        this._control
            .querySelector('.scv_LineContainer')
            .innerHTML = value.replace(/(\r\n|\r|\n)/mg, '\n')
            .split('\n')
            .reduce(function (a, _, i) { return a += (i + 1) + '<br/>'; }, '');
        var __div = this._control.querySelector('.scv_TextContainer');
        __div.textContent = value;
        __div.onclick = function (e) { return _this.onclick.dispatch(e); };
        return this;
    };
    TextViewer.prototype.getControl = function () {
        return this._control;
    };
    return TextViewer;
}());
exports.TextViewer = TextViewer;
