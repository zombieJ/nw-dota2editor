'use strict';

components.directive('eventoperation', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			container: "=",
			isitem: "=?isitem",
			path: "@",
		},
		controller: function($scope, $element, $attrs, Ability, Event, Operation) {
			$scope.Ability = Ability;
			$scope.Event = Event;
			$scope.Operation = Operation;
			$scope.common = common;

			$scope.EventOperation = $scope.isitem ? Operation.EventItemOperation : Operation.EventOperation;

			$scope.getOperationColumn = function(operation) {
				var op = common.array.find(operation, $scope.EventOperation, "0");
				return op ? op[3] : [];
			};

			$scope.addOperation = function() {
				$scope.container[$scope.path] = $scope.container[$scope.path] || [];
				$scope.container[$scope.path].push(new Operation());
			};

			// ================================================================
			// =                         Optimization                         =
			// ================================================================
			$scope.optOperationNum = common.array.num(1);
			$scope.$watch("container[path].length", function() {
				if(!$scope.container || !$scope.container[$scope.path]) return;
				if(!$.isArray($scope.container[$scope.path])) $scope.container[$scope.path] = [];

				if($scope.container[$scope.path].length > $scope.optOperationNum.length) {
					$scope.optOperationNum = common.array.num($scope.container[$scope.path].length);
				}
			});
		},
		template:
		'<div>'+
		'	<div ng-repeat="_index in optOperationNum track by $index" ng-show="container[path][_index]" class="group-operation">'+
		'		<div class="group-operationAttr">'+
		'			<label>' +
		'				<a href="javascript:void(0)" ng-click="common.array.remove(container[path][_index], container[path])">[X]</a>'+
		'					Operation {{_index + 1}}' +
		'			</label>'+
		'			<select class="form-control" ng-model="container[path][_index].name">'+
		'				<option ng-repeat="_operation in EventOperation track by $index" value="{{::_operation[0]}}">{{::_operation[0]}} 【{{::_operation[1]}}】</option>'+
		'			</select>'+

		'			<div operationgroup data-operation="container[path][_index]"></div>'+
		'		</div>'+
		'	</div>'+
		'	<a class="btn btn-link" ng-click="addOperation()" href="javascript:void(0);">+ new operation 【新建操作】</a>'+
		'</div>',
		replace : true
	};
});