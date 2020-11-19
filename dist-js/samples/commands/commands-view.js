"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsView = void 0;
var commands_view_ts_html_1 = require("./commands-view.ts.html");
var core_1 = require("@src/core");
var core_declarative_1 = require("@src/core.declarative");
var core_commands_1 = require("@src/core.commands");
var app_constants_1 = require("@src/../app.constants");
var core_include_1 = require("@src/core.include");
var CommandsView = (function () {
    function CommandsView() {
        this._config = core_1.core.config(app_constants_1.Constants.APP_CONFIG_NAME);
        this._document = { name: 'Valor inicial' };
        this._commandManager = core_commands_1.CommandManager(this._document);
        this._config.write('CommandsView', Date.now.toString());
    }
    CommandsView.prototype.render = function (target) {
        var _this = this;
        this._content = core_1.core.build('div', { innerHTML: commands_view_ts_html_1.default }, true);
        target.innerHTML = '';
        target.appendChild(this._content);
        core_declarative_1.addEventListeners(target, {
            doCommand: function () {
                _this._document.name = 'Valor inicial';
                var __container = _this._content.querySelector('[message-container]');
                __container.innerHTML = _this._document.name + '<br/>';
                _this._commandManager.executeCommad(ToUpperCaseCommand());
                __container.innerHTML += _this._document.name + '<br/>';
                _this._commandManager.undo();
                __container.innerHTML += _this._document.name + '<br/>';
                _this._commandManager.redo();
                __container.innerHTML += _this._document.name + '<br/>';
            }
        }, {});
        core_include_1.default('./js/w3codecolor.js')
            .then(function () { return _this.__colorize(); });
    };
    CommandsView.prototype.__colorize = function () {
        this._content
            .querySelectorAll('.jsHigh,.htmlHigh')
            .toArray()
            .map(function (e) { return ({ e: e, mode: e.classList.contains('jsHigh') ? 'js' : 'html' }); })
            .forEach(function (e) { return e.e.innerHTML = w3CodeColorize(e.e.innerHTML, e.mode); });
    };
    return CommandsView;
}());
exports.CommandsView = CommandsView;
function ToUpperCaseCommand() {
    var __command = {
        bak: '',
        execute: function (doc) {
            this.bak = doc.name;
            doc.name = doc.name.toUpperCase();
            return __command;
        },
        undo: function (doc) {
            doc.name = this.bak;
            return __command;
        }
    };
    return __command;
}
