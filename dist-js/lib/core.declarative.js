"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEventListeners = void 0;
var core_1 = require("./core");
var core_pub_sub_1 = require("./core.pub-sub");
var EVENTS = ['[on-click]', '[on-publish]', '[route-link]', '[on-change]'];
function addEventListeners(container, handlers, context) {
    var fn = {
        innerHTML: function (e, value) { return e.innerHTML = value; },
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
            // =============================================================
            // on-click
            // =============================================================
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
            // =============================================================
            // on-publish
            // =============================================================
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
                            f.apply(context, [e, data]);
                        return;
                    }
                    else {
                        fn.innerHTML(e, data);
                    }
                });
            }
            // =============================================================
            // route-link
            // =============================================================
            if (index === 2) {
                e.onclick = function (e) {
                    //             let router = context.router;
                    //             let route = router.normalizePath(e.target.href);
                    //             if (router.current != route) {
                    //               try {
                    //                 router.navigateTo(route);
                    //               } catch (error) {
                    //                 console.log(error);
                    //               }
                    //             }
                    return false;
                };
            }
            // ====================================================================
            // on-change
            // ====================================================================
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
            }
        });
    });
}
exports.addEventListeners = addEventListeners;
