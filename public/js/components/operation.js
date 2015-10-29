'use strict';

components.directive('eventoperation', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			container: "=",
			path: "@",
		},
		controller: function($scope, $element, $attrs, Ability, Event, Operation) {
			$scope.Ability = Ability;
			$scope.Event = Event;
			$scope.Operation = Operation;
			$scope.common = common;

			$scope.getOperationColumn = function(operation) {
				var op = common.array.find(operation, Operation.EventOperation, "0");
				return op ? op[3] : [];
			};

			$scope.addOperation = function() {
				$scope.container[$scope.path].push(new Operation());
			};
		},
		template:
			'<div>'+
			'<div ng-repeat="(operation_index, operation) in container[path] track by $index" class="group-operation">'+
				'<div class="group-operationAttr">'+
					'<label>' +
						'Operation {{::operation_index + 1}}' +
						'<a href="javascript:void(0)" ng-click="common.array.remove(operation, container[path])">[X]</a>'+
					'</label>'+
					'<select class="form-control" ng-model="operation.name">'+
						'<option ng-repeat="_operation in Operation.EventOperation track by $index" value="{{::_operation[0]}}">{{::_operation[0]}} 【{{::_operation[1]}}】</option>'+
					'</select>'+

					'<table class="table table-condensed">'+
						'<tbody>'+
							'<tr ng-repeat="opCol in getOperationColumn(operation.name) track by $index">'+
								'<td width="20%">{{::opCol}}</td>'+
								'<td>' +
								'<div operationfield data-operation="operation" data-opcol="opCol"></div>' +
								'</td>'+
							'</tr>'+
						'</tbody>'+
					'</table>'+
				'</div>'+
			'</div>'+
			'<a class="btn btn-link" ng-click="addOperation()" href="javascript:void(0);">+ new operation 【新建操作】</a>'+
			'</div>',
		replace : true
	};
});