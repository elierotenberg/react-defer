/** @jsx React.DOM */
var DeferMixin = require("..").Mixin;
var Deferred = require("..").Deferred;
var React = require("react");

var Component = React.createClass({
	mixins: [DeferMixin],
	deferHello: Deferred(function() {
		console.warn("hello");
	}),
	render: function render() {
		return null;
	},
});

console.warn(React.renderComponentToString(<Component />));