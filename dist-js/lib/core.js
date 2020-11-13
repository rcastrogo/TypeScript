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
