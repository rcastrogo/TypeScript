"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabblyReportsView = void 0;
var app_constants_1 = require("../../app.constants");
var core_1 = require("../../lib/core");
var core_ajax_1 = require("../../lib/core.ajax");
var core_declarative_1 = require("../../lib/core.declarative");
var core_tabbly_engine_1 = require("../../lib/core.tabbly.engine");
var core_tabbly_loader_1 = require("../../lib/core.tabbly.loader");
var tabbly_reports_view_ts_html_1 = require("./tabbly-reports-view.ts.html");
var core_include_1 = require("../../lib/core.include");
var core_pub_sub_1 = require("../../lib/core.pub-sub");
var TabblyReportsView = /** @class */ (function () {
    // ============================================================
    // Constructor
    // ============================================================
    function TabblyReportsView() {
        this._config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
        this._config.write('TabblyReportsView', Date.now.toString());
        this._content = core_1.core.build('div', { innerHTML: tabbly_reports_view_ts_html_1.default }, true);
    }
    // ============================================================
    // Render
    // ============================================================
    TabblyReportsView.prototype.render = function (target) {
        var _this = this;
        target.innerHTML = '';
        target.appendChild(this._content);
        core_declarative_1.addEventListeners(target, {
            localInnerText: function (e, value) {
                e.innerText = value;
                e.innerHTML = w3CodeColorize(e.innerHTML, 'js');
            }
        }, {});
        this.__loadReport(this._content.querySelector('[report-container]'));
        core_include_1.default('./js/w3codecolor.js')
            .then(function () { return _this.__colorize(); });
    };
    TabblyReportsView.prototype.__colorize = function () {
        this._content
            .querySelectorAll('.jsHigh,.htmlHigh')
            .toArray()
            .map(function (e) { return ({ e: e, mode: e.classList.contains('jsHigh') ? 'js' : 'html' }); })
            .forEach(function (e) { return e.e.innerHTML = w3CodeColorize(e.e.innerHTML, e.mode); });
    };
    TabblyReportsView.prototype.__loadReport = function (target) {
        // ==========================================================================
        // Definición del informe
        // ==========================================================================
        core_ajax_1.ajax.get('./js/pro-0001.txt')
            .then(function (res) {
            var __rd = core_tabbly_loader_1.loader.load(res);
            core_pub_sub_1.default.publish('msg/rpt/definition', res);
            // ====================================================================
            // Datos del informe
            // ====================================================================
            core_ajax_1.ajax.get('./js/data/proveedores.json')
                .then(function (res) {
                core_pub_sub_1.default.publish('msg/rpt/data', JSON.stringify(JSON.parse(res), null, 2));
                new core_tabbly_engine_1.ReportEngine()
                    .fromReportDefinition(__rd, JSON.parse(res), function (html) {
                    target.append(core_1.core.build('div', { innerHTML: html }, true));
                    core_declarative_1.addEventListeners(target, {}, __rd.getContext());
                });
            });
        });
    };
    return TabblyReportsView;
}());
exports.TabblyReportsView = TabblyReportsView;
