"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsibleBox = void 0;
var core_1 = require("./core");
var core_events_1 = require("./core.events");
var __template = '<div id="collapsible-box-{0}" class="w3-border">' +
    '  <button class="w3-block w3-border-0" style="outline-style:none">{1}<i style="margin: 2px;" class="fa fa-chevron-down w3-right"></i></button>' +
    '  <div class="w3-hide w3-border-top" style="overflow:auto"></div>' +
    '</div>';
var __counter = 0;
var CollapsibleBox = (function () {
    function CollapsibleBox(titulo, content, onexpand, height) {
        var _this = this;
        if (titulo === void 0) { titulo = 't�tulo'; }
        if (onexpand === void 0) { onexpand = function (sender) { }; }
        if (height === void 0) { height = '10em'; }
        this.loaded = false;
        this.collapsed = true;
        this.onexpand = new core_events_1.CoreEvent('CollapsibleBox.onexpand');
        this._onExpand = function (sender) { };
        this._control = core_1.core.build('div', { innerHTML: __template.format(++__counter, titulo) }, true);
        this._header = this._control.querySelector('button');
        this._body = this._control.querySelector('div');
        this._header.onclick = function (event) {
            _this.collapsed ? _this.expand() : _this.collapse();
        };
        if (height != '-') {
            this._body.style.height = height;
        }
        if (content) {
            this.setContent(content);
        }
        this._onExpand = onexpand;
    }
    CollapsibleBox.create = function (titulo, height) {
        if (titulo === void 0) { titulo = 't�tulo'; }
        if (height === void 0) { height = '10em'; }
        return new CollapsibleBox(titulo, '', undefined, height);
    };
    CollapsibleBox.prototype.hide = function () {
        this.collapse();
        this._header.classList.add('w3-hide');
        return this;
    };
    CollapsibleBox.prototype.show = function () {
        this._header.classList.remove('w3-hide');
        return this;
    };
    CollapsibleBox.prototype.appendTo = function (parent) {
        parent.appendChild(this._control);
        return this;
    };
    CollapsibleBox.prototype.collapse = function () {
        this._body.classList.add('w3-hide');
        var __e = this._header
            .querySelector('i');
        __e.classList.remove('fa-chevron-up');
        __e.classList.add('fa-chevron-down');
        this.collapsed = true;
        return this;
    };
    CollapsibleBox.prototype.expand = function () {
        this._body.classList.remove('w3-hide');
        var __e = this._header
            .querySelector('i');
        __e.classList.remove('fa-chevron-down');
        __e.classList.add('fa-chevron-up');
        if (this._onExpand)
            this._onExpand(this);
        this.onexpand.dispatch(this);
        this.collapsed = false;
        return this;
    };
    CollapsibleBox.prototype.getControl = function () {
        return this._control;
    };
    CollapsibleBox.prototype.getBody = function () {
        return this._body;
    };
    CollapsibleBox.prototype.setContent = function (value) {
        if (core_1.core.isString(value)) {
            this._body.innerHTML = value;
        }
        else {
            this._body.innerHTML = '';
            this._body.appendChild(value);
        }
        return this;
    };
    return CollapsibleBox;
}());
exports.CollapsibleBox = CollapsibleBox;
