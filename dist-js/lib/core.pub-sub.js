"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var topics = new Map();
var subUid = -1;
var subscribe = function (topic, func) {
    if (!topics.has(topic)) {
        topics.set(topic, []);
    }
    var token = (++subUid).toString();
    topics.get(topic).push({
        token: token,
        func: func
    });
    return token;
};
var publish = function (topic) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!topics.has(topic)) {
        return false;
    }
    setTimeout(function () {
        var _a;
        var subscribers = topics.get(topic);
        var len = subscribers ? subscribers.length : 0;
        while (len--) {
            (_a = subscribers[len]).func.apply(_a, tslib_1.__spreadArray([topic], args, false));
        }
    }, 0);
    return true;
};
var unsubscribe = function (token) {
    for (var m in topics.keys) {
        var subscribers = topics.get(m);
        if (subscribers) {
            for (var i = 0, j = subscribers.length; i < j; i++) {
                if (subscribers[i].token === token) {
                    subscribers.splice(i, 1);
                    return token;
                }
            }
        }
    }
    return false;
};
exports.default = {
    subscribe: subscribe,
    publish: publish,
    unsubscribe: unsubscribe,
    TOPICS: {
        VIEW_CHANGE: 'view:change',
        VALUE_CHANGE: 'value:change',
        MUNICIPIO_CHANGE: 'municipio:change',
        WINDOW_SCROLL: 'window.scroll',
        WINDOW_RESIZE: 'window.resize',
        NOTIFICATION: 'notification.show'
    }
};
