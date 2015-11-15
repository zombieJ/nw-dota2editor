'use strict';

var _unitCtrl = function(isHero) {
	return function ($scope, globalContent, NODE, Unit) {
		if (!globalContent.isOpen) return;

		$scope.isHero = isHero;
		$scope.ready = false;
		$scope.abilityList = [];
		$scope.ability = null;

		var _globalListKey = isHero ? "heroList" : "unitList";
		var _globalConfigKey = isHero ? "heroConfig" : "unitConfig";
		var _filePath = isHero ? Unit.heroFilePath : Unit.filePath;

		$scope.currentTab = Unit.AttrCommonList;
		$scope.setCurrentTab = function (current) {
			$scope.currentTab = current;
		};

		// ================================================================
		// =                           Function                           =
		// ================================================================
		$scope.setAbility = function (ability) {
			$scope.ability = ability;
		};

		// ================================================================
		// =                        File Operation                        =
		// ================================================================
		// Read Config file
		if (!globalContent[_globalConfigKey]) {
			NODE.loadFile(Unit[_globalConfigKey], "utf8").then(function (data) {
				$scope.config = JSON.parse(data);
			}, function () {
				$scope.config = {};
			}).finally(function () {
				globalContent[_globalConfigKey] = $scope.config;
			});
		} else {
			$scope.config = globalContent[_globalConfigKey];
		}

		// Read Unit file
		if (!globalContent[_globalListKey]) {
			NODE.loadFile(_filePath, "utf8").then(function (data) {
				var _kv = KV.parse(data);
				$.each(_kv.value, function (i, unit) {
					if (typeof  unit.value !== "string") {
						var _unit = Unit.parse(unit);
						_LOG("Unit", 0, "实体：", _unit._name, _unit);

						$scope.abilityList.push(_unit);
					}
				});

				globalContent[_globalListKey] = $scope.abilityList;
				$scope.setAbility($scope.abilityList[0]);

				setTimeout(function () {
					$(window).resize();
				}, 100);
			}, function () {
				$.dialog({
					title: "OPS!",
					content: "Can't find "+_filePath+" <br/> 【打开"+_filePath+"失败】",
				});
			}).finally(function () {
				$scope.ready = true;
			});
		} else {
			$scope.abilityList = globalContent[_globalListKey];
			$scope.setAbility($scope.abilityList[0]);
			$scope.ready = true;
		}

		// 多语言支持
		$scope.languageList = globalContent.languageList;
		globalContent.languageList._promise.then(function () {
			$scope.language = $scope.languageList[0];
		});

		// ================================================================
		// =                              UI                              =
		// ================================================================
		// Select ability
		$scope.setAbilityMouseDown = function (ability) {
			$scope.setAbility(ability);
		};

		// 列表框布局
		var winWidth;
		$(window).on("resize.abilityList", function () {
			setTimeout(function () {
				var _winWidth = $(window).width();
				var $abilityCntr = $(".abilityCntr");

				if (_winWidth !== winWidth && $abilityCntr.length) {
					var _left = $abilityCntr.offset().left;
					$("#listCntr").outerWidth(_left - 15);
					$("#newItem").outerWidth(_left - 15);
					winWidth = _winWidth;
				}
			}, 100);
		}).resize();

		// 禁止列表框滚屏
		$("#listCntr").on("mousewheel.abilityList", function (e) {
			var _my = $(this);

			var _delta = e.originalEvent.wheelDelta;
			var _top = _my.scrollTop();
			var _height = _my.outerHeight();
			var _scrollHeight = _my[0].scrollHeight;

			if ((_delta > 0 && _top <= 0) || (_delta < 0 && _top + _height >= _scrollHeight)) {
				e.preventDefault();
			}
		});
	};
};

hammerControllers.controller('unitCtrl', _unitCtrl(false));
hammerControllers.controller('heroCtrl', _unitCtrl(true));