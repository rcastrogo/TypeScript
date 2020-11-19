"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesView = void 0;
var app_constants_1 = require("../../app.constants");
var core_1 = require("../../lib/core");
var core_declarative_1 = require("../../lib/core.declarative");
var table_component_1 = require("./table-component");
var tables_view_ts_html_1 = require("./tables-view.ts.html");
var core_include_1 = require("../../lib/core.include");
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
        core_declarative_1.addEventListeners(target, {
            localInnerText: function (e, value, mode) {
                e.innerText = value;
                core_include_1.default('./js/w3codecolor.js')
                    .then(function () { return e.innerHTML = w3CodeColorize(e.innerHTML, mode); });
            }
        }, {});
        var __container = this._content
            .querySelector('[table-container]');
        new table_component_1.ProveedoresPageComponent()
            .renderTo(__container)
            .loadData();
        core_include_1.default('./js/w3codecolor.js')
            .then(function () { return _this.__colorize(); });
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
