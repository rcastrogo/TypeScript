"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillTemplate = exports.executeTemplate = exports.merge = void 0;
const core_1 = require("./core");
function __getValue(key, scope, def) {
    let v = core_1.core.getValue(key, scope);
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
            let tokens = String.trimValues(key.split(':'));
            let value = core_1.core.getValue(tokens[0], o);
            let [name, params] = String.trimValues(tokens[1].split(/=>/));
            let _params = params ? String.trimValues(params.split(/\s|\;/))
                : [];
            return __call_fn(core_1.core.getValue(name, o), _params, [value]);
        }
        let [name, params] = String.trimValues(key.split(/=>/));
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
    var _repeatersElements = _repeaters.reduce((a, r) => {
        return a.concat(core_1.core.$('[xbind]', r));
    }, [..._repeaters]);
    var _elements = _root.querySelectorAll('[xbind]')
        .toArray()
        .filter(x => !_repeatersElements.includes(x));
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
            let fn = new Function('ctx', 'return {0};'.format(child.attributes
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
            .map(a => a.value = merge(a.value, scope));
        // ============================================================================
        // Nodos texto de este elemento
        // ============================================================================
        core_1.core.toArray(child.childNodes)
            .where({ nodeType: 3 })
            .where({ textContent: /{[^{]+?}/g })
            .forEach(text => text.textContent = merge(text.textContent, scope, text));
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
            let [name, params] = String.trimValues(token.split(':'));
            let [prop_name, _params] = String.trimValues(params.split(/=>/));
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
    _repeaters.map(repeater => {
        let [itemName, propname] = String.trimValues(repeater.attributes
            .getNamedItem('xfor')
            .value
            .split(' in '));
        let data = core_1.core.getValue(propname, scope);
        if (data && data != window) {
            data.map((d, i) => {
                let __scope = { index: i,
                    outerScope: scope };
                __scope[itemName] = core_1.core.clone(d);
                let node = fillTemplate(repeater.cloneNode(true), __scope);
                repeater.parentNode.insertBefore(node, repeater);
            });
        }
        return repeater;
    }).forEach(repeater => repeater.parentNode.removeChild(repeater));
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
//# sourceMappingURL=core.templates.js.map