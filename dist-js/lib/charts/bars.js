"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var math_1 = require("../math");
var core_1 = require("../core");
var STEPS_SCALE_Y = 25;
var COLORS = utils_1.createColors(30);
var BarChart = (function () {
    function BarChart(width, height, data, o) {
        var _this = this;
        this.showBars = true;
        this.showDots = true;
        this.showLine = true;
        this.showValues = true;
        this.closeLines = true;
        this.worldToScreenY = function (y) { return y * _this.ratio * _this.bounds.height / 100; };
        this.getControl = function () { return _this.svg; };
        this.fonts = [];
        this.currentFont = { fontFamily: 'Verdana',
            fontSize: '11px',
            textAnchor: 'middle' };
        this.showBars = o && o.showBars != undefined ? o.showBars : true;
        this.showDots = o && o.showDots != undefined ? o.showDots : true;
        this.showLine = o && o.showLine != undefined ? o.showLine : true;
        this.showValues = o && o.showValues != undefined ? o.showValues : true;
        this.closeLines = o && o.closeLines != undefined ? o.closeLines : true;
        this.width = width;
        this.height = height;
        this.padding = (o && o.padding) ? o.padding : new math_1.Box(0, 0, 0, 0);
        this.bounds = new math_1.Rectangle(this.padding.left, this.padding.top, this.width - this.padding.left - this.padding.right, this.height - this.padding.top - this.padding.bottom);
        var __html = ('<svg viewbox ="0 0 {width} {height}">' +
            '  <defs>' +
            '    <clipPath id="JJJ">' +
            '      <rect y="{bounds.top}"' +
            '            x="{bounds.left}"' +
            '            width="{bounds.width}"' +
            '            height="{0}" />' +
            '     </clipPath>' +
            '  </defs>' +
            '  <g class="lines"></g>' +
            '  <g class="data" style="clip-path:url(#JJJ)"></g>' +
            '  <g class="text"></g>' +
            '</svg>').format(this.bounds.height - 1, this);
        this.svg = core_1.core.build('div', __html, true);
        this.data = data.map(function (values, i) {
            return {
                value: values[0],
                legend: values[1] || '',
                serie: values[2] || '',
                fill: values[3] || COLORS.next()
            };
        });
        this.maxValue = 1.05 * this.data.reduce(function (a, d) { return Math.max(d.value, a); }, -Infinity);
        this.ratio = 100.0 / this.maxValue;
        this.series = Object.entries(this.data.groupBy('serie'))
            .map(function (group) {
            return { key: group[0],
                text: group[0],
                fill: group[1][0].fill,
                rows: group[1] };
        })
            .where(function (s) { return s.key; });
        this.legends = Object.entries(this.data.groupBy('legend'))
            .map(function (group) {
            var __rows = group[1];
            var __color = __rows[0].fill;
            if (_this.series.length) {
                __rows.forEach(function (r) { return r.fill = __color; });
            }
            return { key: group[0],
                text: group[0],
                fill: __color,
                rows: __rows };
        });
        this.calcLayout();
    }
    BarChart.prototype.calcLayout = function () {
        var _this = this;
        var __totalBarWidth = this.bounds.width / this.data.length;
        var __margin = __totalBarWidth * .1;
        var __marginSerie = __margin * 2;
        var __barWidth = __totalBarWidth - __margin / this.data.length;
        var __offset = 0;
        var __computeBars = function (rows) {
            rows.forEach(function (value, i, self) {
                var __height = _this.worldToScreenY(value.value);
                var __top = _this.bounds.top + _this.bounds.height - __height;
                var __left = _this.bounds.left + __margin + __offset;
                ;
                value.bar = new math_1.Rectangle(__left, __top, __barWidth - __margin, __height);
                __offset += __barWidth;
            });
        };
        if (this.series.length) {
            __barWidth -= __marginSerie * (this.series.length) / this.data.length;
            this.series
                .forEach(function (serie) {
                serie.left = _this.bounds.left + __offset;
                __computeBars(serie.rows);
                __offset += __marginSerie;
                serie.width = _this.bounds.left + __offset - serie.left;
                serie.right = _this.bounds.left + __offset - __marginSerie;
            });
        }
        else {
            __computeBars(this.data);
        }
        this.draw();
    };
    BarChart.prototype.draw = function () {
        this.drawAxisY();
        this.drawVerticalLines();
        this.drawAxisX();
        this.drawBars();
        this.drawLine();
        this.drawSeries();
    };
    BarChart.prototype.drawAxisX = function () {
        var __html = ('<line x1="{0}" y1="{1}" x2="{2}" y2="{1}"' +
            '      stroke="black"' +
            '      stroke-width="2" />').format(this.bounds.left - 4, this.bounds.top + this.bounds.height, this.bounds.left + this.bounds.width + 4);
        this.svg
            .querySelector('g.lines')
            .insertAdjacentHTML("beforeend", __html);
    };
    BarChart.prototype.drawAxisY = function () {
        var _this = this;
        var __html = '';
        var __template = '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}"' +
            '      stroke="silver"' +
            '      stroke-width="1"/>';
        this.saveContext();
        this.currentFont.textAnchor = 'end';
        utils_1.niceScale(0, this.maxValue, STEPS_SCALE_Y)
            .values
            .forEach(function (value) {
            var __height = _this.worldToScreenY(value);
            var __top = _this.bounds.top + _this.bounds.height - __height;
            if (__top < _this.bounds.top)
                return;
            __html += __template.format(_this.bounds.left - 4, __top, _this.bounds.left + _this.bounds.width);
            _this.appendText(_this.bounds.left - 6, __top + 4, value.toFixed(0));
        });
        this.restoreContext();
        __html += ('<line x1="{0}" y1="{1}" x2="{0}" y2="{2}"' +
            '      stroke="black"' +
            '      stroke-width="2" />').format(this.bounds.left, this.bounds.top - 2, this.bounds.top + this.bounds.height + 4);
        this.svg
            .querySelector('g.lines')
            .insertAdjacentHTML("beforeend", __html);
    };
    BarChart.prototype.drawVerticalLines = function () {
        var _this = this;
        var __template = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}"' +
            '      stroke="{3}"' +
            '      stroke-width="1" />';
        var __html = this.data
            .reduce(function (html, item, i) {
            var __point = item.bar.centerPoint();
            return html += __template.format(__point.x, _this.bounds.top - 4, _this.bounds.top + _this.bounds.height
                + 4, 'silver');
        }, '') +
            this.series
                .reduce(function (html, serie, i, self) {
                if (i == self.length - 1)
                    return html;
                return html += __template.format(serie.left + serie.width, _this.bounds.top - 4, _this.bounds.top + _this.bounds.height, 'black');
            }, '');
        this.svg
            .querySelector('g.lines')
            .insertAdjacentHTML("beforeend", __html);
    };
    BarChart.prototype.drawBars = function () {
        var _this = this;
        var __template = '<rect x="{0}" y="{1}" width="{2}" height="{3}"' +
            '      stroke="black"' +
            '      stroke-width="2"' +
            '      fill="{4}"' +
            '      data-index="{5}" />';
        var __html = this.data
            .reduce(function (html, item, i) {
            var rec = item.bar;
            _this.appendText(rec.centerPoint().x, _this.bounds.top + _this.bounds.height + 14, item.legend);
            if (_this.showBars) {
                if (_this.showValues)
                    _this.appendText(rec.centerPoint().x, rec.centerPoint().y, item.value);
                return html += __template.format(rec.left, rec.top, rec.width, rec.height, item.fill, i);
            }
        }, '');
        this.svg
            .querySelector('g.data')
            .insertAdjacentHTML("beforeend", __html);
    };
    BarChart.prototype.drawSeries = function () {
        var _this = this;
        this.saveContext();
        this.currentFont.fontSize = '20px';
        this.currentFont.textAnchor = 'middle';
        this.series
            .forEach(function (serie, i) {
            _this.appendText(serie.left + serie.width / 2, _this.bounds.top + _this.bounds.height + 40, serie.text);
        });
        this.restoreContext();
    };
    BarChart.prototype.drawLine = function () {
        var _this = this;
        var __dots_template = '<circle cx="{0}" cy="{1}" r="3" ' +
            '        stroke="black"' +
            '        stroke-width="1" ' +
            '        fill="white" />';
        var __createDots = function (values, extra) {
            if (_this.showLine && _this.showValues) {
                values.forEach(function (item, i) {
                    var rec = item.bar;
                    _this.appendText(rec.centerPoint().x, rec.top - 12, item.value);
                });
            }
            var __points = values.map(function (v) { return v.bar; })
                .map(function (r) { return new math_1.Vector2(r.centerPoint().x, r.top); })
                .concat(_this.closeLines ? extra : []);
            var __path = utils_1.PathBuilder.createPath(__points, .1, _this.closeLines);
            var __line = ('<path d="{0}" fill="{1}"' +
                '      stroke-dasharray=""' +
                '      stroke="{2}"' +
                '      stroke-width="2"/>').format(__path, _this.closeLines ? COLORS.next() : 'none', 'black');
            var __dots = values.reduce(function (html, item, i) {
                var rec = item.bar;
                return html += __dots_template.format(rec.centerPoint().x, rec.top, item.fill);
            }, '');
            return (_this.showLine ? __line : '') +
                (_this.showDots ? __dots : '');
        };
        var __html = '';
        if (this.series.length) {
            __html = this.series
                .map(function (serie) {
                var extra = [new math_1.Vector2(serie.right, _this.bounds.top + _this.bounds.height),
                    new math_1.Vector2(serie.left, _this.bounds.top + _this.bounds.height)];
                return __createDots(serie.rows, extra);
            })
                .join('');
        }
        else {
            var extra = [new math_1.Vector2(this.bounds.left + this.bounds.width, this.bounds.top + this.bounds.height),
                new math_1.Vector2(this.bounds.left, this.bounds.top + this.bounds.height)];
            __html = __createDots(this.data, extra);
        }
        this.svg
            .querySelector('g.data')
            .insertAdjacentHTML("beforeend", __html);
    };
    BarChart.prototype.saveContext = function () {
        this.fonts.push(core_1.core.clone(this.currentFont));
    };
    BarChart.prototype.restoreContext = function () {
        if (this.fonts.length)
            this.currentFont = this.fonts.pop();
    };
    BarChart.prototype.appendText = function (x, y, text) {
        var __template = '<text x="{0}" y="{1}"' +
            ' font-family="{fontFamily}" ' +
            ' font-size="{fontSize}"' +
            ' text-anchor="{textAnchor}">{2}</text>';
        this.svg
            .querySelector('g.text')
            .insertAdjacentHTML("beforeend", __template.format(x, y, text, this.currentFont));
    };
    return BarChart;
}());
exports.default = BarChart;
