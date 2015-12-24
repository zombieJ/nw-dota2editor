'use strict';

components.directive('operationlist', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			operationlist: "=",		// KV List
			alternative: "=",		// Provide alternative operation items
			ability: "=",
		},
		controller: function($scope, $element, $attrs, Locale, UI, KV, Config) {
			$scope.Locale = Locale;
			$scope.Config = Config;
			$scope.UI = UI;
			$scope.KV = KV;

			$scope.getOperationlist = function() {
				return $.grep($scope.operationlist || [], function(operation) {
					var _listOperation = operation.isList();
					if(!_listOperation && operation.key !== "DeleteOnHit") {
						_WARN("Operation", 0, "Not an group operation.", operation);
					}
					return _listOperation;
				});
			};

			$scope.changeOperation = function(operation, oldKey) {
				operation._valueCache = operation._valueCache || {};
				// Cache old list
				if(oldKey) {
					operation._valueCache[oldKey] = operation.value;
				}
				// Fetch if cache hit
				if(operation._valueCache[operation.key]) {
					operation.value = operation._valueCache[operation.key];
				} else {
					operation.value = [];
				}
			};

			$scope.addCustomizeKV = function(operation) {
				UI.modal.input("Add Customize KV", "Key Name", function(key) {
					var _list = Operation.EventOperationMap[operation.key][2];
					if(!key || common.array.find(key, _list, "", false, false)) {
						$.dialog({
							title: Locale('Error'),
							content: Locale('conflictName'),
						});
						return false;
					} else {
						operation.value.push(new KV(key, ""));
					}
				});
			};
		},
		template:
		'<div class="ability-operation-list">'+
			'<div ng-repeat="operation in getOperationlist() track by $index" class="ability-operation">'+
				'<div class="ability-operation-header">' +
					'<a class="fa fa-trash" ng-click="UI.arrayDelete(operation, operationlist)"></a>' +
					'<div class="ability-operation-selector" ng-switch="Config.global.operationUseText">' +
						'<input tipfield class="form-control" type="text" ng-model="operation.key" data-alternative="alternative" ng-switch-when="true" />' +
						'<select class="form-control" ng-model="operation.key" ng-change="changeOperation(operation, \'{{operation.key}}\')" ng-switch-default >'+
							'<option ng-repeat="_operation in alternative track by $index" value="{{_operation.value}}">{{_operation.value}} 【{{Locale(_operation.value)}}】</option>'+
						'</select>'+
					'</div>'+
					'<a class="fa fa-plus" ng-show="operation.key" ng-click="addCustomizeKV(operation)"></a>' +
				'</div>'+
				'<div operation="operation" data-ability="ability"></div>'+
			'</div>'+
			'<a ng-click="operationlist.push(KV.new(\'\', []))">+ {{Locale(\'NewOperation\')}}</a>'+
		'</div>',
		replace: true
	};
});