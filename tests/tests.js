/** @jsx React.DOM */
var DeferMixin = require("..");
var React = require("react");

var Component = React.createClass({displayName: 'Component',
	mixins: [DeferMixin],
	deferHello: DeferMixin.Deferred(function() {
		console.warn("hello");
	}),
	render: function render() {
		return null;
	},
});

console.warn(React.renderComponentToString(Component(null)));