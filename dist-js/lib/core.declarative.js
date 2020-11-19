"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEventListeners = void 0;
var tslib_1 = require("tslib");
var core_1 = require("./core");
var core_pub_sub_1 = require("./core.pub-sub");
var EVENTS = ['[on-click]', '[on-publish]', '[route-link]', '[on-change]'];
function addEventListeners(container, handlers, context) {
    var fn = {
        innerHTML: function (e, value, mode) { return e.innerHTML = value; },
        innerText: function (e, value, mode) { return e.innerText = value; },
        className: function (e, value) { return e.className = value; }
    };
    EVENTS.forEach(function (selector, index) {
        container
            .querySelectorAll(selector)
            .toArray()
            .concat([container])
            .forEach(function (e) {
            var name = selector.replace('[', '').replace(']', '');
            if (!e.attributes.getNamedItem(name))
                return;
            var value = e.attributes.getNamedItem(name).value;
            var tokens = value.split(':');
            if (index === 0) {
                var fn_1 = handlers[tokens[0]] ||
                    core_1.core.getValue(tokens[0], context);
                e.onclick = function (event) {
                    var _args = tokens.slice(1)
                        .reduce(function (a, p) {
                        a.push(p.charAt(0) == '@'
                            ? core_1.core.getValue(p.slice(1), context)
                            : p);
                        return a;
                    }, [e, event]);
                    return fn_1.apply(context, _args);
                };
                return;
            }
            if (index === 1) {
                var topic = core_1.core.getValue(tokens[0], core_pub_sub_1.default);
                topic = topic === window ? tokens[0] : topic;
                core_pub_sub_1.default.subscribe(topic, function (message, data) {
                    var fnName = tokens[1];
                    if (fnName) {
                        var f = fn[fnName] ||
                            handlers[fnName] ||
                            core_1.core.getValue(fnName, context);
                        if (f)
                            f.apply(context, tslib_1.__spreadArrays([e, data], tokens.slice(2)));
                        return;
                    }
                    else {
                        fn.innerHTML(e, data, tokens[1]);
                    }
                });
            }
            if (index === 2) {
                e.onclick = function (e) {
                    return false;
                };
            }
            if (index === 3) {
                var select = e.tagName === 'SELECT';
                if (value === 'publish') {
                    if (select)
                        e.onchange = function () { return core_pub_sub_1.default.publish(core_pub_sub_1.default.TOPICS.VALUE_CHANGE, e); };
                    else
                        e.oninput = function () { return core_pub_sub_1.default.publish(core_pub_sub_1.default.TOPICS.VALUE_CHANGE, e); };
                    return;
                }
                var fn_2 = handlers[value] ||
                    core_1.core.getValue(value, context);
                if (select)
                    e.onchange = function () { return fn_2.apply(context, [e]); };
                else
                    e.oninput = function () { return fn_2.apply(context, [e]); };
                e.onblur = function () { return fn_2.apply(context, [e]); };
            }
        });
    });
}
exports.addEventListeners = addEventListeners;
