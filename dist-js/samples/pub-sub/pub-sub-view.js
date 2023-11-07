"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubView = void 0;
var app_constants_1 = require("../../app.constants");
var core_1 = require("../../lib/core");
var core_declarative_1 = require("../../lib/core.declarative");
var core_pub_sub_1 = require("../../lib/core.pub-sub");
var pub_sub_view_ts_html_1 = require("./pub-sub-view.ts.html");
var core_include_1 = require("../../lib/core.include");
var PubSubView = (function () {
    function PubSubView() {
        this._config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
        this._config.write('PubSubView', Date.now.toString());
    }
    PubSubView.prototype.render = function (target) {
        var _this = this;
        this._content = core_1.core.build('div', { innerHTML: pub_sub_view_ts_html_1.default }, true);
        target.innerHTML = '';
        target.appendChild(this._content);
        (0, core_declarative_1.addEventListeners)(target, {
            doPublish: function () {
                core_pub_sub_1.default.publish(core_pub_sub_1.default.TOPICS.NOTIFICATION, 'Botón doPublish');
                setTimeout(function () {
                    core_pub_sub_1.default.publish(core_pub_sub_1.default.TOPICS.NOTIFICATION, '');
                }, 2000);
            }
        }, {});
        (0, core_include_1.default)('./js/w3codecolor.js')
            .then(function () { return _this.__colorize(); });
    };
    PubSubView.prototype.__colorize = function () {
        this._content
            .querySelectorAll('.jsHigh,.htmlHigh')
            .toArray()
            .map(function (e) { return ({ e: e, mode: e.classList.contains('jsHigh') ? 'js' : 'html' }); })
            .forEach(function (e) { return e.e.innerHTML = w3CodeColorize(e.e.innerHTML, e.mode); });
    };
    return PubSubView;
}());
exports.PubSubView = PubSubView;
