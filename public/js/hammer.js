'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components']);

hammerControllers.controller('indexCtrl', function ($scope) {
});

var _abilityCtrl = function(isItem) {
	return function ($scope, $http, NODE, globalContent, KV, Ability, Event, Operation, Modifier, GUI) {
		if (!globalContent.isOpen) return;

		var _globalListKey = isItem ? "itemList" : "abilityList";
		var _globalConfigKey = isItem ? "abilityConfig" : "itemConfig";
		var _filePath = isItem ? Ability.itemFilePath : Ability.filePath;

		$scope.abilityList = [];
		$scope.isItem = isItem;

		$scope.setAbility = function (ability) {
			$scope.ability = ability;
		};

		var _iconStep = 0;
		$scope.$watch('ability.AbilityTextureName', function() {
			if(!$scope.ability) return "";

			_iconStep = 0;
			var _path = "";
			if(isItem) {
				_path = globalContent.project + "/resource/flash3/images/items/" + ($scope.ability.AbilityTextureName || "").replace(/^item_/, "") + ".png";
			} else {
				_path = globalContent.project + "/resource/flash3/images/spellicons/" + ($scope.ability.AbilityTextureName || "") + ".png";
			}
			$(".ability-img").attr("src", _path);
		});
		window.iconError = function() {
			if(_iconStep === 0) {
				_iconStep = 1;

				var _path = "";
				if(isItem) {
					_path = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/flash3/images/items/" + ($scope.ability.AbilityTextureName || "").replace(/^item_/, "") + ".png";
				} else {
					_path = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/flash3/images/spellicons/" + ($scope.ability.AbilityTextureName || "") + ".png";
				}

				$(".ability-img").attr("src", _path);
			} else {
				$(".ability-img").attr("src", 'public/img/logo.jpg');
			}
		};

		$scope.getType = function (attr, src) {
			src = src || $scope.ability;
			if (typeof attr === "string") {
				return typeof src[attr];
			} else {
				return attr.type || typeof src[attr.attr];
			}
		};

		$scope.addEvent = function (unit) {
			(unit || $scope.ability)._eventList.push(new Event());
		};

		$scope.addModifier = function () {
			$scope.ability._modifierList.push(new Modifier());
		};

		$scope.setLanguage = function (language) {
			$scope.language = language;
		};

		// ================================================================
		// =                           文件操作                           =
		// ================================================================
		// 读取配置文件
		if (!globalContent[_globalConfigKey]) {
			NODE.loadFile(".dota2editor/ability.conf", "utf8").then(function (data) {
				$scope.config = JSON.parse(data);
			}, function() {
				$scope.config = {};
			});
		}

		// 读取技能文件
		if (!globalContent[_globalListKey]) {
			NODE.loadFile(_filePath, "utf8").then(function (data) {
				var _kv = new KV(data, true);
				$.each(_kv.kvList, function (i, unit) {
					if (typeof  unit.value !== "string") {
						var _ability = Ability.parse(unit, isItem, 1);
						_LOG("Ability", 0, "实体：", _ability._name, _ability);

						$scope.abilityList.push(_ability);
					}
				});

				globalContent[_globalListKey] = $scope.abilityList;
				$scope.ability = $scope.abilityList[0];

				console.log("Scope >>>", $scope);
			}, function () {
				$.dialog({
					title: "OPS!",
					content: "Can't find npc_abilities_custom.txt <br/> 【打开npc_abilities_custom.txt失败】",
				});
			});
		} else {
			$scope.abilityList = globalContent[_globalListKey];
			$scope.ability = $scope.abilityList[0];
		}

		// 多语言支持
		$scope.languageList = globalContent.languageList;
		globalContent.languageList._promise.then(function () {
			$scope.language = $scope.languageList[0];
		});

		// ================================================================
		// =                             配置                             =
		// ================================================================
		$scope.setAbilityMarkColor = function(color) {
			if(!$scope.config) return;

			var _abilities = $scope.config.abilities = $scope.config.abilities || {};
			var _ability = _abilities[_menuAbility._name] = _abilities[_menuAbility._name] || {};
			_ability.markColor = color;
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
					var _left = $(".abilityCntr").offset().left;
					$("#listCntr").width(_left - 20);
				}
				winWidth = _winWidth;
			}, 100);
		}).resize();

		// 禁止列表框滚屏
		$("#listCntr").on("mousewheel.abilityList", function(e) {
			var _my = $(this);

			var _delta = e.originalEvent.wheelDelta;
			var _top = _my.scrollTop();
			var _height = _my.outerHeight();
			var _scrollHeight = _my[0].scrollHeight;

			if((_delta > 0 && _top <= 0) || (_delta < 0 && _top + _height >= _scrollHeight)) {
				e.preventDefault();
			}
		});

		// 列表框右击
		$("#abilityMenu").hide();
		var _menuAbility;
		$(document).on("contextmenu.abilityList", "#listCntr .listItem", function (e) {
			$("#abilityMenu").show().offset({
				left: e.originalEvent.x,
				top: e.originalEvent.y
			});

			_menuAbility = angular.element(this).scope()._ability;

			e.preventDefault();
			return false;
		});

		$scope.$on("$destroy",function() {
			$(window).off("resize.abilityList");
			$("#listCntr").off("mousewheel.abilityList");
			$(document).off("contextmenu.abilityList");
		});
	};
};

hammerControllers.controller('abilityCtrl', _abilityCtrl(false));
hammerControllers.controller('itemCtrl', _abilityCtrl(true));