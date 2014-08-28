react-defer
===========
Just a quick mixin to avoid headaches and `componentWillMount`/`componentWillUnmount` boilerplate when dealing with deferreds and intervals in components that get unmounted.
Supports executing any deferred inline function or auto-defers a method. Also works with intervals.

The enforced semantics are the following:
"Execute the function if the component is still mounted by the time it kicks in. Otherwise, silently discard it altogether and clean up after yourself."

In particular, if you chain deferrals, you may end up calling deferred callbacks after the component has unmounted (for exemple when a Promise of whatever is resolved).
Wrap the callback in Defer.IfMounted and if this happens, it will silently fail.

### Examples

```jsx
var Defer = require("react-defer");

React.createClass({
	mixins: [DeferMixin],
	alwaysDeferThisMethod: Defer.Deferred(function() {
		this.setState({
			hello: "world",
		});
	}),
	alwaysRAFThisMethod: Defer.DeferredAnimationFrame(function() {
		somethingThatAlwaysNeedsToBeDoneInNextAF();
	}),
	nonDeferredMethod: function() {
		this.setState({
			sup: "bro",
		});
	},
	someOtherMethod: function() {
		this.defer(this.nonDeferredMethod)("some", "args");
	},
	someInterfacingMethod: function() {
		this.giveMeSomthingReturningAPromise().then(Defer.IfMounted(this.nonDeferredMethod));
	},
}
});
```


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

#### `IfMounted(fn: function): function`
Returns a function with the same this context that will silently fail if it is invoked after the component has unmounted.

#### `Deferred(fn: function): function`
Returns a function with the same `this` context that is deferred. Useful for defining methods that are always called deferred.
Code smell warning, you should know whether your function call is going to be deferred or not.

#### `DeferredAnimationFrame(fn: function): function`
Similar to `Deferred` but instead defers to the next animation frame.
Uses [the `raf` npm package](https://www.npmjs.org/package/raf) `requestAnimationFrame` polyfill.




### License
MIT Elie Rotenberg <elie@rotenberg.io>