'use strict';


hammerControllers.controller('languageCtrl', function ($scope, globalContent) {
	$scope.languageList = globalContent.languageList;
	$scope.lang = $scope.languageList[0];

	$scope.setLang = function(lang) {
		$scope.lang = lang;
	};

	$scope.removeKey = function(key) {
		delete $scope.lang.map[key];
	};

	$scope.create = function() {
		var _key = $scope.createKey;
		if($scope.lang.map[$scope.createKey] !== undefined) {
			$.dialog({
				title: "OPS!",
				content: "Key already exist! 【键值已存在】"
			});
		} else {
			$scope.lang.map[$scope.createKey] = "";
			setTimeout(function() {
				var ele = $("[data-key='" + _key + "']");
				console.log(ele);
				common.ui.scrollTo(ele);
				ele.find("textarea").focus();
			}, 10);

			$scope.createKey = "";
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
});