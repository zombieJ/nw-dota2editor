'use strict';

components.directive('operationlist', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			operationlist: "=",		// KV List
			alternative: "=",		// Provide alternative operation items
			ability: "=",
		},
		controller: function($scope, $element, $attrs, Locale, UI, KV) {
			$scope.Locale = Locale;
			$scope.UI = UI;
			$scope.KV = KV;
		},
		template:
		'<div class="ability-operation-list">'+
			'<div ng-repeat="operation in operationlist track by $index" class="ability-operation">'+
				'<div class="ability-operation-header">' +
					'<a class="fa fa-trash" ng-click="UI.arrayDelete(operation, operationlist)"></a>' +
					'<select class="form-control" ng-model="operation.key">'+
						'<option ng-repeat="_operation in alternative track by $index" value="{{_operation[0]}}">{{_operation[0]}} 【{{Locale(_operation[0])}}】</option>'+
					'</select>'+
				'</div>'+
				'<div operation="operation" data-ability="ability"></div>'+
			'</div>'+
			'<a ng-click="operationlist.push(KV.new(\'\', []))">+ {{Locale(\'NewOperation\')}}</a>'+
		'</div>',
		replace: true
	};
});