"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appComponent = void 0;
var app_component_ts_html_1 = require("./app-component.ts.html");
var core_1 = require("./lib/core");
var core_declarative_1 = require("./lib/core.declarative");
var commands_view_1 = require("./samples/commands/commands-view");
var pub_sub_view_1 = require("./samples/pub-sub/pub-sub-view");
var tabbly_reports_js_view_1 = require("./samples/tabbly-reports-js/tabbly-reports-js-view");
var tabbly_reports_v2_view_1 = require("./samples/tabbly-reports-v2/tabbly-reports-v2-view");
var tabbly_reports_view_1 = require("./samples/tabbly-reports/tabbly-reports-view");
var tables_view_1 = require("./samples/tables/tables-view");
var content_editable_view_1 = require("./samples/content-editable/content-editable-view");
var app_constants_1 = require("./app.constants");
function appComponent(container) {
    var _config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
    container.innerHTML = app_component_ts_html_1.default;
    core_declarative_1.addEventListeners(container, {
        openLink: function (sender, event, viewId) {
            document.querySelectorAll('.city')
                .toArray()
                .forEach(function (e) { return e.style.display = e.id == viewId ? 'block' : 'none'; });
            document.querySelectorAll('.tablink')
                .toArray()
                .forEach(function (e) { return e.classList.remove('w3-red'); });
            sender.className += " w3-red";
            var __view_container = core_1.core.$(viewId);
            if (viewId == 'VIEW-COMMANDS')
                new commands_view_1.CommandsView().render(__view_container);
            if (viewId == 'VIEW-PUB-SUB')
                new pub_sub_view_1.PubSubView().render(__view_container);
            if (viewId == 'VIEW-TABLES')
                new tables_view_1.TablesView().render(__view_container);
            if (viewId == 'VIEW-REPORTS')
                new tabbly_reports_view_1.TabblyReportsView().render(__view_container);
            if (viewId == 'VIEW-REPORTS-V2')
                new tabbly_reports_v2_view_1.TabblyReportsV2View().render(__view_container);
            if (viewId == 'VIEW-REPORTS-JS')
                new tabbly_reports_js_view_1.TabblyReportsJsView().render(__view_container);
            if (viewId == 'VIEW-CONTENT-EDITABLE')
                new content_editable_view_1.ContentEditableView().render(__view_container);
        }
    }, {});
    _config.write('LastUsed', Date.now.toString());
}
exports.appComponent = appComponent;
