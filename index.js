var _ = require("lodash");
var raf = require("raf");
var assert = require("assert");

var Mixin = {
	_deferMixinTimeouts: null,
	_deferMixinIntervals: null,
	_deferMixinAFTimeouts: null,
	_deferMixinAFIntervals: null,
	_deferMixinHasUnmounted: null,
	deferAnimationFrame: function deferToNextAnimationFrame(fn) {
		var _this = this;
		return IfMounted(function() {
			var k = _.uniqueId("deferAnimationFrame");
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
		});
	},
	intervalAnimationFrame: function intervalAnimationFrame(fn) {
		var _this = this;
		return IfMounted(function() {
			if(this._deferMixinHasUnmounted) {
				return;
			}
			var k = _.uniqueId("intervalAnimationFrame");
			var args = arguments;
			var i = raf(function z() {
				i = raf(z);
				fn.apply(_this, args);
			});
			var r = _this._deferMixinAFIntervals[k] = {
				clear: function clear() {
					i.cancel();
					delete _this._deferMixinIntervals[k];
				}
			};
			return r;
		});
	},
	timeout: function timeout(fn, delay) {
		var _this = this;
		return IfMounted(function() {
			if(this._deferMixinHasUnmounted) {
				return;
			}
			var k = _.uniqueId("timeout");
			var args = arguments;
			var t = setTimeout(function() {
				delete _this._deferMixinTimeouts[k];
				fn.apply(_this, args);
			}, delay);
			var r = _this._deferMixinTimeouts[k] = {
				clear: function clear() {
					clearTimeout(t);
					delete _this._deferMixinTimeouts[k];
				},				
			};
			return r;
		});
	},
	defer: function defer(fn) {
		return this.timeout(fn, 1);
	},
	interval: function interval(fn, period) {
		var _this = this;
		return IfMounted(function() {
			if(this._deferMixinHasUnmounted) {
				return;
			}
			k = _.uniqueId("interval");
			var args = arguments;
			var i = setInterval(function() {
				fn.apply(_this, args);
			}, period);
			var r = _this._deferMixinIntervals[k] = {
				clear: function clear() {
					clearInterval(i);
					delete _this._deferMixinIntervals[k];
				},
			};
			return r;
		});
	},
	componentWillMount: function componentWillMount() {
		this._deferMixinTimeouts = {};
		this._deferMixinIntervals = {};
		this._deferMixinAFTimeouts = {};
		this._deferMixinAFIntervals = {};
		this._deferMixinHasUnmounted = false;
	},
	componentWillUnmount: function componentWillUnmount() {
		this._deferMixinHasUnmounted = true;
		_.each(this._deferMixinTimeouts, function(r) { r.clear(); });
		_.each(this._deferMixinIntervals, function(r) { r.clear(); });
		_.each(this._deferMixinAFTimeouts, function(r) { r.clear(); });
		_.each(this._deferMixinAFIntervals, function(r) { r.clear(); });
	},
};

var Deferred = function Deferred(fn) {
	return function() {
		return this.defer(fn).apply(this, arguments);
	};
};

var IfMounted = function IfMounted(fn) {
	return function() {
		if(this._deferMixinHasUnmounted) {
			return;
		}
		else {
			return fn.apply(this, arguments);
		}
	};
};

var DeferredAnimationFrame = function DeferredAnimationFrame(fn) {
	return function() {
		return this.deferAnimationFrame(fn).apply(this, arguments);
	};
};

module.exports = {
	Mixin: Mixin,
	IfMounted: IfMounted,
	Deferred: Deferred,
	DeferredAnimationFrame: DeferredAnimationFrame,
};