"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableGrid = void 0;
var core_pub_sub_1 = require("./core.pub-sub");
var EditableGrid = /** @class */ (function () {
    function EditableGrid(table, onFocus, onChange) {
        var _this = this;
        this.currentIndex = -1;
        this.previous = undefined;
        this.table = table;
        // =======================================================
        // Onfocus
        // =======================================================
        var __onfocus = function (e) {
            var __td = e.target;
            var __tr = __td.parentNode;
            _this.previous = __td.textContent.trim();
            _this.currentIndex = __tr.rowIndex;
            var __eventArg = {
                tr: __tr,
                td: __td,
                target: __td,
                current: _this.previous
            };
            core_pub_sub_1.default.publish(EditableGrid.OnfocusMessage, __eventArg);
            if (onFocus)
                onFocus(_this, __eventArg);
        };
        // =======================================================
        // Onblur
        // =======================================================
        var __onblur = function (e) {
            var __td = e.target;
            var __tr = __td.parentNode;
            if (_this.previous != undefined &&
                _this.previous != __td.textContent.trim()) {
                var __eventArg = {
                    tr: __tr,
                    td: __td,
                    target: __td,
                    previous: _this.previous,
                    current: __td.textContent.trim()
                };
                core_pub_sub_1.default.publish(EditableGrid.OnChangeMessage, __eventArg);
                if (onChange)
                    onChange(_this, __eventArg);
                _this.previous = undefined;
            }
            ;
        };
        // =======================================================
        // Celdas editables
        // =======================================================
        table.querySelectorAll('td[contenteditable]')
            .toArray()
            .forEach(function (e) {
            e.onblur = __onblur;
            e.onfocus = __onfocus;
        });
        // =======================================================
        // onkeypress : Evitar multiples l�neas
        // =======================================================
        table.onkeypress = function (e) {
            if (e.keyCode == 13) {
                if (e.preventDefault)
                    e.preventDefault();
                return false;
            }
        };
        // =======================================================================================================================
        // onkeydown : Cambio de celda activa
        // =======================================================================================================================
        table.onkeydown = function (e) {
            var __res = true;
            var __sender = e.target;
            if (__sender.tagName == 'TD' && [13, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                var __td = __sender;
                var __row = __sender.parentNode;
                var __pos = window.getSelection().getRangeAt(0).startOffset;
                var __focus = function (t, r, c) {
                    e.preventDefault();
                    try {
                        t.rows[r].cells[c].focus();
                    }
                    catch (e) { }
                    __res = false;
                };
                if (e.keyCode == 13)
                    __focus(table, __row.rowIndex, __td.cellIndex + 1); // Next
                if (e.keyCode == 38 && __row.rowIndex > 1)
                    __focus(table, __row.rowIndex - 1, __td.cellIndex); // Up
                if (e.keyCode == 40 && __row.rowIndex < table.rows.length - 1)
                    __focus(table, __row.rowIndex + 1, __td.cellIndex); // Down                         
                if (e.keyCode == 39 && __pos == __sender.textContent.length)
                    __focus(table, __row.rowIndex, __td.cellIndex + 1); // Right
                if (e.keyCode == 37 && __pos == 0)
                    __focus(table, __row.rowIndex, __td.cellIndex - 1); // Left
            }
            return __res;
        };
    }
    EditableGrid.OnfocusMessage = 'editable-grid/focus';
    EditableGrid.OnChangeMessage = 'editable-grid/change';
    return EditableGrid;
}());
exports.EditableGrid = EditableGrid;
