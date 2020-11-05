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
                var _args = String.trimValues(_params.split(/\s|#/))
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
