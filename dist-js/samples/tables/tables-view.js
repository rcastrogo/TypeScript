"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesView = void 0;
var app_constants_1 = require("../../app.constants");
var core_1 = require("../../lib/core");
var core_declarative_1 = require("../../lib/core.declarative");
var table_component_1 = require("./table-component");
var tables_view_ts_html_1 = require("./tables-view.ts.html");
var core_include_1 = require("../../lib/core.include");
var controls_collapsible_box_1 = require("../../lib/controls.collapsible-box");
var list_view_component_1 = require("./list-view-component");
var TablesView = (function () {
    function TablesView() {
        this._config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
        this._config.write('TablesView', Date.now.toString());
        this._content = core_1.core.build('div', { innerHTML: tables_view_ts_html_1.default }, true);
    }
    TablesView.prototype.render = function (target) {
        var _this = this;
        target.innerHTML = '';
        target.appendChild(this._content);
        (0, core_declarative_1.addEventListeners)(target, {
            localInnerText: function (e, value, mode) {
                e.innerText = value;
                (0, core_include_1.default)('./js/w3codecolor.js')
                    .then(function () { return e.innerHTML = w3CodeColorize(e.innerHTML, mode); });
            }
        }, {});
        new table_component_1.ProveedoresPageComponent()
            .renderTo(core_1.core.element('[table-container]', this._content))
            .loadData();
        controls_collapsible_box_1.CollapsibleBox.create('Listview', '-')
            .appendTo(core_1.core.element('[list-view-container]', this._content))
            .onexpand.add(this.__loadListview);
        (0, core_include_1.default)('./js/w3codecolor.js')
            .then(function () { return _this.__colorize(); });
    };
    TablesView.prototype.__loadListview = function (event, sender) {
        if (sender.loaded)
            return;
        sender.loaded = true;
        new list_view_component_1.ListViewComponent()
            .renderTo(sender.getBody())
            .loadData();
    };
    TablesView.prototype.__colorize = function () {
        this._content
            .querySelectorAll('.js')
            .toArray()
            .forEach(function (e) { return e.innerHTML = w3CodeColorize(e.innerHTML, 'js'); });
    };
    return TablesView;
}());
exports.TablesView = TablesView;
