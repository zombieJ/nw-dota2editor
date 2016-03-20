'use strict';

hammerControllers.controller('languageCtrl', function ($scope, Locale, globalContent) {
	$scope.filteredList = [];
	$scope.searchKey = "";
	$scope.pageSize = 10;
	$scope.pageNumber = 0;
	$scope.currentList = [];
	var _lastSearchEmptyValue = false;

	$scope.newKV = function() {
		UI.modal.input(Locale('New'), Locale('Key'), '', function(key) {
			var _kv = globalContent.currentLanguage.kv.getKV(key);
			if(_kv) return false;

			// Fill KV
			_kv = globalContent.currentLanguage.kv.assumeKey(key);
			$scope.searchKey = "";
			$scope.search(false);

			// Focus
			var _totalPageCount = $scope.navPages().length;
			$scope.updateCurrentList(_totalPageCount - 1);
			$scope.$apply();

			setTimeout(function() {
				$("textarea[data-key='" + _kv.key + "']").focus();
			}, 100);
		});
	};

	$scope.search = function(emptyValue) {
		if(!GC.currentLanguage) return;
		_lastSearchEmptyValue = emptyValue;

		var _key = ($scope.searchKey || "").toUpperCase();
		if(!emptyValue) {
			$scope.filteredList = $.map(GC.currentLanguage.kv.value, function (kv) {
				var key = (kv.key || "").toUpperCase();
				var value = (kv.value || "").toUpperCase();
				if (key.indexOf(_key) !== -1 || (value || "").indexOf(_key) !== -1) {
					return kv;
				}
			});
		} else {
			$scope.filteredList = $.map(GC.currentLanguage.kv.value, function (kv) {
				if((kv.value || "").trim() === "") {
					return kv;
				}
			});
		}

		$scope.updateCurrentList(0);
	};

	$scope.updateCurrentList = function(pageNum) {
		$scope.pageNumber = pageNum;
		$scope.currentList = $scope.filteredList.slice($scope.pageNumber * $scope.pageSize, ($scope.pageNumber + 1) * $scope.pageSize);
	};

	$scope.navPages = function() {
		return common.array.num(Math.ceil($scope.filteredList.length / $scope.pageSize));
	};

	$scope.refresh = function(ignorePageNum) {
		var _pageNum = $scope.pageNumber;
		$scope.search(_lastSearchEmptyValue);

		if(ignorePageNum !== true) {
			$scope.updateCurrentList(Math.min(_pageNum, $scope.navPages().length - 1));
		}
	};

	// ================================================================
	// =                           Start Up                           =
	// ================================================================
	if(GC.currentLanguage) {
		GC.currentLanguage._promise.then(function() {
			$scope.search();
		});
	}

	// ================================================================
	// =                          Global Key                          =
	// ================================================================
	globalContent.hotKey($scope, {
		N: function() {
			$scope.newKV();
		},
		_N: "Create new KV",
		F: function() {
			$("#search").focus();
		},
		_F: "Search KV"
	});
});