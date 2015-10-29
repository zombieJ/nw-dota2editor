'use strict';

components.directive('attrfield', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			srctmpl: "=",
			srcunit: "=",
			attrunit: "=",
			path: "@",
		},
		controller: function ($scope, $element, $attrs) {
		},
		compile: function (element, attrs) {
			return {
				pre: function (scope, element, attrs) {
					var _field;
					var _type = scope.attrunit.type || typeof scope.srcunit[scope.attrunit.attr];
					if(_type === "string" && !scope.srctmpl[scope.attrunit.attr]) {
						_field = $('<input class="form-control" ng-model="srcunit[attrunit.attr]" />');
					} else if(_type === "blob") {
						_field = $('<textarea class="form-control" rows="5" ng-model="srcunit[attrunit.attr]"></textarea>');
					} else if(_type === "object") {
						_field = $('<div groupselect data-ability="srcunit" data-attr="{{::attrunit.attr}}" data-base="srctmpl"></div>');
					} else if(_type === "string" && scope.srctmpl[scope.attrunit.attr]) {
						_field = $('<div groupselect data-ability="srcunit" data-attr="{{::attrunit.attr}}" data-base="srctmpl" data-single="true"></div>');
					} else if(_type === "boolean") {
						_field = $(
							'<input type="checkbox" ng-checked="[attrunit.attr]" '+
							'ng-click="srcunit[attrunit.attr] = !srcunit[attrunit.attr]" />'
						);
					} else {
						console.warn("No match!", _type, scope.srcunit, scope.attrunit.attr);
					}
					if(_field) {
						var compiledContents = $compile(_field);
						compiledContents(scope, function(clone, scope) {
							element.append(clone);
						});
					}
				}
			};
		},
		template: '<div></div>',
		replace: true
	};
});