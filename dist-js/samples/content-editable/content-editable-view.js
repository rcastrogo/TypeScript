"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentEditableView = void 0;
var app_constants_1 = require("@src/../app.constants");
var controls_collapsible_box_1 = require("@src/controls.collapsible-box");
var grid = require("@src/controls.editable-grid");
var controls_text_viewer_1 = require("@src/controls.text-viewer");
var core_1 = require("@src/core");
var core_ajax_1 = require("@src/core.ajax");
var core_declarative_1 = require("@src/core.declarative");
var core_pub_sub_1 = require("@src/core.pub-sub");
var core_templates_1 = require("@src/core.templates");
var content_editable_view_ts_html_1 = require("./content-editable-view.ts.html");
var ContentEditableView = (function () {
    function ContentEditableView() {
        this._config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
        this._data = [
            { id: 1, descripcion: 'Descripción 1' },
            { id: 2, descripcion: 'Descripción 2' },
            { id: 3, descripcion: 'Descripción 3' }
        ];
        this._config.write('ContentEditableView', Date.now.toString());
        this._textViewer = new controls_text_viewer_1.TextViewer();
    }
    ContentEditableView.prototype.render = function (target) {
        var _this = this;
        this._content = core_1.core.build('div', { innerHTML: content_editable_view_ts_html_1.default }, true);
        target.innerHTML = '';
        target.appendChild(this._content);
        core_templates_1.fillTemplate(target, { data: this._data });
        core_declarative_1.addEventListeners(target, {
            writeLog: function (e, value, mode) {
                if (mode && mode == 'append')
                    return e.innerHTML += value + '<br/>';
                e.innerHTML = value;
            },
            doSave: function () {
                var data = target.querySelectorAll('td div[data-index]')
                    .toArray()
                    .map(function (c) { return c.textContent; })
                    .split(2)
                    .map(function (cells, i) {
                    return { source: _this._data[i],
                        edit: { id: cells[0],
                            descripcion: cells[1] } };
                });
                core_pub_sub_1.default.publish('msg/log', JSON.stringify(data, null, 2));
            }
        }, {});
        var __table = target.querySelector('table');
        this._editableGrid = new grid.EditableGrid(__table, function (sender, event) {
            event.target.style.outline = '1px solid gray';
            var message = 'onfocus -> [{target.dataset.index}, {td.cellIndex}] id: {tr.id}';
            core_pub_sub_1.default.publish('msg/log', message.format(event));
        }, function (sender, event) {
            var message = 'onChange -> [{target.dataset.index}, {td.cellIndex}] ' +
                'id: {tr.id} [ {previous} -> {current}]';
            core_pub_sub_1.default.publish('msg/log', message.format(event));
        });
        target.querySelector('[text-viewer]')
            .appendChild(this._textViewer.getControl());
        core_ajax_1.ajax.get('./js/pro-0001.txt')
            .then(function (res) {
            _this._textViewer.setContent(res);
            _this._textViewer.onclick.add(function (sender, args) {
                console.log(sender, args);
            });
        });
        var c = new controls_collapsible_box_1.CollapsibleBox('Mensajes').appendTo(this._content)
            .setContent(this._content
            .querySelector('[log]'));
        c.onexpand.add(function (eventName, sender) {
        });
        c.getControl().classList.add('w3-margin');
        setTimeout(function () { return c.expand(); }, 5000);
    };
    return ContentEditableView;
}());
exports.ContentEditableView = ContentEditableView;
