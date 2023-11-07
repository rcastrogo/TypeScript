"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEngine = void 0;
var core_1 = require("./core");
var ReportEngine = (function () {
    function ReportEngine() {
        this.BS = {};
    }
    ReportEngine.prototype.generateReport = function (rd, data, mediator) {
        var __that = this;
        if (mediator.clear)
            mediator.clear();
        mediator.message({ type: 'report.begin' });
        var __rd = rd;
        var __dataSet = __rd.parseData ? __rd.parseData(__rd, data, mediator.message)
            : data;
        mediator.message({ type: 'report.log.message', text: 'Inicializando...' });
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
        function __detailsSections() {
            __details.forEach(function (d) {
                mediator.message({ type: 'report.sections.detail', value: d.id });
                if (d.template)
                    return __MERGE_AND_SEND(d.template, d);
                if (d.valueProvider)
                    return mediator.send(d.valueProvider(d));
            });
        }
        function __grandTotalSections() {
            __totals.forEach(function (t) {
                mediator.message({ type: 'report.sections.total', value: t.id });
                if (t.template)
                    return __MERGE_AND_SEND(t.template, t);
                if (t.valueProvider)
                    return mediator.send(t.valueProvider(t));
            });
        }
        function __reportHeaderSections() {
            __headers.forEach(function (t) {
                mediator.message({ type: 'report.sections.header', value: t });
                if (t.template)
                    return __MERGE_AND_SEND(t.template, t);
                if (t.valueProvider)
                    return mediator.send(t.valueProvider(t));
            });
        }
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
                data: core_1.core.clone(__summary),
                init: function (value) {
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
        if (__rd.iteratefn) {
            mediator.message({ type: 'report.log.message', text: 'Inicializando elementos...' });
            __dataSet.forEach(__rd.iteratefn);
        }
        if (__rd.orderBy) {
            mediator.message({ type: 'report.log.message', text: 'Ordenando datos...' });
            __dataSet.sortBy(__rd.orderBy, false);
        }
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
        __reportHeaderSections();
        if (__dataSet.length > 0)
            __groupsHeaders();
        __dataSet.forEach(function (r, i) {
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
            if (__groups.every(function (g) { return g.test(r); })) {
                __groups.forEach(function (g) { g.sum(r); });
            }
            else {
                __groups.some(function (g, i) {
                    if (!g.test(r)) {
                        __breakIndex = i;
                        __groupsFooters(__breakIndex);
                        __groups.forEach(function (grupo, ii) {
                            if (ii >= __breakIndex) {
                                grupo.init(r);
                                __breakIndex = i;
                            }
                            else {
                                grupo.sum(r);
                            }
                        });
                        return true;
                    }
                    return false;
                });
                __groups.forEach(function (g) {
                    g.current = r[g.definition.key];
                });
                if (__rd.onGroupChangefn)
                    __rd.onGroupChangefn(__that.BS);
                mediator.message({ type: 'report.sections.group.change',
                    value: __groups });
                __groupsHeaders();
            }
            if (__groups.length && !__that.BS.isLastRow) {
                var __next = __dataSet[__that.BS.recordCount];
                __that.BS.isLastRowInGroup = !__groups.every(function (g) {
                    var __k = g.definition.key;
                    return __next[__k] === __that.BS.data[__k];
                });
            }
            __detailsSections();
        });
        if (__dataSet.length > 0) {
            __that.BS.previous = __that.BS.data;
            __groupsFooters();
        }
        __grandTotalSections();
        mediator.message({ type: 'report.render.end' });
        mediator.message({ type: 'report.end' });
        if (mediator.flush)
            mediator.flush();
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
function onMessage(message) {
    var _this = this;
    if (message.type === 'report.content') {
        this._container.appendChild(this.build('div', message.content)
            .firstChild);
        return;
    }
    if (message.type === 'report.log.message') {
        this._progressBarMessage.innerHTML = message.text || '';
        return;
    }
    if (message.type === 'report.begin') {
        this._container.innerHTML = '';
        this._progressBarContainer.style.display = 'block';
        this._progressBarMessage.innerHTML = '';
        this._progressBar.style.width = '0%';
        return;
    }
    if (message.type === 'report.render.rows') {
        this._progressBar.style.width = '0%';
    }
    if (message.type === 'report.render.row') {
        this._progressBar.style.width = '{0}%'.format(message.value.toFixed(1));
        this._progressBar.innerHTML = message.text || '';
    }
    if (message.type === 'report.end') {
        setTimeout(function () {
            _this._progressBar.style.width = '100%';
            _this._progressBarMessage.innerHTML = '';
            _this._progressBarContainer.style.display = 'none';
        }, 250);
        return;
    }
}
