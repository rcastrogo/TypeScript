"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocument = void 0;
var utils_1 = require("./utils");
var math_1 = require("../math");
var core_1 = require("../core");
var core_pub_sub_1 = require("../core.pub-sub");
var STEPS_SCALE_Y = 8;
var COLORS = utils_1.createColors(30);
var LineChart = (function () {
    function LineChart(width, height, document, o) {
        var _this = this;
        this.getControl = function () { return _this.svg; };
        this.worldToScreenX = function (x) { return _this.bounds.left + (x * _this.ratio.x * _this.bounds.width / 100); };
        this.worldToScreenY = function (y) { return _this.bounds.top + _this.bounds.height - ((y - _this.document.view.y.min) * _this.ratio.y * _this.bounds.height / 100); };
        this.screenToWorldX = function (x) { return _this.document.view.x.min + (x - _this.bounds.left) * 100 / (_this.bounds.width * _this.ratio.x); };
        this.indexPoinAt = function (distance) {
            var __i = -1;
            _this.document.distances.forEach(function (d) { if (d > distance)
                return; __i++; });
            return __i;
        };
        this.onMouseLeave = function (eventArg) {
            if (_this.mouse.mouseDown) {
                _this.mouse.mouseDown = false;
                _this.mouse.drag = false;
            }
        };
        this.onTouchEnd = function (eventArg) {
            var __reset = function () {
                _this.mouse.mouseDown = false;
                _this.mouse.drag = false;
                eventArg.preventDefault();
            };
            if (_this.mouse.drag) {
                core_pub_sub_1.default.publish('msg/line_chart/range', {
                    sender: _this,
                    start: _this.mouse.dragStart < 0 ? 0 : _this.mouse.dragStart,
                    end: _this.mouse.dragEnd
                });
            }
            else {
                core_pub_sub_1.default.publish('msg/line_chart/tap', {
                    sender: _this,
                    x: _this.screenToWorldX(_this.mouse.mouseDownPosition.x)
                });
            }
            __reset();
        };
        this.onMouseUp = function (eventArg) {
            var __pos = { x: eventArg.offsetX, y: eventArg.offsetY };
            var __reset = function () {
                _this.mouse.mouseDown = false;
                _this.mouse.drag = false;
                eventArg.preventDefault();
            };
            if (_this.mouse.mouseDown && _this.mouse.mouseDownPosition.x == __pos.x
                && _this.mouse.mouseDownPosition.y == __pos.y) {
                core_pub_sub_1.default.publish('msg/line_chart/tap', {
                    sender: _this,
                    x: _this.screenToWorldX(__pos.x)
                });
                return __reset();
            }
            if (_this.mouse.drag) {
                core_pub_sub_1.default.publish('msg/line_chart/range', {
                    sender: _this,
                    start: _this.mouse.dragStart < 0 ? 0 : _this.mouse.dragStart,
                    end: _this.mouse.dragEnd
                });
            }
            __reset();
        };
        this.onTouchStart = function (eventArg) {
            var event = window.document.createEvent("MouseEvent");
            var touch = eventArg.touches[0];
            event.initMouseEvent('mousedown', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
            touch.target.dispatchEvent(event);
            eventArg.preventDefault();
        };
        this.onMouseDown = function (eventArg) {
            _this.mouse.mouseDown = true;
            _this.mouse.mouseDownPosition = { x: eventArg.offsetX, y: eventArg.offsetY };
            _this.mouse.dragStart = _this.mouse.dragEnd = _this.indexPoinAt(_this.screenToWorldX(_this.mouse.mouseDownPosition.x));
            if (_this.mouse.dragStart == -1)
                _this.mouse.dragStart = 0;
            eventArg.preventDefault();
        };
        this.onTouchMove = function (eventArg) {
            var event = window.document.createEvent("MouseEvent");
            var touch = eventArg.touches[0];
            event.initMouseEvent('mousemove', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
            touch.target.dispatchEvent(event);
            eventArg.preventDefault();
        };
        this.onMouseMove = function (eventArg) {
            var __pos = { x: eventArg.offsetX, y: eventArg.offsetY };
            _this.mouse.drag = _this.mouse.mouseDown;
            if (_this.mouse.drag) {
                _this.mouse.dragEnd = _this.indexPoinAt(_this.screenToWorldX(__pos.x));
                if (_this.mouse.dragEnd == -1)
                    _this.mouse.dragEnd = 0;
            }
            eventArg.preventDefault();
        };
        this.states = [];
        this.currentFont = { fontFamily: 'Verdana',
            fontSize: '11px',
            textAnchor: 'middle' };
        this.mouse = {};
        this.width = width;
        this.height = height;
        this.padding = (o && o.padding) ? o.padding : new math_1.Box(0, 0, 0, 0);
        this.bounds = new math_1.Rectangle(this.padding.left, this.padding.top, this.width - this.padding.left - this.padding.right, this.height - this.padding.top - this.padding.bottom);
        var __html = ('<svg viewbox ="0 0 {width} {height}">' +
            '  <defs>' +
            '    <clipPath id="JJJ">' +
            '      <rect y="0"' +
            '            x="{bounds.left}"' +
            '            width="{bounds.width}"' +
            '            height="{0}" />' +
            '     </clipPath>' +
            '  </defs>' +
            '  <g class="lines"></g>' +
            '  <g class="data" style="clip-path:url(#JJJ)"></g>' +
            '  <g class="text"></g>' +
            '</svg>').format(this.bounds.height + this.bounds.top - 1, this);
        this.svg = core_1.core.build('div', __html, true);
        this.svg.onmousemove = this.onMouseMove;
        this.svg.onmouseup = this.onMouseUp;
        this.svg.onmousedown = this.onMouseDown;
        this.svg.onmouseleave = this.onMouseLeave;
        this.svg.ontouchstart = this.onTouchStart;
        this.svg.ontouchend = this.onTouchEnd;
        this.svg.ontouchmove = this.onTouchMove;
        this.document = document;
        this.ratio = new math_1.Vector2(100.0 / this.document.view.x.range, 100.0 / this.document.view.y.range);
        this.draw();
    }
    LineChart.prototype.draw = function () {
        this.drawScaleY();
        this.drawScaleX();
        this.drawAxes();
        this.drawLines();
    };
    LineChart.prototype.drawAxes = function () {
        var __h_tmp = '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}" stroke="black" stroke-width="2" />';
        var __v_tmp = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}" stroke="black" stroke-width="2" />';
        var __html = __h_tmp.format(this.bounds.left - 4, this.bounds.top + this.bounds.height, this.bounds.left + this.bounds.width + 4) +
            __v_tmp.format(this.bounds.left, this.bounds.top - 2, this.bounds.top + this.bounds.height + 4);
        this.svg
            .querySelector('g.lines')
            .insertAdjacentHTML("beforeend", __html);
    };
    LineChart.prototype.drawScaleY = function () {
        var _this = this;
        var __html = '';
        var __template = '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}" stroke="silver" stroke-width="1"/>';
        var __right = this.bounds.left + this.bounds.width;
        this.saveContext();
        this.currentFont.fontSize = '9px';
        this.currentFont.textAnchor = 'end';
        var __serie = this.document.series[0];
        var __scale = utils_1.niceScale(__serie.view.min, __serie.view.max, STEPS_SCALE_Y);
        __scale.values
            .forEach(function (value) {
            var __y = __serie.transform ? __serie.transform(_this, value) : _this.worldToScreenY(value);
            if (__y < _this.bounds.top)
                return;
            __html += __template.format(_this.bounds.left - 4, __y, __right);
            var __text = '{0} {1}'.format(value.toFixed(0), (__serie.unit || 'm'));
            _this.appendText(_this.bounds.left - 6, __y + 3, __text);
        });
        if (this.document.series[1]) {
            this.currentFont.textAnchor = 'start';
            __serie = this.document.series[1];
            __scale = utils_1.niceScale(__serie.view.min, __serie.view.max, STEPS_SCALE_Y);
            __scale.values
                .forEach(function (value) {
                var __y = __serie.transform ? __serie.transform(_this, value) : _this.worldToScreenY(value);
                if (__y < _this.bounds.top ||
                    __y > _this.bounds.top + _this.bounds.height)
                    return;
                __html += __template.format(__right - 4, __y, __right);
                var __text = '{0} {1}'.format(value.toFixed(0), (__serie.unit || 'm'));
                _this.appendText(__right + 2, __y + 3, __text);
            });
        }
        this.restoreContext();
        this.svg
            .querySelector('g.lines')
            .insertAdjacentHTML("beforeend", __html);
    };
    LineChart.prototype.drawScaleX = function () {
        var _this = this;
        this.saveContext();
        var __v_tmp = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}" stroke="gray" stroke-width="1" />';
        var __offsetX = this.worldToScreenX(this.document.view.x.min) - this.bounds.left;
        var __html = '';
        var __scale = utils_1.niceScale(this.document.view.x.min, this.document.view.x.max, Math.floor(this.bounds.width / 50));
        this.currentFont.fontSize = '9px';
        __scale.values
            .forEach(function (value) {
            var __x_pos = _this.worldToScreenX(value) - __offsetX;
            if (__x_pos < _this.bounds.left ||
                __x_pos > _this.bounds.left + _this.bounds.width)
                return;
            __html += __v_tmp.format(__x_pos, _this.bounds.top - 4, _this.bounds.top + _this.bounds.height + 4);
            _this.appendText(__x_pos, _this.bounds.top + _this.bounds.height + 12, '{0} km'.format((value / 1000).toFixed(1)));
        });
        this.svg
            .querySelector('g.lines')
            .insertAdjacentHTML("beforeend", __html);
        this.restoreContext();
    };
    LineChart.prototype.drawLines = function () {
        var _this = this;
        var __offsetX = this.worldToScreenX(this.document.view.x.min) - this.bounds.left;
        var __html = '';
        var __dots_template = '<circle cx="{0}" cy="{1}" r="3" ' +
            '        stroke="black"' +
            '        stroke-width="1" ' +
            '        fill="white" />';
        this.document
            .series
            .forEach(function (serie, i) {
            var __points = _this.document[serie.name]
                .map(function (v, i) {
                var x = _this.worldToScreenX(_this.document.distances[i]);
                var y = serie.transform ? serie.transform(_this, v)
                    : _this.worldToScreenY(v);
                return new math_1.Vector2(x - __offsetX, y);
            });
            var __points_html = __points.reduce(function (html, item, i, self) {
                return html += __dots_template.format(item.x, item.y, 'white');
            }, '');
            var __y = _this.worldToScreenY(serie.view.min);
            var __x_min = _this.worldToScreenX(_this.document.view.x.min) - __offsetX;
            var __x_max = _this.worldToScreenX(_this.document.view.x.max) - __offsetX;
            __points = __points.concat(serie.closeLine ? [new math_1.Vector2(__x_max, __y),
                new math_1.Vector2(__x_min, __y)]
                : []);
            var __path = utils_1.PathBuilder.createPath(__points, .1, serie.closeLine);
            var __line_html = ('<path d="{0}" fill="{1}" ' +
                '      stroke-dasharray="" ' +
                '      stroke="{2}" ' +
                '      stroke-width="{3}" />').format(__path, serie.closeLine ? serie.fillStyle || COLORS.next() : 'none', serie.strokeStyle || 'black', serie.lineWidth || 1);
            __html += __line_html + __points_html;
        });
        this.svg
            .querySelector('g.data')
            .insertAdjacentHTML("beforeend", __html);
    };
    LineChart.prototype.saveContext = function () {
        this.states.push(core_1.core.clone(this.currentFont));
    };
    LineChart.prototype.restoreContext = function () {
        if (this.states.length)
            this.currentFont = this.states.pop();
    };
    LineChart.prototype.appendText = function (x, y, text) {
        var __template = '<text x="{0}" y="{1}"' +
            ' font-family="{fontFamily}" ' +
            ' font-size="{fontSize}"' +
            ' text-anchor="{textAnchor}">{2}</text>';
        this.svg
            .querySelector('g.text')
            .insertAdjacentHTML("beforeend", __template.format(x, y, text, this.currentFont));
    };
    return LineChart;
}());
exports.default = LineChart;
function createDocument(dataset) {
    function __getRange(array, start, end) {
        var __res = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY,
            range: undefined
        };
        var __current = start;
        while (__current <= end) {
            __res.min = Math.min(__res.min, array[__current]);
            __res.max = Math.max(__res.max, array[__current]);
            __current++;
        }
        __res.min = __res.min;
        __res.range = __res.max - __res.min;
        return __res;
    }
    var document = {
        series: [],
        length: dataset.streams.distance.data.length,
        distances: dataset.streams.distance.data,
        altitude: dataset.streams.altitude.data,
        s2: dataset.streams.s2.data,
        offset: 0.0,
        view: {},
        getRange: __getRange,
        configureView: function (start, end) {
            document.view.start = start;
            document.view.end = end;
            document.view.x = {};
            document.view.x.max = document.distances[end] * 1.005;
            document.view.x.min = document.distances[start];
            document.view.x.range = document.view.x.max - document.view.x.min;
            document.view.y = __getRange(document.altitude, start, end);
            document.view.h = __getRange(document.s2, start, end);
            document.series = [];
            document.series.push({ name: 'altitude',
                closeLine: true,
                showDots: true,
                unit: 'm',
                view: document.view.y,
                fillStyle: 'rgba(225,125,125,.8)',
                lineWidth: 1,
                strokeStyle: 'rgba(0,0,0,.8)',
                ratio: 100.0 / document.view.y.range });
            document.series.push({ name: 's2',
                closeLine: false,
                showDots: false,
                unit: 'ppm',
                view: document.view.h,
                fillStyle: 'rgba(150,0,0,.8)',
                lineWidth: 3,
                strokeStyle: 'rgba(00,0,250,.9)',
                ratio: 100.0 / document.view.h.range, transform: function (sender, v) {
                    return sender.bounds.top +
                        sender.bounds.height -
                        ((v - sender.document.view.h.min) *
                            this.ratio * sender.bounds.height / 120);
                } });
            return document;
        },
        resetView: function () {
            return document.configureView(0, document.length - 1);
        }
    };
    return document.resetView();
}
exports.createDocument = createDocument;
