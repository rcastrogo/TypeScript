"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEngine = void 0;
const core_1 = require("./core");
const core_templates_1 = require("./core.templates");
class ReportEngine {
    constructor() {
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
    __cloneRowTemplate(e) {
        var __row = e.cloneNode(true);
        var __table = e.parentNode.parentNode;
        __table.deleteRow(e.rowIndex);
        return __row;
    }
    __fillTemplate(e, scope) {
        var _elements = e.querySelectorAll('[xbind]')
            .toArray();
        if (e.attributes.getNamedItem('xbind'))
            _elements.push(e);
        _elements.forEach((child) => {
            // ============================================================================
            // Atributos que es necesario procesar. Ej: id="txt-{index}"
            // ============================================================================
            core_1.core.toArray(child.attributes)
                .where({ value: /{[^{]+?}/g })
                .map(a => a.value = core_templates_1.merge(a.value, scope));
            // ============================================================================
            // Nodos texto de este elemento
            // ============================================================================
            core_1.core.toArray(child.childNodes)
                .where({ nodeType: 3 })
                .where({ textContent: /{[^{]+?}/g })
                .forEach(text => text.textContent = core_templates_1.merge(text.textContent, scope, text));
            // ============================================================================
            // Propiedades que establecer
            // ============================================================================
            String.trimValues(child.attributes
                .getNamedItem('xbind')
                .value
                .split(';'))
                .forEach((token) => {
                if (token === '')
                    return;
                var _tokens = String.trimValues(token.split(':'));
                var _params = String.trimValues(_tokens[1].split(/\s|\,/));
                var _value = core_1.core.getValue(_params[0], scope);
                if (core_1.core.isFunction(_value)) {
                    var _args = _params.slice(1)
                        .reduce((a, p) => {
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
    }
    __mergeTemplate(template, sb, context, onGroupFooter) {
        if (template.forEach)
            return template.forEach((t, i) => { this.__mergeTemplate(t, sb, context[i], onGroupFooter); });
        this.__fillTemplate(template, { BS: this.BS });
        if (context.tag || context.tag == 'nofooter')
            return;
        sb.append(template.outerHTML.replace(/xbind="[^"]*"/g, ''));
        if (onGroupFooter) {
            onGroupFooter({ "sb": sb, "section": context });
        }
    }
    module_ReportEngine_processAll(o) {
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
        o.GroupsTemplates = o.Grupos.map((g) => this.__cloneRowTemplate(__doc.querySelector(g.selector)));
        var __that = this;
        var _g_id = -1;
        function __DoHeaders() {
            o.Grupos.forEach((grupo, ii) => {
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
        o.DataSet.forEach((r, i) => {
            if (i == 0)
                __DoHeaders();
            o.OnRow(r);
            if (o.Grupos.every(function (g) { return g.test(r); })) {
                o.Grupos.forEach(function (g) {
                    g.sum(r);
                });
            }
            else {
                o.Grupos.some((g, i) => {
                    if (!g.test(r)) {
                        _g_id = i;
                        var __templates = o.GroupsTemplates.map(function (t) { return t; });
                        __templates.splice(0, i);
                        __templates.reverse();
                        var __groups = o.Grupos.map(function (g) { return g; });
                        __groups.splice(0, i);
                        __groups.reverse();
                        this.__mergeTemplate(__templates, _sb, __groups, o.OnGroupFooter);
                        o.Grupos.forEach((grupo, ii) => {
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
            this.__mergeTemplate(o.DetailTemplate, _sb, { name: 'detail' }, o.g);
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
    }
    fromReportDefinition(rd, data, callback) {
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
                .map((g, i) => {
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
            OnRow: (data) => {
                __that.BS.recordCount += 1;
                __that.BS.previous = __that.BS.data || data;
                __that.BS.data = data;
                __wrapper.Grupos.forEach((g, i) => { __that.BS[g.name].data = Object.create(g.data); });
                __that.module_ReportEngine_Sum(data, __that.BS.G0);
                if (rd.onRowfn)
                    (new Function('ctx', rd.onRowfn)(this.BS));
            },
            OnStart: (dataSet) => {
                __that.BS = {
                    recordCount: 0,
                    G0: core_1.core.clone(__summary),
                    dataSet: dataSet,
                    reportDefinition: __that.BS.reportDefinition
                };
                __wrapper.Grupos.forEach((g, i) => {
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
            PrintReport: (callback) => {
                if (callback)
                    callback(this.module_ReportEngine_processAll(__wrapper));
                return this;
            }
        };
        return __wrapper.PrintReport(callback);
    }
}
exports.ReportEngine = ReportEngine;
//# sourceMappingURL=core.tabbly.engine.js.map