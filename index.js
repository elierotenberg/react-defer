var _ = require("lodash");
var raf = require("raf");

var DeferMixin = {
	_deferMixinTimeoutsLastIndex: null,
	_deferMixinTimeouts: null,
	_deferMixinIntervalsLastIndex: null,
	_deferMixinIntervals: null,
	_deferMixinAFTimeoutsLastIndex: null,
	_deferMixinAFTimeouts: null,
	_deferMixinAFIntervalsLastIndex: null,
	_deferMixinAFIntervals: null,
	componentWillMount: function componentWillMount() {
		this._deferMixinIntervalsLastIndex = 0;
		this._deferMixinTimeouts = {};
		this._deferMixinIntervalsLastIndex = 0;
		this._deferMixinIntervals = {};
		this._deferMixinTimeoutsLastIndex = 0;
		this._deferMixinAFTimeouts = {};
		this._deferMixinIntervalsLastIndex = 0;
		this._deferMixinAFIntervals = {};
	},
	deferAnimationFrame: function deferToNextAnimationFrame(fn) {
		var _this = this;
		return function() {
			var k = this._deferMixinTimeoutsLastIndex++;
			var args = arguments;
			var t = this._deferMixinAFTimeouts[k] = raf(function() {
				delete _this._deferMixinAFTimeouts[k];
				fn.apply(_this, args);
			});
			return {
				clear: function clear() {
					t.cancel();
					delete _this._deferMixinAFTimeouts[k];
				},
			};
		};
	},
	intervalAnimationFrame: function intervalAnimationFrame(fn) {
		var _this = this;
		return function() {
			var k = this._deferMixinAFIntervalsLastIndex++;
			var args = arguments;
			var i = this._deferMixinAFIntervals[k] = raf(function z() {
				i = this._deferMixinAFIntervals[k] = raf(z);
				fn.apply(_this, args);
			});
			return {
				clear: function clear() {
					i.cancel();
					delete _this._deferMixinIntervals[k];
				}
			}
		}
	},
	timeout: function timeout(fn, delay) {
		var _this = this;
		return function() {
			var k = this._deferMixinTimeoutsLastIndex++;
			var args = arguments;
			var t = this._deferMixinTimeouts[k] = setTimeout(function() {
				delete _this._deferMixinTimeouts[k];
				fn.apply(_this, args);
			}, delay);
			return {
				clear: function clear() {
					clearTimeout(t);
					delete _this._deferMixinTimeouts[k];
				}
			};
		};
	},
	defer: function defer(fn) {
		return this.timeout(fn, 1);
	},
	interval: function interval(fn, period) {
		var _this = this;
		return function() {
			var k = this._deferMixinIntervalsLastIndex++;
			var args = arguments;
			var i = this._deferMixinIntervals[k] = setInterval(function() {
				fn.apply(_this, args);
			}, period);
			return {
				clear: function clear() {
					clearInterval(i);
					delete _this._deferMixinIntervals[k];
				},
			};
		};
	},
	componentWillUnmount: function componentWillUnmount() {
		_.each(this._deferMixinTimeouts, function(t) { t.clear(); });
		_.each(this._deferMixinIntervals, function(i) { i.clear(); });
	},
};

var Deferred = function Deferred(fn) {
	return function() {
		return this.defer(fn).apply(this, arguments);
	};
};

var DeferredAnimationFrame = function DeferredAnimationFrame(fn) {
	return function() {
		return this.deferAnimationFrame(fn).apply(this, arguments);
	};
};

module.exports = {
	Mixin: Mixin,
	Deferred: Deferred,
	DeferredAnimationFrame: DeferredAnimationFrame,
};