'use strict';

components.directive('eventoperation', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			container: "=",
			path: "@",
		},
		controller: function($scope, $element, $attrs, Event, Operation) {
			$scope.Event = Event;
			$scope.Operation = Operation;

			$scope.getOperationColumn = function(operation) {
				var op = common.array.find(operation, Operation.EventOperation, "0");
				return op ? op[3] : [];
			};

			$scope.validateColOperation = function(operation, opCol) {
				if(Operation.EventOperationMap[opCol].type === "operation" && operation.attrs[opCol] === undefined) {
					operation.attrs[opCol] = [];
				}
			}

			$scope.addOperation = function() {
				$scope.container[$scope.path].push(new Operation());
			};
		},
		compile: function(tElement, tAttr) {
			var contents = tElement.contents().remove();
			var compiledContents;
			return function(scope, iElement, iAttr) {
				if(!compiledContents) {
					compiledContents = $compile(contents);
				}
				compiledContents(scope, function(clone, scope) {
					iElement.append(clone); 
				});
			};
		},
		template:
			'<div>'+
			'<div ng-repeat="(operation_index, operation) in container[path]" class="group-operation">'+
				'<div class="group-operationAttr">'+
					'<label>Operation {{operation_index + 1}}</label>'+
					'<select class="form-control" ng-model="operation.name">'+
						'<option ng-repeat="_operation in Operation.EventOperation" value="{{_operation[0]}}">{{_operation[0]}} 【{{_operation[1]}}】</option>'+
					'</select>'+

					'<table class="table table-condensed">'+
						'<tbody>'+
							'<tr ng-repeat="opCol in getOperationColumn(operation.name)">'+
								'<td width="20%">{{opCol}}</td>'+
								'<td>'+
									// Single
									'<select ng-show="Operation.EventOperationMap[opCol].type === \'single\'"'+
									'	class="form-control" ng-model="operation.attrs[opCol]">'+
									'	<option ng-repeat="opVal in Operation.EventOperationMap[opCol].value">{{opVal}}</option>'+
									'</select>'+

									// Text
									'<input ng-show="Operation.EventOperationMap[opCol].type === \'text\'"'+
									'	type="text" class="form-control" ng-model="operation.attrs[opCol]" />'+

									// Blob
									'<textarea ng-show="Operation.EventOperationMap[opCol].type === \'blob\'"'+
									'	class="form-control" ng-model="operation.attrs[opCol]" rows="5"></textarea>'+

									// Bool
									'<input ng-show="Operation.EventOperationMap[opCol].type === \'bool\'"'+
									'	ng-init="operation.attrs[opCol] = Operation.EventOperationMap[opCol].type === \'bool\' && operation.attrs[opCol] === undefined ? false : operation.attrs[opCol]"'+
									'   type="checkbox" ng-checked="operation.attrs[opCol]"'+
									'   ng-click="operation.attrs[opCol] = !operation.attrs[opCol]" />'+

									// Operation List
									'<div ng-if="Operation.EventOperationMap[opCol].type === \'operation\'"'+
									'	ng-init="validateColOperation(operation, opCol)"'+
									'>'+
										'<div eventoperation data-container="operation.attrs" data-path="{{opCol}}"></div>'+
									'</div>'+
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