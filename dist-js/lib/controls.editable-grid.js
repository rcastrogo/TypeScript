"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableGrid = void 0;
var core_pub_sub_1 = require("./core.pub-sub");
var EditableGrid = (function () {
    function EditableGrid(table, onFocus, onChange) {
        var _this = this;
        this.currentIndex = -1;
        this.previous = undefined;
        this.table = table;
        var __onfocus = function (e) {
            var __div = e.target;
            var __td = __div.parentNode;
            var __tr = __td.parentNode;
            _this.previous = __div.textContent.trim();
            _this.currentIndex = __tr.rowIndex;
            var __eventArg = {
                tr: __tr,
                td: __td,
                target: __div,
                current: _this.previous
            };
            core_pub_sub_1.default.publish(EditableGrid.OnfocusMessage, __eventArg);
            if (onFocus)
                onFocus(_this, __eventArg);
        };
        var __onblur = function (e) {
            var __div = e.target;
            var __td = __div.parentNode;
            var __tr = __td.parentNode;
            if (_this.previous != undefined &&
                _this.previous != __td.textContent.trim()) {
                var __eventArg = {
                    tr: __tr,
                    td: __td,
                    target: __div,
                    previous: _this.previous,
                    current: __div.textContent.trim()
                };
                core_pub_sub_1.default.publish(EditableGrid.OnChangeMessage, __eventArg);
                if (onChange)
                    onChange(_this, __eventArg);
                _this.previous = undefined;
            }
            ;
            __div.style.outline = '1px solid transparent';
        };
        table.querySelectorAll('td div[contenteditable]')
            .toArray()
            .forEach(function (e) {
            e.onblur = __onblur;
            e.onfocus = __onfocus;
        });
        table.onkeypress = function (e) {
            if (e.keyCode == 13) {
                if (e.preventDefault)
                    e.preventDefault();
                return false;
            }
        };
        table.onkeydown = function (e) {
            var __res = true;
            var __sender = e.target;
            if (__sender.tagName == 'DIV' && [13, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                var __div = __sender;
                var __td = __div.parentNode;
                var __row = __td.parentNode;
                var __pos = window.getSelection().getRangeAt(0).startOffset;
                var __focus = function (t, r, c) {
                    e.preventDefault();
                    try {
                        t.rows[r].cells[c].firstElementChild.focus();
                    }
                    catch (e) { }
                    __res = false;
                };
                if (e.keyCode == 13)
                    __focus(table, __row.rowIndex, __td.cellIndex + 1);
                if (e.keyCode == 38 && __row.rowIndex > 1)
                    __focus(table, __row.rowIndex - 1, __td.cellIndex);
                if (e.keyCode == 40 && __row.rowIndex < table.rows.length - 1)
                    __focus(table, __row.rowIndex + 1, __td.cellIndex);
                if (e.keyCode == 39 && __pos == __sender.textContent.length)
                    __focus(table, __row.rowIndex, __td.cellIndex + 1);
                if (e.keyCode == 37 && __pos == 0)
                    __focus(table, __row.rowIndex, __td.cellIndex - 1);
            }
            return __res;
        };
    }
    EditableGrid.OnfocusMessage = 'editable-grid/focus';
    EditableGrid.OnChangeMessage = 'editable-grid/change';
    return EditableGrid;
}());
exports.EditableGrid = EditableGrid;
