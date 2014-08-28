var _ = require("lodash");
var raf = require("raf");

var Mixin = {
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
			var t = raf(function() {
				delete _this._deferMixinAFTimeouts[k];
				fn.apply(_this, args);
			});
			var r = this._deferMixinAFTimeouts = {
				clear: function clear() {
					t.cancel();
					delete _this._deferMixinAFTimeouts[k];
				},				
			};
			return r;
		};
	},
	intervalAnimationFrame: function intervalAnimationFrame(fn) {
		var _this = this;
		return function() {
			var k = this._deferMixinAFIntervalsLastIndex++;
			var args = arguments;
			var i = raf(function z() {
				i = raf(z);
				fn.apply(_this, args);
			});
			var r = this._deferMixinAFIntervals[k] = {
				clear: function clear() {
					i.cancel();
					delete _this._deferMixinIntervals[k];
				}
			};
			return r;
		};
	},
	timeout: function timeout(fn, delay) {
		var _this = this;
		return function() {
			var k = this._deferMixinTimeoutsLastIndex++;
			var args = arguments;
			var t = setTimeout(function() {
				delete _this._deferMixinTimeouts[k];
				fn.apply(_this, args);
			}, delay);
			var r = this._deferMixinTimeouts[k] = {
				clear: function clear() {
					clearTimeout(t);
					delete _this._deferMixinTimeouts[k];
				},				
			};
			return r;
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
			var i = setInterval(function() {
				fn.apply(_this, args);
			}, period);
			var r = this._deferMixinIntervals[k] = {
				clear: function clear() {
					clearInterval(i);
					delete _this._deferMixinIntervals[k];
				},
			};
			return r;
		};
	},
	componentWillUnmount: function componentWillUnmount() {
		_.each(this._deferMixinTimeouts, function(r) { r.clear(); });
		_.each(this._deferMixinIntervals, function(r) { r.clear(); });
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