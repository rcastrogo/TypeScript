"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabblyReportsV2View = void 0;
var app_constants_1 = require("../../app.constants");
var core_1 = require("../../lib/core");
var core_ajax_1 = require("../../lib/core.ajax");
var core_declarative_1 = require("../../lib/core.declarative");
var core_tabbly_v2_engine_1 = require("../../lib/core.tabbly.v2.engine");
var core_tabbly_v2_loader_1 = require("../../lib/core.tabbly.v2.loader");
var tabbly_reports_v2_view_ts_html_1 = require("./tabbly-reports-v2-view.ts.html");
var core_include_1 = require("../../lib/core.include");
var core_pub_sub_1 = require("../../lib/core.pub-sub");
var TabblyReportsV2View = /** @class */ (function () {
    // ============================================================
    // Constructor
    // ============================================================
    function TabblyReportsV2View() {
        this._config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
        this._config.write('TabblyReportsV2View', Date.now.toString());
        this._content = core_1.core.build('div', { innerHTML: tabbly_reports_v2_view_ts_html_1.default }, true);
    }
    // ============================================================
    // Render
    // ============================================================
    TabblyReportsV2View.prototype.render = function (target) {
        var _this = this;
        target.innerHTML = '';
        target.appendChild(this._content);
        core_declarative_1.addEventListeners(target, {
            innerText: function (e, value) {
                e.innerText = value;
                e.innerHTML = w3CodeColorize(e.innerHTML, 'js');
            }
        }, {});
        this.__loadReport(this._content.querySelector('[report-container]'));
        core_include_1.default('./js/w3codecolor.js')
            .then(function () { return _this.__colorize(); });
    };
    TabblyReportsV2View.prototype.__colorize = function () {
        this._content
            .querySelectorAll('.jsHigh,.htmlHigh')
            .toArray()
            .map(function (e) { return ({ e: e, mode: e.classList.contains('jsHigh') ? 'js' : 'html' }); })
            .forEach(function (e) { return e.e.innerHTML = w3CodeColorize(e.e.innerHTML, e.mode); });
    };
    TabblyReportsV2View.prototype.__loadReport = function (target) {
        /* ==========================================================================
        // Receptor de mensajes
        // ========================================================================== */
        var __handler = {
            buffer: '',
            send: function (data) { this.buffer += data; },
            message: function (message) {
                //console.log(message); 
            },
            flush: function () { },
            clear: function () { this.buffer = ''; }
        };
        // =============================================================================
        // Definición del informe
        // =============================================================================
        core_ajax_1.ajax.get('./js/pro-0001-v2.txt')
            .then(function (res) {
            var __rd = core_tabbly_v2_loader_1.loader.load(res);
            core_pub_sub_1.default.publish('msg/rpt/definition', res);
            // =======================================================================
            // Datos del informe
            // =======================================================================
            core_ajax_1.ajax.get('./js/data/proveedores.json')
                .then(function (res) {
                new core_tabbly_v2_engine_1.ReportEngine().generateReport(__rd, JSON.parse(res), __handler);
                target.append(core_1.core.build('div', { innerHTML: __handler.buffer }));
                core_declarative_1.addEventListeners(target, {}, __rd.getContext());
                core_pub_sub_1.default.publish('msg/rpt/data', JSON.stringify(JSON.parse(res), null, 2));
            });
        });
    };
    return TabblyReportsV2View;
}());
exports.TabblyReportsV2View = TabblyReportsV2View;
