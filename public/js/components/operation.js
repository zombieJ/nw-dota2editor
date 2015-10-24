'use strict';

var components = angular.module('app.components', []);

components.directive('eventoperation', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			operation: "=",
		},
		controller: function($scope, $element, $attrs, Operation) {
			$scope.Operation = Operation;

			$scope.getOperationColumn = function(operation) {
				var op = common.array.find(operation, Operation.EventOperation, "0");
				return op ? op[3] : [];
			};
		},
		template : 
			'<div class="group-operationAttr">'+
				'<table class="table table-condensed">'+
					'<tbody>'+
						'<tr ng-repeat="opCol in getOperationColumn(operation.name)">'+
							'<td width="25%">{{opCol}}</td>'+
							'<td>'+
								'<!-- Single -->'+
								'<select ng-show="Operation.EventOperationMap[opCol].type === \'single\'"'+
								'	class="form-control" ng-model="operation.attrs[opCol]">'+
								'	<option ng-repeat="opVal in Operation.EventOperationMap[opCol].value">{{opVal}}</option>'+
								'</select>'+

								'<!-- Text -->'+
								'<input ng-show="Operation.EventOperationMap[opCol].type === \'text\'"'+
								'	type="text" class="form-control" ng-model="operation.attrs[opCol]" />'+

								'<!-- Blob -->'+
								'<textarea ng-show="Operation.EventOperationMap[opCol].type === \'blob\'"'+
								'	class="form-control" ng-model="operation.attrs[opCol]" rows="5"></textarea>'+

								'<!-- Bool -->'+
								'<input ng-show="Operation.EventOperationMap[opCol].type === \'bool\'"'+
								'	ng-init="operation.attrs[opCol] = Operation.EventOperationMap[opCol].type === \'bool\' && operation.attrs[opCol] === undefined ? 0 : operation.attrs[opCol]"'+
								'	type="checkbox" ng-checked="operation.attrs[opCol]"'+
								'	ng-click="operation.attrs[opCol] = !operation.attrs[opCol] ? 1 : 0" />'+
							'</td>'+
						'</tr>'+
					'</tbody>'+
				'</table>'+
			'</div>',
		replace : true
	};
});