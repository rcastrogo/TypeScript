"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextPowerOfTwo = exports.IsPowerOfTwo = exports.polarToCartesian = exports.Degrees = exports.Radians = exports.Clamp = exports.Random = exports.Rectangle = exports.Box = exports.Vector2 = void 0;
var Vector2 = (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.fromArrayi = function (values) { return new Vector2(~~values[0], ~~values[1]); };
    ;
    Vector2.sum = function (a, b) { return new Vector2(a.x + b.x, a.y + b.y); };
    ;
    Vector2.difference = function (a, b) { return new Vector2(a.x - b.x, a.y - b.y); };
    ;
    Vector2.dot = function (a, b) { return a.x * b.x + a.y * b.y; };
    ;
    Vector2.cross = function (a, b) { return a.x * b.y - a.y * b.x; };
    ;
    Vector2.distance = function (a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); };
    ;
    Vector2.distanceSquared = function (a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return dx * dx + dy * dy; };
    ;
    Vector2.equals = function (a, b) { return a.x == b.x && a.y == b.y; };
    ;
    Vector2.lerp = function (a, b, f, resultVec) {
        var x = a.x, y = a.y;
        resultVec.x = (b.x - x) * f + x;
        resultVec.y = (b.y - y) * f + y;
        return resultVec;
    };
    Vector2.prototype.set = function (x, y) { this.x = x; this.y = y; return this; };
    ;
    Vector2.prototype.clone = function () { return new Vector2(this.x, this.y); };
    ;
    Vector2.prototype.length = function () { return Math.sqrt(this.x * this.x + this.y * this.y); };
    ;
    Vector2.prototype.lengthSquared = function () { return this.x * this.x + this.y * this.y; };
    ;
    Vector2.prototype.invert = function () { this.x = -this.x; this.y = -this.y; return this; };
    ;
    Vector2.prototype.cross = function (vector) { return this.x * vector.y - this.y * vector.x; };
    Vector2.prototype.dot = function (vector) { return this.x * vector.x + this.y * vector.y; };
    ;
    Vector2.prototype.scale = function (sx, sy) { this.x *= sx; this.y *= sy; return this; };
    ;
    Vector2.prototype.normalize = function () { var _d = 1 / this.length(); return this.scale(_d, _d); };
    ;
    Vector2.prototype.normalisedCopy = function () { return new Vector2(this.x, this.y).normalize(); };
    ;
    Vector2.prototype.add = function (vector) { this.x += vector.x; this.y += vector.y; return this; };
    ;
    Vector2.prototype.subtract = function (vector) { this.x -= vector.x; this.y -= vector.y; return this; };
    ;
    Vector2.prototype.mul = function (scalar) { this.x *= scalar; this.y *= scalar; return this; };
    ;
    Vector2.prototype.divide = function (scalar) { this.x /= scalar; this.y /= scalar; return this; };
    ;
    Vector2.prototype.equals = function (vector) { return this == vector || !!vector && this.x == vector.x && this.y == vector.y; };
    ;
    Vector2.prototype.rotate = function (angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var newX = this.x * cos - this.y * sin;
        var newY = this.y * cos + this.x * sin;
        this.x = newX;
        this.y = newY;
        return this;
    };
    ;
    Vector2.Vector2_ZERO = new Vector2(0.0, 0.0);
    Vector2.Vector2_UNIT_X = new Vector2(1.0, 0.0);
    Vector2.Vector2_UNIT_Y = new Vector2(0.0, 1.0);
    Vector2.Vector2_NEGATIVE_UNIT_X = new Vector2(-1.0, 0.0);
    Vector2.Vector2_NEGATIVE_UNIT_Y = new Vector2(0.0, -1.0);
    Vector2.Vector2_UNIT_SCALE = new Vector2(1.0, 1.0);
    Vector2.rotateAroundPoint = function (v, axisPoint, angle) {
        return v.clone()
            .subtract(axisPoint)
            .rotate(angle)
            .add(axisPoint);
    };
    return Vector2;
}());
exports.Vector2 = Vector2;
var Box = (function () {
    function Box(top, right, bottom, left) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    Box.prototype.clone = function () { return new Box(this.top, this.right, this.bottom, this.left); };
    ;
    Box.prototype.toRect = function () { return new Rectangle(this.left, this.top, this.right - this.left, this.bottom - this.top); };
    ;
    Box.prototype.centerPoint = function () { return new Vector2(this.left + ((this.right - this.left) >> 1), this.top + ((this.bottom - this.top) >> 1)); };
    ;
    return Box;
}());
exports.Box = Box;
var Rectangle = (function () {
    function Rectangle(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    Rectangle.prototype.clone = function () { return new Rectangle(this.left, this.top, this.width, this.height); };
    ;
    Rectangle.prototype.toBox = function () { return new Box(this.top, this.left + this.width, this.top + this.height, this.left); };
    ;
    Rectangle.prototype.centerPoint = function () { return new Vector2(this.left + (this.width >> 1), this.top + (this.height >> 1)); };
    ;
    Rectangle.prototype.contains = function (other) {
        if (other instanceof Rectangle) {
            return this.left <= other.left &&
                this.left + this.width >= other.left + other.width &&
                this.top <= other.top &&
                this.top + this.height >= other.top + other.height;
        }
        else {
            return other.x >= this.left &&
                other.x <= this.left + this.width &&
                other.y >= this.top &&
                other.y <= this.top + this.height;
        }
    };
    ;
    return Rectangle;
}());
exports.Rectangle = Rectangle;
function Random(max, min) { return Math.random() * (max - min + 1) + min; }
exports.Random = Random;
function Clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
exports.Clamp = Clamp;
;
function Radians(degrees) { return degrees * Math.PI / 180; }
exports.Radians = Radians;
;
function Degrees(radians) { return radians * 180 / Math.PI; }
exports.Degrees = Degrees;
;
function IsPowerOfTwo(value) { return value > 0 && (value & (value - 1)) == 0; }
exports.IsPowerOfTwo = IsPowerOfTwo;
;
function NextPowerOfTwo(value) { var k = 1; while (k < value)
    k *= 2; return k; }
exports.NextPowerOfTwo = NextPowerOfTwo;
;
function polarToCartesian(x, y, r, angleInDegrees) {
    var __angleInRadians = Radians(angleInDegrees);
    return {
        x: x + (r * Math.cos(__angleInRadians)),
        y: y + (r * Math.sin(__angleInRadians))
    };
}
exports.polarToCartesian = polarToCartesian;
