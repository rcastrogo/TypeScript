"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var includes = [];
function include(url) {
    return new Promise(function (resolve) {
        function __resolve() {
            includes.push(url.toLowerCase());
            resolve(null);
        }
        if (includes.indexOf(url.toLowerCase()) > -1) {
            resolve(null);
            return;
        }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = function () {
            includes.push(url.toLowerCase());
            resolve(function () {
                document.getElementsByTagName("head")[0]
                    .removeChild(script);
                includes.remove(url.toLowerCase());
            });
        };
        script.src = url;
        document.getElementsByTagName("head")[0]
            .appendChild(script);
    });
}
exports.default = include;
