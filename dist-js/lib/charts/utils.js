"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeArc = exports.PathBuilder = exports.niceScale = exports.createColors = void 0;
var math_1 = require("../math");
var createColors = function (v) {
    var __v = [0, 51, 102, 153, 204, 255];
    var __l = __v.length - 1;
    var __c = [];
    var __x = 0;
    while (__x < v) {
        __c.add('rgba({0},{1},{2},.9)'.format(__v[~~(0, math_1.Random)(__l, 0)], __v[~~(0, math_1.Random)(__l, 0)], __v[~~(0, math_1.Random)(__l, 0)]));
        __x++;
    }
    return {
        current: -1,
        values: __c,
        next: function () {
            this.current = ++this.current % this.values.length;
            return this.values[this.current];
        }
    };
};
exports.createColors = createColors;
var niceScale = function (min, max, steps) {
    var range = __niceNum(max - min, false);
    var tickSpacing = __niceNum(range / (steps - 1), true);
    var niceMin = Math.floor(min / tickSpacing) * tickSpacing;
    var niceMax = Math.ceil(max / tickSpacing) * tickSpacing;
    var result = { range: range,
        min: niceMin,
        max: niceMax,
        tickSpacing: tickSpacing,
        values: Array() };
    function __niceNum(range, round) {
        var exponent = Math.floor(Math.log10(range));
        var fraction = range / Math.pow(10, exponent);
        var niceFraction;
        if (round) {
            if (fraction < 1.5)
                return Math.pow(10, exponent);
            else if (fraction < 3)
                return 2 * Math.pow(10, exponent);
            else if (fraction < 7)
                return 5 * Math.pow(10, exponent);
            else
                return 10 * Math.pow(10, exponent);
        }
        if (fraction <= 1)
            return Math.pow(10, exponent);
        else if (fraction <= 2)
            return 2 * Math.pow(10, exponent);
        else if (fraction <= 5)
            return 5 * Math.pow(10, exponent);
        else
            return 10 * Math.pow(10, exponent);
    }
    for (var x = result.max; x > result.min; x -= result.tickSpacing) {
        result.values.push(x);
    }
    return result;
};
exports.niceScale = niceScale;
var PathBuilder = (function () {
    function PathBuilder() {
    }
    PathBuilder.line = function (a, b) {
        var lengthX = b.x - a.x;
        var lengthY = b.y - a.y;
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    };
    PathBuilder.controlPoint = function (line, smooth) { return function (current, previous, next, reverse) {
        var p = previous || current;
        var n = next || current;
        var l = line(p, n);
        var angle = l.angle + (reverse ? Math.PI : 0);
        var length = l.length * smooth;
        var x = current.x + Math.cos(angle) * length;
        var y = current.y + Math.sin(angle) * length;
        return new math_1.Vector2(x, y);
    }; };
    PathBuilder.bezierCommand = function (controlPoint) { return function (point, i, a) {
        var cps = controlPoint(a[i - 1], a[i - 2], point);
        var cpe = controlPoint(point, a[i - 1], a[i + 1], true);
        return 'C {0},{1} {2},{3} {x},{y}'.format(cps.x, cps.y, cpe.x, cpe.y, point);
    }; };
    PathBuilder.svgPath = function (points, command, closePath) {
        return points.reduce(function (acc, e, i, a) {
            if (i == 0)
                return 'M {x},{y}'.format(e);
            if (closePath && i == a.length - 2 ||
                closePath && i == a.length - 1)
                return acc += ' L {x},{y}'.format(e);
            return acc += ' ' + command(e, i, a);
        }, '') + (closePath ? ' z' : '');
    };
    PathBuilder.createPath = function (points, smoothing, closePath) {
        if (closePath === void 0) { closePath = true; }
        var bezierCommandCalc = PathBuilder.bezierCommand(PathBuilder.controlPoint(PathBuilder.line, smoothing));
        return PathBuilder.svgPath(points, bezierCommandCalc, closePath);
    };
    return PathBuilder;
}());
exports.PathBuilder = PathBuilder;
var describeArc = function (x, y, radius, startAngle, endAngle) {
    var start = (0, math_1.polarToCartesian)(x, y, radius, endAngle - 90);
    var end = (0, math_1.polarToCartesian)(x, y, radius, startAngle - 90);
    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        "L", x, y,
        "L", start.x, start.y
    ].join(" ");
    return d;
};
exports.describeArc = describeArc;
