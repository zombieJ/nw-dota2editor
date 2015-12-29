'use strict';

hammerControllers.controller('languageCtrl', function ($scope, globalContent) {
	$scope.languageList = globalContent.languageList;
	$scope.lang = $scope.languageList[0];
	$scope.keyList = [];
	$scope.searchKey = "";

	$scope.setLang = function(lang) {
		$scope.lang = lang;
		$scope.search();
	};

	$scope.removeKey = function(key) {
		delete $scope.lang.kv.delete(key);
		$scope.search();
	};

	$scope.create = function() {
		var _key = $scope.createKey;
		if($scope.lang.kv.get($scope.createKey) !== null) {
			$.dialog({
				title: "OPS!",
				content: "Key already exist! 【键值已存在】"
			});
		} else {
			$scope.searchKey = "";
			$scope.lang.kv.set($scope.createKey, "");
			$scope.createKey = "";
			$scope.search();

			setTimeout(function() {
				var ele = $("[data-key='" + _key + "']");
				console.log(ele);
				common.ui.scrollTo(ele);
				ele.find("textarea").focus();
			}, 10);
		}
	};

	$scope.search = function(emptyValue) {
		if(!$scope.lang) return;

		var _key = $scope.searchKey;
		if(!emptyValue) {
			$scope.keyList = $.map($scope.lang.kv.value, function (kv) {
				var key = kv.key;
				var value = kv.value;
				if (key.indexOf(_key) !== -1 || (value || "").indexOf(_key) !== -1) {
					return key;
				}
			});
		} else {
			$scope.keyList = $.map($scope.lang.kv.value, function (kv) {
				if((kv.value || "").trim() === "") {
					return kv.key;
				}
			});
		}
	};

	// ================================================================
	// =                              UI                              =
	// ================================================================
	// 列表框布局
	var winWidth;
	$(window).on("resize.abilityList", function() {
		setTimeout(function() {
			var _winWidth = $(window).width();
			if(_winWidth !== winWidth) {
				var _left = $(".languageCntr").offset().left;
				$("#listCntr").outerWidth(_left - 15);
				$("#floatTool").outerWidth($(".languageCntr").outerWidth());
			}
			winWidth = _winWidth;
		}, 100);
	}).resize();

	$scope.$on("$destroy",function() {
		$(window).off("resize.abilityList");
	});

	// ================================================================
	// =                           Start Up                           =
	// ================================================================
	if($scope.lang) {
		$scope.lang._promise.then(function() {
			$scope.search();
		});
	}
});