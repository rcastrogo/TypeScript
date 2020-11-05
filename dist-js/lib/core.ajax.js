"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajax = void 0;
var ajax = {
    get: function (url, interceptor) {
        return new Promise((resolve, reject) => {
            var xml = ajax.createXMLHttpRequest();
            xml.open('GET', url, true);
            if (interceptor)
                interceptor(xml);
            xml.onreadystatechange = function () {
                if (xml.readyState == 4) {
                    resolve(xml.responseText);
                }
            };
            xml.onerror = function (e) { reject(e); };
            xml.send(null);
        });
    },
    post: function (url, body, interceptor) {
        return new Promise((resolve, reject) => {
            var xml = ajax.createXMLHttpRequest();
            xml.open('POST', url, true);
            if (interceptor) {
                interceptor(xml);
            }
            else {
                xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset:ISO-8859-1');
            }
            xml.onreadystatechange = function () { if (xml.readyState == 4)
                resolve(xml.responseText); };
            xml.send(body);
        });
    },
    callWebMethod: function (url, body, callBack) {
        var xml = ajax.createXMLHttpRequest();
        xml.open('POST', url, true);
        xml.onreadystatechange = function () { if (xml.readyState == 4)
            callBack(xml.responseText); };
        xml.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xml.send(body);
    },
    createXMLHttpRequest: function () {
        return new XMLHttpRequest();
    }
};
exports.ajax = ajax;
//# sourceMappingURL=core.ajax.js.map