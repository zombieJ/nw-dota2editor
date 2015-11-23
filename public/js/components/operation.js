'use strict';

components.directive('operation', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			operation: "=",		// KV Entity
			ability: "=",		// Source Ability
		},
		controller: function($scope, $element, $attrs, Operation, UI) {
			$scope.Operation = Operation;
			$scope.UI = UI;

			var _customizeKV = [];
			$scope.getCustomizeKV = function() {
				_customizeKV.splice(0);

				var _oriAttrs = Operation.EventOperationMap[$scope.operation.key];
				if(!_oriAttrs) return _customizeKV;

				_oriAttrs = _oriAttrs[2];
				$.each($scope.operation.value, function(i, _kvUnit) {
					if($.inArray(_kvUnit.key, _oriAttrs) === -1) {
						_customizeKV.push(_kvUnit);
					}
				});
				return _customizeKV;
			};
		},
		template:
		'<ul class="ability-operation-body">'+
			'<li ng-repeat="opAttr in Operation.EventOperationMap[operation.key][2] track by $index">'+
				'<span class="text-muted">{{opAttr}}:</span>'+
				// TODO: Link '<a class="fa fa-link" ng-if="getOpColLink(_index)" ng-click="getOpColLink(_index)()"></a>'+

				// Operation Attribute
				'<div kvfield data-ability="ability" data-attrunit="Operation.OperationAttrMap[opAttr]" data-srcunit="operation" data-srctmpl="Operation.OperationAttrMap"></div>' +
			'</li>'+

			'<li ng-repeat="customizeKV in getCustomizeKV() track by $index">' +
				'<a ng-click="UI.arrayDelete(customizeKV, operation.value)">[X]</a>'+
				'<span class="text-muted">{{customizeKV.key}}:</span>'+
				'<div class="ability-form"><input type="text" ng-model="customizeKV.value" /></div>' +
			'</li>' +
		'</ul>',
		replace : true
	};
});