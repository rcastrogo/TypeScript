"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineChartAction = exports.PieChartAction = exports.BarChartAction = exports.SvgBarChartAction = void 0;
var core_1 = require("@src/core");
var core_ajax_1 = require("@src/core.ajax");
var core_pub_sub_1 = require("@src/core.pub-sub");
var core_templates_1 = require("../lib/core.templates");
var core_tree_1 = require("../lib/core.tree");
var g = require("@src/math");
var charts_1 = require("@src/charts/charts");
var utils_1 = require("../lib/charts/utils");
var lines_1 = require("../lib/charts/lines");
var COLORS = utils_1.createColors(30);
var SvgBarChartAction = (function () {
    function SvgBarChartAction() {
    }
    SvgBarChartAction.prototype.run = function () {
        var __max = 60;
        var __data1 = [
            [~~g.Random(__max, 10), "Ovino", "Toledo", ''],
            [~~g.Random(__max, 10), "Caprino", "Toledo", ''],
            [~~g.Random(__max, 10), "Bovino", "Toledo"],
            [~~g.Random(__max, 10), "Otros", "Toledo"],
            [~~g.Random(__max, 10), "Ovino", "Madrid"],
            [~~g.Random(__max, 10), "Caprino", "Madrid"],
            [~~g.Random(__max, 10), "Bovino", "Madrid"],
            [~~g.Random(__max, 10), "Ovino", "Sevilla"],
            [~~g.Random(__max, 10), "Caprino", "Sevilla"],
            [~~g.Random(__max, 10), "Bovino", "Sevilla"],
            [~~g.Random(__max, 10), "Ovino", "Ávila"],
            [~~g.Random(__max, 10), "Caprino", "Ávila"],
            [~~g.Random(__max, 10), "Bovino", "Ávila"]
        ];
        var __data2 = [[~~g.Random(__max, 40), "lunes 4", "", "red"],
            [~~g.Random(__max, 4), "martes 5", ""],
            [~~g.Random(__max, 4), "miércoles 6", ""],
            [~~g.Random(__max, 4), "jueves 7", ""],
            [~~g.Random(__max, 4), "viernes 8", ""],
            [~~g.Random(__max, 4), "lunes 11", ""],
            [~~g.Random(__max, 4), "martes 12", ""],
            [~~g.Random(__max, 4), "miércoles 13", ""],
            [~~g.Random(__max, 4), "lunes 18", ""],
            [~~g.Random(__max, 4), "lunes 25", ""]];
        var __data3 = [
            [~~g.Random(__max, 4), '00:00'],
            [~~g.Random(__max, 4), '01:00'],
            [~~g.Random(__max, 4), '02:00'],
            [~~g.Random(__max, 4), '03:00'],
            [~~g.Random(__max, 4), '04:00'],
            [~~g.Random(__max, 4), '05:00'],
            [~~g.Random(__max, 4), '06:00'],
            [~~g.Random(__max, 4), '07:00'],
            [~~g.Random(__max, 4), '08:00'],
            [~~g.Random(__max, 4), '09:00'],
            [~~g.Random(__max, 4), '10:00'],
            [~~g.Random(__max, 4), '11:00'],
            [~~g.Random(__max, 4), '12:00']
        ];
        core_pub_sub_1.default.publish('msg/main-page/test/content', '<p>Control de gráficos de barras (svg)</p>' +
            new charts_1.BarChart(650, 230, __data1, {
                padding: new g.Box(20, 20, 40, 40),
                showBars: true,
                showDots: false,
                showLine: false,
                showValues: true
            })
                .getControl()
                .outerHTML
            +
                new charts_1.BarChart(650, 230, __data1, {
                    padding: new g.Box(20, 20, 40, 40),
                    showBars: false,
                    showDots: true,
                    showLine: true,
                    showValues: true,
                    closeLines: true
                })
                    .getControl()
                    .outerHTML
            +
                new charts_1.BarChart(650, 230, __data2, {
                    padding: new g.Box(20, 20, 40, 40),
                    showBars: false,
                    showDots: true,
                    showLine: true,
                    showValues: true
                })
                    .getControl()
                    .outerHTML
            +
                new charts_1.BarChart(650, 230, __data3, {
                    padding: new g.Box(20, 20, 40, 40),
                    showBars: false,
                    showDots: true,
                    showLine: true,
                    showValues: true,
                    closeLines: false
                })
                    .getControl()
                    .outerHTML
            +
                new charts_1.BarChart(650, 230, __data3, {
                    padding: new g.Box(20, 20, 40, 40),
                    showBars: false,
                    showDots: false,
                    showLine: true,
                    showValues: false,
                    closeLines: false
                })
                    .getControl()
                    .outerHTML);
        setTimeout(function () {
            core_1.core.element('svg g.data')
                .onclick = function (event) {
                console.log(event.target.dataset.index);
            };
        }, 1000);
    };
    return SvgBarChartAction;
}());
exports.SvgBarChartAction = SvgBarChartAction;
var BarChartAction = (function () {
    function BarChartAction() {
    }
    BarChartAction.prototype.run = function () {
        this.loadData();
    };
    BarChartAction.prototype.loadData = function () {
        var _this = this;
        core_ajax_1.ajax.get('js/data/libros.json')
            .then(function (res) {
            _this._books = JSON.parse(res).sortBy('publisher_date,language,publisher,ID');
            _this.createBarChart();
        });
    };
    BarChartAction.prototype.createBarChart = function () {
        var __data = core_tree_1.TreeUtils.createTree(this._books, ['publisher_date']);
        var __template = core_1.core.build('div', { className: 'w3-margin-bottom w3-border',
            innerHTML: '<svg width="500"' +
                '     height="200">' +
                '  <g transform="translate(0,200) scale(1,-1)">' +
                '    <rect xfor="value in values"' +
                '          xbind="id:fn.calc=>all" ' +
                '          style="transition: height .51s ease-out;fill:rgb(0,0,255);stroke-width:2;stroke:rgb(0,0,0)" >' +
                '    </rect>' +
                '  </g>' +
                '</svg>'
        });
        var __context = {
            values: Object.keys(__data)
                .map(function (year) { return __data[year].rows.length; }),
            fn: {
                calc: function (acction, target) {
                    var __width = 500 / __context.values.length;
                    var __margin = __width * .1;
                    var __value = this;
                    target.setAttribute('x', '' + (__margin + (this.index * __width)));
                    target.setAttribute('width', (__width - __margin).toString());
                    target.setAttribute('height', '0');
                    return 'bar-{0}'.format(__value.index);
                }
            }
        };
        setTimeout(function () {
            var __ratio = 100 / Math.max.apply(null, __context.values);
            core_1.core.elements('rect')
                .forEach(function (r, i) {
                r.setAttribute('height', '{0}%'.format(__context.values[i] * __ratio));
            });
        }, 200);
        core_pub_sub_1.default.publish('msg/main-page/test/content', '<p>Generación de gráficos de barras (svg + executeTemplate)</p>' +
            core_templates_1.executeTemplate(__template, [__context]));
    };
    return BarChartAction;
}());
exports.BarChartAction = BarChartAction;
var PieChartAction = (function () {
    function PieChartAction() {
    }
    PieChartAction.prototype.run = function () {
        this.loadData();
    };
    PieChartAction.prototype.loadData = function () {
        this.createPieChart();
    };
    PieChartAction.prototype.createPieChart = function () {
        var __template = core_1.core.build('div', { className: 'w3-margin-bottom w3-border w3-center',
            innerHTML: '<svg viewbox ="-200 -200 400 400">' +
                '  <circle cx="0" cy="0" r="149" stroke="black" stroke-width="1" fill="antiquewhite" />' +
                '  <g xfor="value in values">' +
                '    <path stroke-width="1" ' +
                '          stroke="gray" ' +
                '          fill="silver" ' +
                '          xbind="id:fn.calc=>@value" >' +
                '    </path>' +
                '    <text text-anchor="middle" font-size="12px" ' +
                '          stroke-width="0" ' +
                '          stroke="white" ' +
                '          fill="black" ' +
                '          xbind="id:fn.calcLine=>@value">{value.text}</text>' +
                '  </g>' +
                '</svg>',
            style: { width: '50%' }
        });
        function __computeValues(values) {
            var __total = values.reduce(function (acc, v) { return acc += v; });
            var __offset = 0;
            return values.sort(function (a, b) { return b - a; }).map(function (v, i, self) {
                var __percent = v * 100 / __total;
                var __value = {
                    index: i,
                    value: v,
                    percent: __percent,
                    text: '{0}%'.format(__percent.toFixed(1)),
                    offset: __offset,
                    arc_start: __offset * 3.6,
                    arc_center: (__offset + __percent / 2) * 3.6,
                    arc_end: (__offset + __percent) * 3.6,
                    angle: g.Radians(-90 + ((__offset + __percent / 2) * 3.6)),
                    direction: new g.Vector2(0, 0)
                };
                __value.direction = new g.Vector2(Math.cos(__value.angle), Math.sin(__value.angle));
                __offset += __percent;
                return __value;
            });
        }
        var __values = [
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50)),
            ~~g.Random(345, ~~g.Random(100, 50))
        ].slice(0, ~~g.Random(9, 2));
        var __context = {
            values: __computeValues(__values),
            fn: {
                calc: function (value, target) {
                    var __trans = value.direction.clone().mul(4);
                    target.setAttribute('d', utils_1.describeArc(0, 0, 150, value.arc_start, value.arc_end));
                    target.setAttribute('transform', 'translate({x},{y})'.format(__trans));
                    target.setAttribute('fill', COLORS.next());
                    return 'sector-{0}'.format(value.index);
                },
                calcLine: function (value, target) {
                    var __textPoint = value.direction.clone().mul(150 * 1.07);
                    target.setAttribute('x', __textPoint.x.toString());
                    target.setAttribute('y', __textPoint.y.toString());
                    target.setAttribute('transform', 'rotate({0},{x},{y})'.format(value.arc_center, __textPoint));
                    return 'text-{0}'.format(value.index);
                }
            }
        };
        core_pub_sub_1.default.publish('msg/main-page/test/content', '<p>Generación de gráficos de tarta (svg + executeTemplate)</p>' +
            core_templates_1.executeTemplate(__template, [__context]));
    };
    return PieChartAction;
}());
exports.PieChartAction = PieChartAction;
var LineChartAction = (function () {
    function LineChartAction() {
    }
    LineChartAction.prototype.run = function () {
        var __max = 60;
        var __document = lines_1.createDocument({
            streams: {
                distance: { data: [0, 100, 200, 300, 500, 800, 900, 950, 1000] },
                altitude: { data: [150, 50, 26, 155, 60, 45, 40, 80, 0] },
                s2: { data: [150, 50, 200, 185, 160, 145, 120, 80, 0] }
            }
        });
        core_pub_sub_1.default.publish('msg/main-page/test/content', '<p>Control de gráficos de lineas (svg)</p>' +
            '<div class="jjj-5"></div>');
        setTimeout(function () {
            var __svg = new lines_1.default(650, 300, __document, {
                padding: new g.Box(20, 40, 40, 40)
            }).getControl();
            core_1.core.element('.jjj-5').appendChild(__svg);
            core_pub_sub_1.default.subscribe('msg/line_chart/range', function (name, value) {
            });
            core_pub_sub_1.default.subscribe('msg/line_chart/tap', function (name, value) {
            });
        }, 100);
    };
    return LineChartAction;
}());
exports.LineChartAction = LineChartAction;
