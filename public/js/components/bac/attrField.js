'use strict';

components.directive('attrfield', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			srctmpl: "=",
			srcunit: "=",
			attrunit: "=",
			ability: "=",
			path: "@",
		},
		template:
		'<div ng-switch="attrunit.type" class="ability-form">' +
			// Blob
			'<textarea class="form-control" rows="5" ng-model="srcunit[attrunit.attr]" placeholder="[None]" ng-switch-when="blob"></textarea>'+

			// Group
			'<div groupselect data-ability="srcunit" data-attr="{{attrunit.attr}}" data-base="srctmpl" ng-switch-when="group"></div>' +

			// Single
			'<div groupselect data-ability="srcunit" data-attr="{{attrunit.attr}}" data-base="srctmpl" data-single="true" ng-switch-when="single"></div>' +

			// Boolean
			'<input type="checkbox" ng-checked="srcunit[attrunit.attr]" ng-switch-when="boolean" ' +
			'ng-click="srcunit[attrunit.attr] = !srcunit[attrunit.attr]" />' +

			// Text
			'<input tipfield class="form-control" ng-model="srcunit[attrunit.attr]" ng-switch-when="text" ' +
			'data-alternative="srctmpl[attrunit.attr]" data-matchfuc="attrunit.match(srcunit[attrunit.attr], ability)" />' +

			// Default
			'<p ng-switch-default>{{attrunit.type}}</p>' +
		'</div>',
		replace: true
	};
});