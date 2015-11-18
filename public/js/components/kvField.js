'use strict';

components.directive('kvfield', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			srctmpl: "=",
			srcunit: "=",
			attrunit: "=",
			ability: "=",
			path: "@",
		},
		controller: function($scope, $element, $attrs, Locale) {
			$scope.Locale = Locale;

			$scope.getAttrPath = function() {
				if($scope.attrunit.path &&  $scope.attrunit.attr) {
					return $scope.attrunit.path + "." +  $scope.attrunit.attr;
				} else {
					return $scope.attrunit.path ||  $scope.attrunit.attr;
				}
			};

			$scope.getItemList = function () {
				var _list = $scope.srctmpl[$scope.attrunit.attr];
				if (!$.isArray(_list)) {
					console.error("Not Array: ", $scope.attrunit.attr, $scope.srctmpl, _list);
				}
				return _list;
			};
		},
		template:
		'<div ng-switch="attrunit.type" class="ability-form">' +
			// Blob [X]
			//'<textarea class="form-control" rows="5" ng-model="srcunit[getAttrPath()]" placeholder="[None]" ng-switch-when="blob"></textarea>'+

			// Group [X]
			//'<div groupselect data-ability="srcunit" data-attr="{{getAttrPath()}}" data-base="srctmpl" ng-switch-when="group"></div>' +

			// Single
			'<select class="form-control" ng-model="srcunit.kv.bind(getAttrPath())" ng-model-options="{getterSetter: true}" ng-switch-when="single" >' +
				'<option value="">Default 【{{Locale(\'Default\')}}】</option>'+
				'<option ng-repeat="(i, item) in getItemList() track by $index" value="{{item[0]}}">{{item[0]}} 【{{item[1]}}】</option>'+
			'</select>'+

			// Boolean
			'<input type="checkbox" ng-checked="srcunit.kv.getBoolValue(getAttrPath())" ng-model-options="{getterSetter: true}" ng-switch-when="boolean" ' +
			'ng-click="srcunit.kv.reverseBoolValue(getAttrPath())" />' +

			// Text
			'<input tipfield class="form-control" ng-model="srcunit.kv.bind(getAttrPath())" ng-model-options="{getterSetter: true}" ng-switch-when="text" ' +
			'data-alternative="srctmpl[getAttrPath()]" data-matchfuc="attrunit.match(srcunit[getAttrPath()], ability)" />' +

			// Default
			'<p ng-switch-default>{{attrunit.type}}</p>' +
		'</div>',
		replace: true
	};
});