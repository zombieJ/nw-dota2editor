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
				$("#floatTool").outerWidth($(".languageCntr").width());
			}
			winWidth = _winWidth;
		}, 100);
	}).resize();

	$scope.$on("$destroy",function() {
		$(window).off("resize.abilityList");
	});
});