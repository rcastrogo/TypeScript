(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pol = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

let __core = require('./core');

__core.ajax   = require('./core.ajax');
__core.commands    = require('./core.commands');
__core.declarative = require('./core.declarative');
__core.dialogs     = require('./core.dialogs');
__core.include     = require('./core.include');
__core.paginator   = require('./core.paginator');
__core.pubSub      = require('./core.pub-sub');
__core.templates   = require('./core.templates');
__core.reportLoader = require('./core.tabbly.engine');
__core.reportEngine = require('./core.tabbly.loader');
__core.jsReportLoader = require('./core.tabbly.v2.engine');
__core.jsReportEngine = require('./core.tabbly.v2.loader');

module.exports = __core;

},{"./core":7,"./core.ajax":2,"./core.commands":3,"./core.declarative":4,"./core.dialogs":5,"./core.include":6,"./core.paginator":8,"./core.pub-sub":9,"./core.tabbly.engine":10,"./core.tabbly.loader":11,"./core.tabbly.v2.engine":12,"./core.tabbly.v2.loader":13,"./core.templates":14}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajax = void 0;
var ajax = {
    get: function (url, interceptor) {
        return new Promise(function (resolve, reject) {
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
        return new Promise(function (resolve, reject) {
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

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
function CommandManager(doc) {
    var _this = {
        getDocument: function () { return doc; },
        undos: new Array(),
        redos: new Array(),
        clear: function () {
            _this.undos.length = 0;
            _this.redos.length = 0;
        },
        /**
         * Ejecuta un comando sobre el documento
         * @param command Comando a ejecutar
         */
        executeCommad: function (command) {
            try {
                _this.undos.push(command.execute(doc));
                _this.redos.length = 0;
            }
            catch (e) {
                console.error(e);
            }
        },
        /**
         * Deshace los cambios realizados en el documento por el �ltimo comamdo
         * */
        undo: function () {
            if (_this.undos.length > 0) {
                _this.redos.push(_this.undos
                    .pop()
                    .undo(doc));
            }
        },
        /**
         * Vuelve a ejecutar el �ltimo comando sobre el documento
         * */
        redo: function () {
            if (_this.redos.length > 0) {
                _this.undos.push(_this.redos
                    .pop()
                    .execute(doc));
            }
        }
    };
    return _this;
}
exports.CommandManager = CommandManager;
;

},{}],4:[function(require,module,exports){
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
                            f.apply(context, tslib_1.__spreadArrays([e, data], tokens.slice(2)));
                        return;
                    }
                    else {
                        fn.innerHTML(e, data, tokens[1]);
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
                e.onblur = function () { return fn_2.apply(context, [e]); };
            }
        });
    });
}
exports.addEventListeners = addEventListeners;

},{"./core":7,"./core.pub-sub":9,"tslib":15}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogHelper = void 0;
var DialogHelper = /** @class */ (function () {
    function DialogHelper() {
    }
    DialogHelper.getWrapper = function (id) {
        var __container = document.getElementById(id);
        var __dlg = { container: __container, title: __container.querySelector('.js-title'),
            body: __container.querySelector('.js-content'),
            closeButton: __container.querySelector('.js-close-button'),
            acceptButton: __container.querySelector('.js-accept-button'), close: function () {
                __container.style.display = 'none';
                return __dlg;
            }, show: function (onConfirm) {
                if (onConfirm) {
                    __dlg.acceptButton.onclick = function () {
                        onConfirm(__dlg);
                    };
                }
                __container.style.display = 'block';
                return __dlg;
            },
            init: function (onInit) {
                if (onInit)
                    onInit(__dlg);
                return __dlg;
            },
            setTitle: function (title) {
                __dlg.title.innerHTML = title;
                return __dlg;
            },
            setBody: function (content) {
                if (content.tagName) {
                    __dlg.body.innerHTML = '';
                    __dlg.body.appendChild(content);
                }
                else {
                    __dlg.body.innerHTML = content;
                }
                return __dlg;
            },
            disableClickOutside: function () {
                __dlg.container.onclick = function () { };
                return __dlg;
            }
        };
        __dlg.acceptButton.onclick = __dlg.close;
        __dlg.closeButton.onclick = __dlg.close;
        __dlg.container.onclick = function (sender) { if (sender.target === __dlg.container)
            __dlg.close(); };
        return __dlg;
    };
    return DialogHelper;
}());
exports.DialogHelper = DialogHelper;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var includes = [];
function include(url) {
    return new Promise(function (resolve) {
        function __resolve() {
            includes.push(url.toLowerCase());
            resolve();
        }
        if (includes.indexOf(url.toLowerCase()) > -1) {
            resolve();
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

},{}],7:[function(require,module,exports){
"use strict";
// ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.core = void 0;
var tslib_1 = require("tslib");
var Core = /** @class */ (function () {
    function Core() {
    }
    Core.prototype.isNull = function (v) { return v === null; };
    Core.prototype.toArray = function (v) { return Array.from(v); };
    Core.prototype.isArray = function (v) { return Array.isArray(v); };
    Core.prototype.isString = function (v) { return typeof v == 'string'; };
    Core.prototype.isBoolean = function (v) { return typeof v == 'boolean'; };
    Core.prototype.isNumber = function (v) { return typeof v == 'number'; };
    Core.prototype.isFunction = function (v) { return typeof v == 'function'; };
    Core.prototype.isObject = function (v) { return v && typeof v == 'object'; };
    Core.prototype.apply = function (a, b, d) {
        if (d)
            this.apply(a, d);
        if (a && b && this.isObject(b)) {
            for (var p in b) {
                if (this.isArray(b[p])) {
                    a[p] = this.clone(b[p]);
                }
                else if (this.isObject(b[p])) {
                    this.apply(a[p] = a[p] || {}, b[p]); // apply(o[p], c[p] 
                }
                else {
                    a[p] = b[p];
                }
            }
        }
        return a;
    };
    ;
    Core.prototype.clone = function (o) {
        var _this = this;
        if (this.isArray(o))
            return o.slice(0);
        if (this.isObject(o) && o.clone)
            return o.clone();
        if (this.isObject(o)) {
            return Object.keys(o)
                .reduce(function (a, k) {
                a[k] = _this.clone(o[k]);
                return a;
            }, {});
        }
        return o;
    };
    Core.prototype.join = function (items, property, separator) {
        return items.reduce(function (a, o) { return a.append(o[property || 'id']); }, [])
            .join(separator === undefined ? '-' : (separator || ''));
    };
    Core.prototype.createStringBuilder = function (s) {
        return { value: s || '', append: function (s) { this.value = this.value + s; return this; },
            appendLine: function (s) { this.value = this.value + (s || '') + '\n'; return this; } };
    };
    Core.prototype.$ = function (e, control) {
        var __element = document.getElementById(e);
        if (__element)
            return __element;
        var __targets;
        if (control)
            __targets = control.querySelectorAll(e);
        else
            __targets = document.querySelectorAll(e);
        if (__targets.length)
            return __targets.toArray();
        return null;
    };
    ;
    Core.prototype.build = function (tagName, options, firstElementChild) {
        var o = this.isString(options) ? { innerHTML: options } : options;
        var e = this.apply(document.createElement(tagName), o);
        return firstElementChild ? e.firstElementChild : e;
    };
    ;
    Core.prototype.parseQueryString = function () {
        return location.search
            .slice(1)
            .split('&').reduce(function (o, a) {
            o[a.split('=')[0]] = a.split('=')[1] || '';
            return o;
        }, {});
    };
    ;
    Core.prototype.config = function (name) {
        var __instance = {
            write: function (key, value) {
                localStorage.setItem('{0}.{1}'.format(name, key), value);
                return this;
            },
            read: function (key) {
                return localStorage.getItem('{0}.{1}'.format(name, key));
            }
        };
        return __instance;
    };
    Core.prototype.getValue = function (key, scope) {
        return key.split(/\.|\[|\]/)
            .reduce(function (a, b) {
            if (b === '')
                return a;
            if (b === 'this')
                return a;
            var name = b;
            // =====================================================
            // Prototype libro.name|htmlDecode,p1,p2,...
            // =====================================================
            var apply_proto = b.indexOf('|') > -1;
            var arg = [];
            if (apply_proto) {
                var tokens = String.trimValues(b.split('|'));
                name = tokens[0];
                arg = String.trimValues(tokens[1].split(','));
            }
            var value = a[name];
            // =====================================================
            // Buscar la propiedad en un ambito superior si existe
            // =====================================================
            if (value === undefined && a.outerScope) {
                value = exports.core.getValue(name, a.outerScope);
            }
            // =====================================================
            // Existe el valor. Se le aplica el prototipo si procede
            // =====================================================
            if (value != undefined) {
                return apply_proto ? value.__proto__[arg[0]]
                    .apply(value, arg.slice(1))
                    : value;
            }
            // =====================================================
            // window/self o cadena vac�a
            // =====================================================
            return a === self ? '' : self;
        }, scope || self);
    };
    return Core;
}());
exports.core = new Core();
String.leftPad = function (val, size, ch) {
    var result = '' + val;
    if (ch === null || ch === undefined || ch === '')
        ch = ' ';
    while (result.length < size)
        result = ch + result;
    return result;
};
String.trimValues = function (values) {
    return values.map(function (s) { return s.trim(); });
};
// =================================================================================================
// Strings.prototype
// =================================================================================================
String.prototype.format = function () {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var __context = values[values.length - 1] || self;
    var __call_fn = function (fn, params, base) {
        var _args = String.trimValues(params)
            .reduce(function (a, p) {
            a.push(p.charAt(0) == '@' ? exports.core.getValue(p.slice(1), __context)
                : p);
            return a;
        }, base);
        return fn.apply(__context, _args);
    };
    return this.replace(/\{(\d+|[^{]+)\}/g, function (m, k) {
        var _a = String.trimValues(k.split(':')), key = _a[0], fnName = _a[1];
        var value;
        if (/^\d+/.test(key)) {
            var tokens = String.trimValues(key.split('|'));
            var index = ~~tokens[0];
            var name_1 = tokens.length == 0 ? 'data'
                : ['data'].concat(tokens.slice(1))
                    .join('|');
            var scope = { data: values[index], outerScope: __context };
            value = exports.core.getValue(name_1, scope);
        }
        else {
            value = exports.core.getValue(key, __context);
        }
        // fn(scope.Other, 'A', '5')
        // fnName:@window.location.href;A;5
        if (exports.core.isFunction(value)) {
            return __call_fn(value, fnName ? fnName.split(/\s|\;/)
                : [], []);
        }
        // Data.toUpper(value, scope.Other, 'A', '5')
        // name:Data.toUpper=>@Other;A;5
        if (fnName) {
            var _b = String.trimValues(fnName.split(/=>/)), name_2 = _b[0], params = _b[1];
            return __call_fn(exports.core.getValue(name_2, __context), params ? params.split(/\s|\;/) : [], [value]);
        }
        return value;
    });
};
String.prototype.replaceAll = function (pattern, replacement) { return this.split(pattern).join(replacement); };
String.prototype.fixDate = function () { return this.split(' ')[0]; };
String.prototype.fixTime = function () { return this.split(' ')[1]; };
String.prototype.fixYear = function () { return this.fixDate().split('/')[2]; };
String.prototype.paddingLeft = function (v) { return (v + this).slice(-v.length); };
String.prototype.merge = function (context) {
    var __result = this.replace(/{([^{]+)?}/g, function (m, key) {
        if (key.indexOf(':') > 0) {
            var __tokens = key.split(':');
            var __fn = exports.core.getValue(__tokens[0], context);
            var __value = exports.core.getValue(__tokens[1], context);
            return __fn(__value, context);
        }
        var r = exports.core.getValue(key, context);
        return typeof (r) == 'function' ? r(context) : r;
    });
    return __result;
};
String.prototype.toXmlDocument = function () {
    return new DOMParser().parseFromString(this, "text/xml");
};
String.prototype.htmlDecode = function () {
    return new DOMParser().parseFromString(this, "text/html")
        .documentElement
        .textContent;
};
// =================================================================================================
// Array.prototype
// =================================================================================================
Array.prototype.remove = function (o) {
    var index = this.indexOf(o);
    if (index != -1)
        this.splice(index, 1);
    return this;
};
Array.prototype.add = function (o) {
    this.push(o);
    return o;
};
Array.prototype.append = function (o) {
    this.push(o);
    return this;
};
Array.prototype.select = function (sentence) {
    return exports.core.isString(sentence) ? this.map(function (e) { return e[sentence]; })
        : this.map(sentence);
};
Array.prototype.item = function (propName, value, def) {
    return this.filter(function (v) {
        return v[propName] == value;
    })[0] || def;
};
Array.prototype.contains = function (propName, value) { return this.item(propName, value); };
Array.prototype.lastItem = function () { return this[this.length - 1]; };
Array.prototype.where = function (sentence) {
    if (exports.core.isFunction(sentence))
        return this.filter(sentence);
    if (exports.core.isObject(sentence)) {
        return this.filter(new Function('a', Object.keys(sentence)
            .reduce(function (a, propname, i) {
            return a + (i > 0 ? ' && ' : '')
                + (function () {
                    var __value = sentence[propname];
                    if (__value instanceof RegExp)
                        return '{1}.test(a.{0})'.format(propname, __value);
                    if (exports.core.isString(__value))
                        return 'a.{0} === \'{1}\''.format(propname, __value);
                    return 'a.{0} === {1}'.format(propname, __value);
                }());
        }, 'return ')));
    }
    return this;
};
Array.prototype.sortBy = function (propname, desc) {
    var __order = [];
    var __names = propname.split(',').map(function (token, i) {
        var __pair = token.split(' ');
        __order[i] = (__pair[1] && (__pair[1].toUpperCase() == 'DESC')) ? -1 : 1;
        return __pair[0];
    });
    __order[0] = (desc ? -1 : 1);
    this.sort(function (a, b) {
        var i = 0;
        var __fn = function (a, b) {
            var __x = a[__names[i]];
            var __y = b[__names[i]];
            if (__x < __y)
                return -1 * __order[i];
            if (__x > __y)
                return 1 * __order[i];
            i++;
            if (i < __names.length)
                return __fn(a, b);
            return 0;
        };
        return __fn(a, b);
    });
    return this;
};
Array.prototype.orderBy = function (sentence) {
    var __sentence = exports.core.isString(sentence) ? function (a) { return a[sentence]; }
        : sentence;
    return this.map(function (e) { return e; })
        .sort(function (a, b) {
        var x = __sentence(a);
        var y = __sentence(b);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
};
Array.prototype.distinct = function (sentence) {
    if (sentence === void 0) { sentence = ''; }
    var __sentence = exports.core.isString(sentence) ? function (a) { return sentence ? a[sentence] : a; }
        : sentence;
    var r = [];
    this.forEach(function (item) {
        var _value = __sentence(item);
        if (r.indexOf(_value) == -1)
            r.push(_value);
    });
    return r;
};
Array.prototype.groupBy = function (prop) {
    return this.reduce(function (groups, item) {
        var val = item[prop];
        (groups[val] = groups[val] || []).push(item);
        return groups;
    }, {});
};
Array.prototype.toGroupWrapper = function (ctx) {
    var dataSet = this;
    var __f = function (k, t, name) {
        ctx[name] = {};
        dataSet.distinct(function (v) { return v[k]; })
            .forEach(function (v) {
            ctx[name][v] = dataSet.reduce(function (p, c) {
                return (c[k] == v) ? p + c[t] : p;
            }, 0.0);
        });
        return __f;
    };
    return __f;
};
Array.prototype.sum = function (prop) {
    return this.reduce(function (a, item) { return a + item[prop]; }, 0.0);
};
Array.prototype.toDictionary = function (prop, value) {
    return this.reduce(function (a, d) {
        a[d[prop]] = value ? d[value] : d;
        return a;
    }, {});
};
Array.prototype.split = function (size) {
    return this.reduce(function (acc, current, i, self) {
        if (!(i % size))
            return tslib_1.__spreadArrays(acc, [self.slice(i, i + size)]);
        return acc;
    }, []);
};
NodeList.prototype.toArray = function () {
    return Array.from(this);
};

},{"tslib":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginator = void 0;
var Paginator = /** @class */ (function () {
    function Paginator() {
    }
    Paginator.paginate = function (data, currentPage, pageSize, title) {
        if (currentPage === void 0) { currentPage = 1; }
        if (pageSize === void 0) { pageSize = 10; }
        var startPage, endPage;
        var totalPages = Math.ceil(data.length / pageSize);
        if (currentPage < 1) {
            currentPage = 1;
        }
        else if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = Math.min(startIndex + pageSize - 1, data.length - 1);
        return { totalItems: data.length,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startIndex: startIndex,
            endIndex: endIndex,
            allItems: data,
            visibleItems: data.slice(startIndex, endIndex + 1),
            title: title, getChecked: function () { return data.where({ '__checked': true })
                .map(function (item, i) {
                return { index: data.indexOf(item),
                    item: item };
            }); }
        };
    };
    return Paginator;
}());
exports.Paginator = Paginator;

},{}],9:[function(require,module,exports){
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
            (_a = subscribers[len]).func.apply(_a, tslib_1.__spreadArrays([topic], args));
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

},{"tslib":15}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEngine = void 0;
var core_1 = require("./core");
var core_templates_1 = require("./core.templates");
var ReportEngine = /** @class */ (function () {
    function ReportEngine() {
        this.BS = {};
        this.module_ReportEngine_Copy = function (source, dest) {
            for (var p in dest) {
                if (dest.hasOwnProperty(p)) {
                    if (source.hasOwnProperty(p)) {
                        dest[p] = source[p];
                        continue;
                    }
                    if (p === '_max_' || p === '_mim_') {
                        var __max = dest[p];
                        for (var m in __max) {
                            if (__max.hasOwnProperty(m) && source.hasOwnProperty(m))
                                __max[m] = source[m];
                        }
                    }
                    if (p === '_values_') {
                        var __agregate = dest[p];
                        for (var m in __agregate) {
                            if (__agregate.hasOwnProperty(m) && source.hasOwnProperty(m)) {
                                __agregate[m] = [source[m]];
                            }
                        }
                    }
                }
            }
        };
        this.module_ReportEngine_Sum = function (source, dest) {
            for (var p in dest) {
                if (dest.hasOwnProperty(p)) {
                    if (source.hasOwnProperty(p)) {
                        dest[p] += source[p];
                        continue;
                    }
                    if (p === '_max_' || p === '_min_') {
                        var __max = dest[p];
                        for (var m in __max) {
                            if (__max.hasOwnProperty(m) && source.hasOwnProperty(m)) {
                                if (p == '_max_')
                                    __max[m] = source[m] > __max[m] ? source[m] : __max[m];
                                else
                                    __max[m] = source[m] < __max[m] ? source[m] : __max[m];
                            }
                        }
                    }
                    if (p === '_values_') {
                        var __agregate = dest[p];
                        for (var m in __agregate) {
                            if (__agregate.hasOwnProperty(m) && source.hasOwnProperty(m))
                                __agregate[m].add(source[m]);
                        }
                    }
                }
            }
        };
    }
    ReportEngine.prototype.__cloneRowTemplate = function (e) {
        var __row = e.cloneNode(true);
        var __table = e.parentNode.parentNode;
        __table.deleteRow(e.rowIndex);
        return __row;
    };
    ReportEngine.prototype.__fillTemplate = function (e, scope) {
        var _elements = e.querySelectorAll('[xbind]')
            .toArray();
        if (e.attributes.getNamedItem('xbind'))
            _elements.push(e);
        _elements.forEach(function (child) {
            // ============================================================================
            // Atributos que es necesario procesar. Ej: id="txt-{index}"
            // ============================================================================
            core_1.core.toArray(child.attributes)
                .where({ value: /{[^{]+?}/g })
                .map(function (a) { return a.value = core_templates_1.merge(a.value, scope); });
            // ============================================================================
            // Nodos texto de este elemento
            // ============================================================================
            core_1.core.toArray(child.childNodes)
                .where({ nodeType: 3 })
                .where({ textContent: /{[^{]+?}/g })
                .forEach(function (text) { return text.textContent = core_templates_1.merge(text.textContent, scope, text); });
            // ============================================================================
            // Propiedades que establecer
            // ============================================================================
            String.trimValues(child.attributes
                .getNamedItem('xbind')
                .value
                .split(';'))
                .forEach(function (token) {
                if (token === '')
                    return;
                var _tokens = String.trimValues(token.split(':'));
                var _params = String.trimValues(_tokens[1].split(/\s|\,/));
                var _value = core_1.core.getValue(_params[0], scope);
                if (core_1.core.isFunction(_value)) {
                    var _args = _params.slice(1)
                        .reduce(function (a, p) {
                        // xbind="textContent:Data.fnTest @PlainObject,A,5"
                        a.push(p.charAt(0) == '@' ? core_1.core.getValue(p.slice(1), scope) : p);
                        return a;
                    }, [scope, child]);
                    _value = _value.apply(scope, _args);
                }
                else if (_params[1]) {
                    var _func = core_1.core.getValue(_params[1], scope);
                    _value = _func(_value, _params[2], scope, child);
                }
                child[_tokens[0]] = _value;
            });
        });
        return e;
    };
    ReportEngine.prototype.__mergeTemplate = function (template, sb, context, onGroupFooter) {
        var _this = this;
        if (template.forEach)
            return template.forEach(function (t, i) { _this.__mergeTemplate(t, sb, context[i], onGroupFooter); });
        this.__fillTemplate(template, { BS: this.BS });
        if (context.tag || context.tag == 'nofooter')
            return;
        sb.append(template.outerHTML.replace(/xbind="[^"]*"/g, ''));
        if (onGroupFooter) {
            onGroupFooter({ "sb": sb, "section": context });
        }
    };
    ReportEngine.prototype.module_ReportEngine_processAll = function (o) {
        var _this = this;
        var __doc = document.createDocumentFragment();
        __doc.appendChild(core_1.core.build('div', { innerHTML: o.ReportTemplate }, false));
        o.DetailTemplate = this.__cloneRowTemplate(__doc.querySelector(o.DetailTemplateSelector));
        if (o.HideTotal) {
            var __row = __doc.querySelector(o.TotalTemplateSelector);
            __row.parentNode.removeChild(__row);
        }
        else {
            o.TotalTemplate = this.__cloneRowTemplate(__doc.querySelector(o.TotalTemplateSelector));
        }
        o.GroupsTemplates = [];
        o.GroupsTemplates = o.Grupos.map(function (g) { return _this.__cloneRowTemplate(__doc.querySelector(g.selector)); });
        var __that = this;
        var _g_id = -1;
        function __DoHeaders() {
            o.Grupos.forEach(function (grupo, ii) {
                if (ii < _g_id)
                    return;
                var g = o.Grupos[ii];
                if (g.header) {
                    var __header = core_1.core.getValue(g.header, __that)(g.current, g.name);
                    if (__header != 'hidden;') {
                        if (__header.text) {
                            _sb.append('<tr {0}>{1}</tr>'.format(__header.attributes, __header.text));
                        }
                        else if (__header.row) {
                            __that.BS.reportDefinition.dom_tbody.appendChild(__header.row);
                        }
                        else {
                            _sb.append('<tr class="group-header">{0}</tr>'.format(__header));
                        }
                    }
                    if (o.RepeatHeadersAfter == ii) {
                        o.RepeatHeaders.forEach(function (index) {
                            if (index != '')
                                _sb.append(o.Headers[index].html);
                        });
                    }
                }
            });
        }
        var _sb = core_1.core.createStringBuilder('');
        o.OnStart(o.DataSet);
        o.DataSet.forEach(function (r, i) {
            if (i == 0)
                __DoHeaders();
            o.OnRow(r);
            if (o.Grupos.every(function (g) { return g.test(r); })) {
                o.Grupos.forEach(function (g) {
                    g.sum(r);
                });
            }
            else {
                o.Grupos.some(function (g, i) {
                    if (!g.test(r)) {
                        _g_id = i;
                        var __templates = o.GroupsTemplates.map(function (t) { return t; });
                        __templates.splice(0, i);
                        __templates.reverse();
                        var __groups = o.Grupos.map(function (g) { return g; });
                        __groups.splice(0, i);
                        __groups.reverse();
                        _this.__mergeTemplate(__templates, _sb, __groups, o.OnGroupFooter);
                        o.Grupos.forEach(function (grupo, ii) {
                            if (ii >= i) {
                                grupo.init(r);
                                _g_id = i;
                            }
                            else {
                                grupo.sum(r);
                            }
                        });
                        return true;
                    }
                    return false;
                });
                o.OnRowEnd(r);
                __DoHeaders();
            }
            if (o.HideDetail)
                return;
            _this.__mergeTemplate(o.DetailTemplate, _sb, { name: 'detail' }, o.g);
        });
        if (o.DataSet.length > 0) {
            this.BS.previous = this.BS.data;
            var __templates = o.GroupsTemplates.map(function (t) { return t; });
            __templates.reverse();
            if (!o.HideTotal)
                __templates.push(o.TotalTemplate);
            var __groups = o.Grupos.map(function (g) { return g; });
            __groups.reverse();
            __groups.push({ name: 'summary' });
            this.__mergeTemplate(__templates, _sb, __groups, o.OnGroupFooter);
        }
        return __doc.querySelector(o.ReportTableSelector)
            .innerHTML
            .replace('<tbody>', '<tbody>' + _sb.value);
    };
    ReportEngine.prototype.fromReportDefinition = function (rd, data, callback) {
        var _this = this;
        var __that = this;
        this.BS = { reportDefinition: rd };
        // ================================================================================================
        // Ordenar los datos
        // ================================================================================================
        if (rd.Iteratefn)
            data.forEach(rd.Iteratefn);
        if (rd.orderBy)
            data.sortBy(rd.orderBy, false);
        // ================================================================================================
        // Inicializar los grupos
        // ================================================================================================
        var __summary = JSON.parse(rd.summary || '{}');
        function __createGroups() {
            return rd.groups
                .where(function (g, i) { return i < rd.groups.length - 1; })
                .map(function (g, i) {
                return {
                    name: 'G' + (i + 1),
                    selector: '#' + g.id,
                    key: g.key,
                    tag: g.tag || '',
                    current: '',
                    header: g.header,
                    data: core_1.core.clone(__summary),
                    init: function (value) {
                        var __k = value[this.key].toString();
                        var __BS_Name = __that.BS[this.name];
                        __BS_Name.all[__k] = __BS_Name.all[__k] || [];
                        ;
                        __BS_Name.all[__k].push(value);
                        __BS_Name.recordCount = 1;
                        __that.module_ReportEngine_Copy(value, this.data);
                    },
                    sum: function (value) {
                        var __k = value[this.key].toString();
                        var __BS_Name = __that.BS[this.name];
                        __BS_Name.all[__k] = __BS_Name.all[__k] || [];
                        ;
                        __BS_Name.all[__k].push(value);
                        __BS_Name.recordCount += 1;
                        __that.module_ReportEngine_Sum(value, this.data);
                    },
                    test: function (value) { return value[this.key] == this.current; }
                };
            }) || [];
        }
        // ================================================================================================
        // Inicializar el informe e imprimirlo
        // ================================================================================================
        var __wrapper = {
            DataSet: data,
            HideDetail: rd.hideDetail == 'true' || false,
            HideTotal: rd.groups.length == 0 || rd.HideTotal == 'true' || false,
            ReportTemplate: rd.html,
            ReportTableSelector: '#' + rd.tableId,
            DetailTemplateSelector: '#' + rd.details[0].id,
            TotalTemplateSelector: rd.groups.length == 0 ? '' : '#' + rd.groups.lastItem().id,
            Grupos: __createGroups(),
            OnGroupFooter: rd.OnGroupFooter,
            Headers: rd.headers,
            RepeatHeaders: (rd.repeatHeader || '').split(','),
            RepeatHeadersAfter: rd.repeatHeaderAfter,
            OnRow: function (data) {
                __that.BS.recordCount += 1;
                __that.BS.previous = __that.BS.data || data;
                __that.BS.data = data;
                __wrapper.Grupos.forEach(function (g, i) { __that.BS[g.name].data = Object.create(g.data); });
                __that.module_ReportEngine_Sum(data, __that.BS.G0);
                if (rd.onRowfn)
                    (new Function('ctx', rd.onRowfn)(_this.BS));
            },
            OnStart: function (dataSet) {
                __that.BS = {
                    recordCount: 0,
                    G0: core_1.core.clone(__summary),
                    dataSet: dataSet,
                    reportDefinition: __that.BS.reportDefinition
                };
                __wrapper.Grupos.forEach(function (g, i) {
                    g.current = (dataSet && dataSet[0]) ? dataSet[0][g.key] : '';
                    __that.BS[g.name] = { recordCount: 0, all: {} };
                });
                if (rd.onStartfn)
                    rd.onStartfn(__that.BS);
            },
            OnRowEnd: function (data) {
                __wrapper.Grupos
                    .forEach(function (g) { g.current = data[g.key]; });
                if (rd.onRowEndfn)
                    (new Function('ctx', rd.onRowEndfn)(__that.BS));
            },
            PrintReport: function (callback) {
                if (callback)
                    callback(_this.module_ReportEngine_processAll(__wrapper));
                return _this;
            }
        };
        return __wrapper.PrintReport(callback);
    };
    return ReportEngine;
}());
exports.ReportEngine = ReportEngine;

},{"./core":7,"./core.templates":14}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loader = void 0;
function loadReport(code) {
    var __context = {
        headers: [],
        groups: [],
        details: []
    };
    var __cur = [{ columns: [] }];
    var __func = '';
    var __funcBody = '';
    function __getValue(value) {
        if (value && value.trim().startsWith('@')) {
            return __context[value.trim().split('@')[1].trim()] || '';
        }
        else if (value) {
            return value.trim();
        }
        return '';
    }
    function __parse_properties(value) {
        // var __reg = /(id|colspan|rowspan|className|html|xbind|style|key|header|tag):('[^']*'|[^\s]*)/g;
        var __reg = /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
        var __o = {};
        var __match = __reg.exec(value);
        while (__match != null) {
            __o[__match[1].trim()] = __getValue(__match[2].trim().replace(/^'([^']*)'$/g, '$1'));
            __match = __reg.exec(value);
        }
        return __o;
    }
    function __parse_cell(value) {
        return __parse_properties(value);
    }
    function __parse_row(value) {
        var __properties = __parse_properties(value);
        __properties.columns = [];
        return __properties;
    }
    function __getAttributes(data) {
        var __attributes = [];
        Object.keys(data)
            .filter(function (key) { return key != 'columns' && key != 'html' && data.hasOwnProperty(key); })
            .forEach(function (key) {
            var __k = key == 'className' ? 'class' : key;
            __attributes.push('{0}="{1}"'.format(__k, __getValue(data[key])));
        });
        return __attributes.length > 0 ? ' ' + __attributes.join(' ') : '';
    }
    function __render() {
        function fill(data, hide, header) {
            var sb = '';
            var cellTag = header ? 'th' : 'td';
            (data || []).forEach(function (row, i) {
                var sb_row = '';
                sb_row += '\n      <tr{0}>'.format(__getAttributes(row));
                row.columns.forEach(function (col, i) {
                    sb_row += '\n        <{2}{0}>{1}</{2}>'.format(__getAttributes(col), __getValue(col.html), cellTag);
                });
                sb_row += '\n      </tr>';
                row.html = sb_row;
                if (hide && hide.indexOf(i.toString()) > -1)
                    return;
                sb += sb_row;
            });
            return sb;
        }
        return ('<div id="{3}">\n' +
            '  <table class= "w3-table-all" style = "width:100%;" id="table-{3}" >\n ' +
            '    <thead>{0}' +
            '    </thead>\n' +
            '    <tbody>{1}{2}' +
            '    </tbody>\n' +
            '  </table>\n' +
            '</div>').format(fill(__context.headers, (__context.hiddenHeaders || '').split(','), true), fill(__context.details), fill(__context.groups), __context.tableId || '');
    }
    function __parseLine(l, o) {
        if (!__func && !l.trim())
            return function () { };
        var __keys = /^(DEFINE|#|ADD_COL|CREATE|FUNCTION|END)/;
        if (__keys.test(l)) {
            if (/^#/.test(l)) {
                return function () { };
            }
            else if (/^FUNCTION (\w.*)/.test(l)) {
                var __tokens = l.match(/^FUNCTION (\w.*)$/);
                __func = __tokens[1].trim();
                __funcBody = '';
                return function () { };
            }
            else if (/^END/.test(l)) {
                var __body = __funcBody;
                var __name = __func;
                __func = __funcBody = '';
                return function () {
                    return function (ctx) { ctx[__name] = new Function('ctx', __body); };
                }();
            }
            else if (/^ADD_COL /.test(l)) {
                var __tokens = l.match(/ADD_COL (.*)$/);
                return function () {
                    var tokens = __tokens;
                    return function (ctx) { __cur[__cur.length - 1].columns.push(__parse_cell(tokens[1])); };
                }();
            }
            else if (/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)) {
                var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
                return function () {
                    var tokens = __tokens;
                    return function (ctx) { ctx[tokens[1].trim()] = tokens[2].trim(); };
                }();
            }
            else if (/^CREATE\s\s*(\w*) (.*)$/.test(l)) {
                var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
                if (__tokens[1] == 'header') {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) { ctx.headers.push(__parse_row(tokens[2])); __cur = ctx.headers; };
                    }();
                }
                else if (__tokens[1] == 'group') {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) { ctx.groups.push(__parse_row(tokens[2])); __cur = ctx.groups; };
                    }();
                }
                else if (__tokens[1] == 'detail') {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) { ctx.details.push(__parse_row(tokens[2])); __cur = ctx.details; };
                    }();
                }
                else {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) { ctx[tokens[1]] = tokens[2]; };
                    }();
                }
            }
            else {
                throw new Error('Tabbly : Unrecognized text after DEFINE');
            }
        }
        else {
            if (__func) {
                __funcBody += o;
                __funcBody += '\n';
                return function () { };
            }
            throw new Error('Tabbly : Unrecognized text');
        }
    }
    code.split('\n').forEach(function (l) {
        __parseLine(l.trim(), l)(__context);
    });
    __context.html = __render();
    return __context;
}
var loader = { load: loadReport };
exports.loader = loader;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEngine = void 0;
var core_1 = require("./core");
var ReportEngine = /** @class */ (function () {
    function ReportEngine() {
        this.BS = {};
    }
    ReportEngine.prototype.generateReport = function (rd, data, mediator) {
        var __that = this;
        mediator.clear();
        mediator.message({ type: 'report.begin' });
        var __rd = rd; // || module.ReportEngine.rd;
        // ===========================================================================================
        // Transformar los datos
        // ===========================================================================================
        var __dataSet = __rd.parseData ? __rd.parseData(__rd, data, mediator.message)
            : data;
        mediator.message({ type: 'report.log.message', text: 'Inicializando...' });
        //console.time('Render');
        // ===========================================================================================
        // Inicializar funciones para la generación de contenido personalizado
        // ===========================================================================================
        function __initContentProviders() {
            [__rd.sections, __rd.details, __rd.groups]
                .reduce(function (a, b) { return a.concat(b); }, [])
                .map(function (s) {
                if (s.valueProviderfn) {
                    s.valueProvider = core_1.core.getValue(s.valueProviderfn, { BS: __that.BS });
                    delete s.valueProviderfn;
                }
                if (s.footerValueProviderfn) {
                    s.footerValueProvider = core_1.core.getValue(s.footerValueProviderfn, { BS: __that.BS });
                    delete s.footerValueProviderfn;
                }
                if (s.headerValueProviderfn) {
                    s.headerValueProvider = core_1.core.getValue(s.headerValueProviderfn, { BS: __that.BS });
                    delete s.headerValueProviderfn;
                }
            });
        }
        // ===================================================================================================
        // Generación de las secciones de cabecera de las agrupaciones
        // ===================================================================================================
        var __MERGE_AND_SEND = function (t, p) {
            p.BS = __that.BS;
            mediator.send(t.format(p));
        };
        function __groupsHeaders() {
            __groups.forEach(function (g, ii) {
                if (ii < __breakIndex)
                    return;
                mediator.message({ type: 'report.sections.group.header', value: g.id });
                if (g.definition.header)
                    return __MERGE_AND_SEND(g.definition.header, g);
                if (g.definition.headerValueProvider)
                    return mediator.send(g.definition.headerValueProvider(g));
            });
        }
        // ===================================================================================================
        // Generación de las secciones de resumen de las agrupaciones
        // ===================================================================================================
        function __groupsFooters(index) {
            var __gg = __groups.map(function (g) { return g; });
            if (index)
                __gg.splice(0, index);
            __gg.reverse().forEach(function (g) {
                mediator.message({ type: 'report.sections.group.footer', value: g.id });
                if (g.definition.footer)
                    return __MERGE_AND_SEND(g.definition.footer, g);
                if (g.definition.footerValueProvider)
                    return mediator.send(g.definition.footerValueProvider(g));
            });
        }
        // ===================================================================================
        // Generación de las secciones de detalle
        // ===================================================================================
        function __detailsSections() {
            __details.forEach(function (d) {
                mediator.message({ type: 'report.sections.detail', value: d.id });
                if (d.template)
                    return __MERGE_AND_SEND(d.template, d);
                if (d.valueProvider)
                    return mediator.send(d.valueProvider(d));
            });
        }
        // ===================================================================================
        // Generación de las secciones de total general
        // ===================================================================================
        function __grandTotalSections() {
            __totals.forEach(function (t) {
                mediator.message({ type: 'report.sections.total', value: t.id });
                if (t.template)
                    return __MERGE_AND_SEND(t.template, t);
                if (t.valueProvider)
                    return mediator.send(t.valueProvider(t));
            });
        }
        // ===================================================================================
        // Generación de las secciones de cabecera del informe
        // ===================================================================================
        function __reportHeaderSections() {
            __headers.forEach(function (t) {
                mediator.message({ type: 'report.sections.header', value: t });
                if (t.template)
                    return __MERGE_AND_SEND(t.template, t);
                if (t.valueProvider)
                    return mediator.send(t.valueProvider(t));
            });
        }
        // ===================================================================================
        // Inicializar el objeto que sirve de acumulador
        // ===================================================================================
        function __resolveSummaryObject() {
            var __summary = JSON.parse(__rd.summary || '{}');
            if (__rd.onInitSummaryObject)
                return __rd.onInitSummaryObject(__summary);
            return __summary;
        }
        var __breakIndex = -1;
        var __summary = __resolveSummaryObject();
        var __headers = (__rd.sections || []).where({ type: 'header' });
        var __totals = (__rd.sections || []).where({ type: 'total' });
        var __footers = (__rd.sections || []).where({ type: 'footer' });
        var __details = __rd.details || [];
        var __groups = __rd.groups
            .map(function (g, i) {
            return { name: 'G' + (i + 1),
                id: g.id,
                rd: __rd,
                definition: g,
                current: '',
                data: core_1.core.clone(__summary), init: function (value) {
                    var __k = value[this.definition.key].toString();
                    var __Gx = __that.BS[this.name];
                    __Gx.all[__k] = __Gx.all[__k] || [];
                    __Gx.all[__k].push(value);
                    __Gx.recordCount = 1;
                    if (this.__resume === false)
                        return;
                    if (this.__resume) {
                        __that.copy(value, this.data);
                        return;
                    }
                    if (this.__resume = Object.keys(this.data).length > 0)
                        __that.copy(value, this.data);
                },
                sum: function (value) {
                    var __k = value[this.definition.key].toString();
                    var __Gx = __that.BS[this.name];
                    __Gx.all[__k] = __Gx.all[__k] || [];
                    __Gx.all[__k].push(value);
                    __Gx.recordCount += 1;
                    if (this.__resume === false)
                        return;
                    __that.sum(value, this.data);
                },
                test: function (value) {
                    return value[this.definition.key] == this.current;
                } };
        }) || [];
        __that.BS = { reportDefinition: __rd, mediator: mediator };
        // ==============================================================================================
        // Ordenar los datos
        // ==============================================================================================
        if (__rd.iteratefn) {
            mediator.message({ type: 'report.log.message', text: 'Inicializando elementos...' });
            __dataSet.forEach(__rd.iteratefn);
        }
        if (__rd.orderBy) {
            mediator.message({ type: 'report.log.message', text: 'Ordenando datos...' });
            __dataSet.sortBy(__rd.orderBy, false);
        }
        // ==============================================================================================
        // Inicializar
        // ==============================================================================================
        __that.BS = { recordCount: 0,
            G0: core_1.core.clone(__summary),
            dataSet: __dataSet,
            reportDefinition: __rd,
            mediator: mediator };
        __groups.forEach(function (g, i) {
            g.current = (__dataSet && __dataSet[0]) ? __dataSet[0][g.definition.key] : '';
            __that.BS[g.name] = { recordCount: 0, all: {} };
        });
        if (__rd.onStartfn)
            __rd.onStartfn(__that.BS);
        __initContentProviders();
        mediator.message({ type: 'report.render.rows' });
        mediator.message({ type: 'report.log.message', text: 'Generando informe...' });
        // ==============================================================================
        // Cabeceras del informe
        // ==============================================================================
        __reportHeaderSections();
        // ==============================================================================
        // Cabeceras iniciales
        // ==============================================================================
        if (__dataSet.length > 0)
            __groupsHeaders();
        // ==============================================================================
        // Iterar sobre los elementos
        // ==============================================================================
        __dataSet.forEach(function (r, i) {
            // ============================================================================
            // Procesar el elemento
            // ============================================================================         
            __that.BS.recordCount++;
            __that.BS.isLastRow = __dataSet.length === __that.BS.recordCount;
            __that.BS.isLastRowInGroup = __that.BS.isLastRow;
            __that.BS.percent = (__that.BS.recordCount / __dataSet.length) * 100;
            __that.BS.previous = __that.BS.data || r;
            __that.BS.data = r;
            __groups.forEach(function (g, i) {
                __that.BS[g.name].data = Object.create(g.data);
            });
            __that.sum(r, __that.BS.G0);
            if (__rd.onRowfn)
                __rd.onRowfn(__that.BS);
            mediator.message({ type: 'report.render.row',
                text: __that.BS.percent.toFixed(1) + ' %',
                value: __that.BS.percent });
            // ============================================================================
            // Determinar si hay cambio en alguna de las claves de agrupación
            // ============================================================================
            if (__groups.every(function (g) { return g.test(r); })) {
                __groups.forEach(function (g) { g.sum(r); });
            }
            else {
                __groups.some(function (g, i) {
                    if (!g.test(r)) {
                        __breakIndex = i;
                        // ============================================
                        // Pies de grupo de los que han cambiado
                        // ============================================
                        __groupsFooters(__breakIndex);
                        // ============================================
                        // Actualizar los grupos
                        // ============================================
                        __groups.forEach(function (grupo, ii) {
                            if (ii >= __breakIndex) {
                                // ========================================
                                // Inicializar los que han cambiado
                                // ========================================
                                grupo.init(r);
                                __breakIndex = i;
                            }
                            else {
                                // ========================================
                                // Acumular valores de los que siguen igual
                                // ========================================
                                grupo.sum(r);
                            }
                        });
                        return true;
                    }
                    return false;
                });
                // ==========================================================
                // Notificar del evento onGroupChange
                // ==========================================================
                __groups.forEach(function (g) {
                    g.current = r[g.definition.key];
                });
                if (__rd.onGroupChangefn)
                    __rd.onGroupChangefn(__that.BS);
                mediator.message({ type: 'report.sections.group.change',
                    value: __groups });
                // ==========================================================
                // Cabeceras
                // ==========================================================
                __groupsHeaders();
            }
            // ============================================================
            // Determinar si este es el último elemento de la agrupación 
            // ============================================================
            if (__groups.length && !__that.BS.isLastRow) {
                var __next = __dataSet[__that.BS.recordCount];
                __that.BS.isLastRowInGroup = !__groups.every(function (g) {
                    var __k = g.definition.key;
                    return __next[__k] === __that.BS.data[__k];
                });
            }
            // ============================================================
            // Secciones de detalle
            // ============================================================
            __detailsSections();
        });
        if (__dataSet.length > 0) {
            __that.BS.previous = __that.BS.data;
            // =============================
            // Pies de grupo
            // =============================
            __groupsFooters();
        }
        // ===================================================
        // Total general
        // ===================================================
        __grandTotalSections();
        mediator.message({ type: 'report.render.end' });
        mediator.message({ type: 'report.end' });
        mediator.flush();
        //console.timeEnd('Render');
    };
    ReportEngine.prototype.merge = function (template, o) {
        return template.replace(/{([^{]+)?}/g, function (m, key) {
            if (key.indexOf(':') > 0) {
                var __fn = key.split(':');
                __fn[0] = core_1.core.getValue(__fn[0], o);
                __fn[1] = core_1.core.getValue(__fn[1], o);
                return __fn[0](__fn[1], o);
            }
            var r = core_1.core.getValue(key, o);
            return typeof (r) == 'function' ? r(o) : r;
        });
    };
    ReportEngine.prototype.copy = function (s, d) {
        Object.keys(d)
            .map(function (k) { d[k] = s[k]; });
    };
    ReportEngine.prototype.sum = function (s, d) {
        Object.keys(d)
            .map(function (k) { d[k] += s[k]; });
    };
    ReportEngine.prototype.compute = function (ds, name) {
        return ds.reduce(function (t, o) { return t + o[name]; }, 0.0);
    };
    ReportEngine.prototype.group = function (a, c) {
        var ds = a;
        var __f = function (k, t) {
            ds.distinct(function (v) { return v[k]; })
                .forEach(function (v) { c[v] = ds.reduce(function (p, c, i, a) { return (c[k] == v) ? p + c[t] : p; }, 0.0); });
            return __f;
        };
        return __f;
    };
    return ReportEngine;
}());
exports.ReportEngine = ReportEngine;
// ===========================================================================
// Ejemplo de control de mensajes enviados por el motor de informes
// ===========================================================================
function onMessage(message) {
    var _this = this;
    // =======================================================================
    // report.content
    // =======================================================================
    if (message.type === 'report.content') {
        this._container.appendChild(this.build('div', message.content)
            .firstChild);
        return;
    }
    // =======================================================================
    // report.log.message
    // =======================================================================
    if (message.type === 'report.log.message') {
        this._progressBarMessage.innerHTML = message.text || '';
        return;
    }
    // =======================================================================
    // report.begin
    // =======================================================================
    if (message.type === 'report.begin') {
        this._container.innerHTML = '';
        this._progressBarContainer.style.display = 'block';
        this._progressBarMessage.innerHTML = '';
        this._progressBar.style.width = '0%';
        return;
    }
    // =======================================================================
    // report.render.rows
    // =======================================================================
    if (message.type === 'report.render.rows') {
        this._progressBar.style.width = '0%';
    }
    // =======================================================================
    // report.render.row
    // =======================================================================
    if (message.type === 'report.render.row') {
        this._progressBar.style.width = '{0}%'.format(message.value.toFixed(1));
        this._progressBar.innerHTML = message.text || '';
    }
    // report.sections.group.header
    // report.sections.group.footer
    // report.sections.detail
    // report.sections.total
    // report.sections.header
    // report.sections.group.change
    // report.render.end
    // =======================================================================
    // report.end
    // =======================================================================
    if (message.type === 'report.end') {
        setTimeout(function () {
            _this._progressBar.style.width = '100%';
            _this._progressBarMessage.innerHTML = '';
            _this._progressBarContainer.style.display = 'none';
        }, 250);
        return;
    }
}
//function __loadAndRender(o){
//  var mediator = (function(){
//                    var __data = [];
//                    return {send : function(data){
//                                     if(data !== ''){
//                                       __data.push({ type : 'report.content', content : data });
//                                       if(__data.length > 20) this.flush();              
//                                     }
//                            },
//                            message : function(message){ postMessage(JSON.stringify(message)); },
//                            flush   : function(){ __data = __data.reduce(function(a, d){ postMessage(JSON.stringify(d)); return a;}, []); }};
//                  })();
//  var module   = self[__$__module_name];
//  var cacheBreaker = '?t=' + new Date().getTime();
//  mediator.message({ type : 'report.log.message', text : 'Cargando informe...'});
//  importScripts(o.report.source + cacheBreaker);      
//  function __onDataReady(o){
//    var __data = JSON.parse(o);
//    mediator.message({ type : 'report.data.ready', data : __data });
//    mediator.message({ type : 'report.log.message', text : 'Generando...'});
//    module.ReportEngine.generateReport('', __data, mediator);
//  }
//  mediator.message({ type : 'report.log.message', text : 'Solicitando datos...'}); 
//  if(o.report.method && o.report.method === 'get'){
//    module.ajax.get(o.report.data, __onDataReady);
//  }else{
//    module.ajax.post(o.report.data, '', __dataReady)
//}
//}

},{"./core":7}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loader = void 0;
function loadReport(code) {
    var __context = {
        sections: [],
        groups: [],
        details: []
    };
    var __cur = {};
    var __func = '';
    var __funcBody = '';
    var __setState = false;
    function __get(value) {
        if (value && value.trim().startsWith('@')) {
            return __context[value.trim().split('@')[1].trim()] || '';
        }
        else if (value) {
            return value.trim();
        }
        return '';
    }
    function __parse_properties(value) {
        var __reg = /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
        var __o = {};
        var __match = __reg.exec(value);
        while (__match != null) {
            __o[__match[1].trim()] = __get(__match[2].trim().replace(/^'([^']*)'$/g, '$1'));
            __match = __reg.exec(value);
        }
        return __o;
    }
    function __parseLine(l, o) {
        if (!__func && !l.trim())
            return function () { };
        var __keys = /DEFINE|#|CREATE|SET|FUNCTION|END/;
        if (__keys.test(l)) {
            if (/^#/.test(l)) {
                return function () { };
            }
            else if (/^SET (\w.*)/.test(l)) {
                var __tokens = l.match(/^SET (\w.*)$/);
                __setState = true;
                __func = __tokens[1].trim();
                __funcBody = '';
                return function () { };
            }
            else if (/^FUNCTION (\w.*)/.test(l)) {
                var __tokens = l.match(/^FUNCTION (\w.*)$/);
                __setState = false;
                __func = __tokens[1].trim();
                __funcBody = '';
                return function () { };
            }
            else if (/^END/.test(l)) {
                var __body = __funcBody;
                var __name = __func;
                __func = __funcBody = '';
                if (__setState) {
                    __setState = false;
                    return function () {
                        return function (ctx) { __cur[__name] = __body.trim(); };
                    }();
                }
                else {
                    return function () {
                        return function (ctx) { ctx[__name] = new Function('ctx', __body); };
                    }();
                }
            }
            else if (/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)) {
                var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
                return function () {
                    var tokens = __tokens;
                    return function (ctx) { ctx[tokens[1].trim()] = tokens[2].trim(); };
                }();
            }
            else if (/^CREATE\s\s*(\w*) (.*)$/.test(l)) {
                var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
                if (__tokens[1] == 'section') {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) {
                            ctx.sections.push(__parse_properties(tokens[2]));
                            __cur = ctx.sections[ctx.sections.length - 1];
                        };
                    }();
                }
                else if (__tokens[1] == 'group') {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) {
                            ctx.groups.push(__parse_properties(tokens[2]));
                            __cur = ctx.groups[ctx.groups.length - 1];
                        };
                    }();
                }
                else if (__tokens[1] == 'detail') {
                    return function () {
                        var tokens = __tokens;
                        return function (ctx) {
                            ctx.details.push(__parse_properties(tokens[2]));
                            __cur = ctx.details[ctx.details.length - 1];
                        };
                    }();
                }
            }
            else {
                throw new Error('Tabbly : Unrecognized text after DEFINE');
            }
        }
        else {
            if (__func) {
                __funcBody += o;
                __funcBody += '\n';
                return function () { };
            }
            throw new Error('Tabbly : Unrecognized text');
        }
    }
    code.split('\n').forEach(function (l) {
        __parseLine(l.trim(), l)(__context);
    });
    return __context;
}
var loader = { load: loadReport };
exports.loader = loader;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillTemplate = exports.executeTemplate = exports.merge = void 0;
var tslib_1 = require("tslib");
var core_1 = require("./core");
function __getValue(key, scope, def) {
    var v = core_1.core.getValue(key, scope);
    return v == window ? def : v;
}
function merge(template, o, HTMLElemnt) {
    var __call_fn = function (fn, params, base) {
        var _args = String.trimValues(params)
            .reduce(function (a, p) {
            a.push(p.charAt(0) == '@' ? core_1.core.getValue(p.slice(1), o)
                : p);
            return a;
        }, base);
        if (HTMLElemnt)
            _args.push(HTMLElemnt);
        return fn.apply(o, _args);
    };
    var __result = template.replace(/{([^{]+)?}/g, function (m, key) {
        if (key.indexOf(':') > 0) {
            var tokens = String.trimValues(key.split(':'));
            var value_1 = core_1.core.getValue(tokens[0], o);
            var _a = String.trimValues(tokens[1].split(/=>/)), name_1 = _a[0], params_1 = _a[1];
            var _params = params_1 ? String.trimValues(params_1.split(/\s|\;/))
                : [];
            return __call_fn(core_1.core.getValue(name_1, o), _params, [value_1]);
        }
        var _b = String.trimValues(key.split(/=>/)), name = _b[0], params = _b[1];
        var value = core_1.core.getValue(name, o);
        if (core_1.core.isFunction(value))
            return __call_fn(value, params.split(/\s|\;/), []);
        else
            return value;
    });
    return __result;
}
exports.merge = merge;
function fillTemplate(e, scope) {
    var _root = e;
    // ==============================================================================
    // Elementos en este nivel
    // ==============================================================================
    var _repeaters = _root.querySelectorAll('[xfor]')
        .toArray();
    var _repeatersElements = _repeaters.reduce(function (a, r) {
        return a.concat(core_1.core.$('[xbind]', r));
    }, tslib_1.__spreadArrays(_repeaters));
    var _elements = _root.querySelectorAll('[xbind]')
        .toArray()
        .filter(function (x) { return !_repeatersElements.includes(x); });
    if (_root.attributes.getNamedItem('xbind'))
        _elements.push(_root);
    // ==============================================================================
    // Procesado de los elementos
    // ==============================================================================
    _elements.forEach(function (child) {
        // ============================================================================
        // Visibilidad del elemento. Ej: xif="index"
        // ============================================================================
        if (child.attributes.getNamedItem('xif')) {
            var fn = new Function('ctx', 'return {0};'.format(child.attributes
                .getNamedItem('xif')
                .value)
                .replaceAll('@', 'this.'));
            child.style.display = fn.apply(scope) ? '' : 'none';
        }
        // ============================================================================
        // Atributos que es necesario procesar. Ej: id="txt-{index}"
        // ============================================================================
        core_1.core.toArray(child.attributes)
            .where({ value: /{[^{]+?}/g })
            .map(function (a) { return a.value = merge(a.value, scope); });
        // ============================================================================
        // Nodos texto de este elemento
        // ============================================================================
        core_1.core.toArray(child.childNodes)
            .where({ nodeType: 3 })
            .where({ textContent: /{[^{]+?}/g })
            .forEach(function (text) { return text.textContent = merge(text.textContent, scope, text); });
        // ============================================================================
        // Propiedades que establecer
        // ============================================================================
        String.trimValues(child.attributes
            .getNamedItem('xbind')
            .value
            .split(';'))
            .forEach(function (token) {
            if (token === '')
                return;
            var _a = String.trimValues(token.split(':')), name = _a[0], params = _a[1];
            var _b = String.trimValues(params.split(/=>/)), prop_name = _b[0], _params = _b[1];
            var _value = core_1.core.getValue(prop_name, scope);
            // ==========================================================================
            // _value es una funci�n de transformaci�n:
            // xbind="textContent:Data.toUpper => @Other A 5"
            // Que recibir�: Data.toUpper(scope.Other, 'A', '5', child)
            // ==========================================================================
            if (core_1.core.isFunction(_value)) {
                var _args = String.trimValues((_params || '').split(/\s|#/))
                    .reduce(function (a, p) {
                    a.push(p.charAt(0) == '@' ? core_1.core.getValue(p.slice(1), scope)
                        : p);
                    return a;
                }, []);
                _args.push(child);
                _value = _value.apply(scope, _args);
            }
            if (name)
                child[name] = _value;
        });
    });
    // ====================================================================
    // Procesado de los repeaters
    // ====================================================================
    _repeaters.map(function (repeater) {
        var _a = String.trimValues(repeater.attributes
            .getNamedItem('xfor')
            .value
            .split(' in ')), itemName = _a[0], propname = _a[1];
        var data = core_1.core.getValue(propname, scope);
        if (data && data != window) {
            data.map(function (d, i) {
                var __scope = { index: i,
                    outerScope: scope };
                __scope[itemName] = core_1.core.clone(d);
                var node = fillTemplate(repeater.cloneNode(true), __scope);
                repeater.parentNode.insertBefore(node, repeater);
            });
        }
        return repeater;
    }).forEach(function (repeater) { return repeater.parentNode.removeChild(repeater); });
    return e;
}
exports.fillTemplate = fillTemplate;
function executeTemplate(e, values, dom) {
    var _template = core_1.core.isString(e) ? core_1.core.$(e) : e;
    var _result = values.reduce(function (a, v, i) {
        var _node = { index: i,
            data: v, node: fillTemplate(_template.cloneNode(true), v) };
        a.nodes.push(_node);
        if (!dom)
            a.html.push(_node.node.outerHTML.replace(/xbind="[^"]*"/g, ''));
        return a;
    }, { nodes: [], html: [] });
    return dom ? _result.nodes : _result.html.join('');
}
exports.executeTemplate = executeTemplate;

},{"./core":7,"tslib":15}],15:[function(require,module,exports){
(function (global){(function (){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __createBinding;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __createBinding = function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
