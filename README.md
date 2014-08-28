react-defer
===========
Just a quick mixin to avoid headaches and `componentWillMount`/`componentWillUnmount` boilerplate when dealing with deferreds and intervals in components that get unmounted.

Supports executing any deferred inline function or auto-defers a method. Also works with intervals.

### Examples

```jsx
var DeferMixin = require("react-defer").Mixin;
var Deferred = require("react-defer").Deferred;

React.createClass({
	mixins: [DeferMixin],
	alwaysDeferThisMethod: DeferMixin.Deferred(function() {
		this.setState({
			hello: "world",
		});
	}),
	nonDeferredMethod: function() {
		this.setState({
			sup: "bro",
		});
	},
	someOtherMethod: function() {
		this.defer(this.nonDeferredMethod)("some", "args");
	},
}
});


### API

#### `Mixin.timeout(fn: function, delay: Number): function`
Returns a function that will be deferred by `delay` upon calling (like a currified `setTimeout`).
If the components unmounts before the timeout expires, then the timeout is silently cleared.
The returned function itself returns an `Object` with a single method, `clear`, which clears the underlying timeout manually.

#### `Mixin.defer(fn: function): function`
Shortcut to `timeout(fn, 1)`. Useful to `setState` in the next rendering cycle, althought this might very well be code smell.

#### `Mixin.interval(fn, function, period: Number): function`
Similar to `timeout` but instead sets an interval.

#### `Mixin.deferAnimationFrame(fn: function)`
Similar to `defer` but instead defers to the next animation frame.
Uses [the `raf` npm package](https://www.npmjs.org/package/raf) `requestAnimationFrame` polyfill.

#### `Mixin.intervalAnimationFrame(fn: function)`
Similar to `interval` but instead ticks on each next animation frame.
Uses [the `raf` npm package](https://www.npmjs.org/package/raf) `requestAnimationFrame` polyfill.

#### `Deferred(fn: function): function`
Returns a function with the same `this` context that is deferred. Useful for defining methods that are always called deferred.
Code smell warning, you should know whether your function call is going to be deferred or not.

#### `DeferredAnimationFrame(fn: function): function`
Similar to `Deferred` but instead defers to the next animation frame.
Uses [the `raf` npm package](https://www.npmjs.org/package/raf) `requestAnimationFrame` polyfill.




### License
MIT Elie Rotenberg <elie@rotenberg.io>