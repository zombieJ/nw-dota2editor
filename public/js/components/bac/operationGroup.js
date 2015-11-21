'use strict';

components.directive('operationgroup', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			operation: "=",
			ability: "=",
		},
		controller: function($scope, $element, $attrs, Operation) {
			$scope.common = common;

			$scope.EventOperation = $scope.isitem ? Operation.EventItemOperation : Operation.EventOperation;

			var _operationColumnCache = {};
			$scope.getOperationColumn = function(operation) {
				if(_operationColumnCache[operation]) {
					return _operationColumnCache[operation];
				} else {
					var op = common.array.find(operation, $scope.EventOperation, "0");
					_operationColumnCache[operation] = op ? op[3] : "";
					return _operationColumnCache[operation];
				}
			};

			$scope.getOpColLink = function(index) {
				if(!$scope.operation || !$scope.operation.name) return null;

				var _cols = $scope.getOperationColumn($scope.operation.name);
				if(!_cols || _cols.length === 0) return null;

				var _colName = _cols[index];
				if(!_colName) return null;
				var link = Operation.EventOperationMap[_colName].link;
				if(link) {
					return link($scope.operation.attrs[_colName], $scope.operation, $scope.ability);
				} else {
					return null;
				}
			};

			// ================================================================
			// =                         Optimization                         =
			// ================================================================
			$scope.optColumnNum = common.array.num(2);
			$scope.$watch("getOperationColumn(operation.name).length", function() {
				if(!$scope.operation) return;
				var _list = $scope.getOperationColumn($scope.operation.name);
				if(!_list) return;

				if(_list.length > $scope.optColumnNum.length) {
					$scope.optColumnNum = common.array.num(_list.length);
				}
			});
		},
		template:
		'<ul class="ability-operation-body">'+
			'<li ng-repeat="_index in optColumnNum track by $index" ng-show="getOperationColumn(operation.name)[_index]">'+
				'<span class="text-muted">{{getOperationColumn(operation.name)[_index]}}:</span>'+
				'<a class="fa fa-link" ng-if="getOpColLink(_index)" ng-click="getOpColLink(_index)()"></a>'+
				'<div operationfield data-ability="ability" data-operation="operation" data-opcol="getOperationColumn(operation.name)[_index]"></div>' +
			'</li>'+
		'</ul>',
		replace : true
	};
});