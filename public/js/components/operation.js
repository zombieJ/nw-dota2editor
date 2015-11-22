'use strict';

components.directive('operation', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			operation: "=",		// KV Entity
			ability: "=",		// Source Ability
		},
		controller: function($scope, $element, $attrs, Operation) {
			$scope.Operation = Operation;
		},
		template:
		'<ul class="ability-operation-body">'+
			'<li ng-repeat="opAttr in Operation.EventOperationMap[operation.key][2] track by $index">'+
				'<span class="text-muted">{{opAttr}}:</span>'+
				// TODO: Link '<a class="fa fa-link" ng-if="getOpColLink(_index)" ng-click="getOpColLink(_index)()"></a>'+

				// Operation Attribute
				'<div kvfield data-ability="ability" data-attrunit="Operation.OperationAttrMap[opAttr]" data-srcunit="operation" data-srctmpl="Operation.OperationAttrMap"></div>' +
			'</li>'+
		'</ul>',
		replace : true
	};
});