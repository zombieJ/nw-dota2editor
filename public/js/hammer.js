'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components','ui.bootstrap']);

hammerControllers.controller('indexCtrl', function ($scope) {
});

var _abilityCtrl = function(isItem) {
	return function ($scope, $http, $interval, $timeout, NODE, globalContent, KV, Ability, Event, Operation, Modifier) {
		if (!globalContent.isOpen) return;

		var _globalListKey = isItem ? "itemList" : "abilityList";
		var _globalConfigKey = isItem ? "abilityConfig" : "itemConfig";
		var _filePath = isItem ? Ability.itemFilePath : Ability.filePath;

		var _abilityChangeLock = true;

		$scope.abilityList = [];
		$scope.isItem = isItem;
		$scope.ready = false;
		$scope.conflictMap = {};

		$scope.currentTab = "common";
		$scope.currentModifier = null;

		// ================================================================
		// =                         Optimization                         =
		// ================================================================
		$scope.optEventNum = common.array.num(2);

		$scope.optLangAbilitySpecialNum = common.array.num(5);
		$scope.optLangModifierNum = common.array.num(2);

		//var _optListTimeout;
		$scope.optUpdateLimitation = function() {
			if(!$scope.ability) return;

			// ===================== Events =====================
			if($scope.ability._eventList.length > $scope.optEventNum.length) {
				$scope.optEventNum = common.array.num($scope.ability._eventList.length);
			}
			// Modifier List

			// ==================== Language ====================
			// Special List
			if($scope.ability._abilitySpecialList.length > $scope.optLangAbilitySpecialNum.length) {
				$scope.optLangAbilitySpecialNum = common.array.num($scope.ability._abilitySpecialList.length);
			}
			// Modifier List
			if($scope.ability._modifierList.length > $scope.optLangModifierNum.length) {
				$scope.optLangModifierNum = common.array.num($scope.ability._modifierList.length);
			}
		};

		// ================================================================
		// =                           Function                           =
		// ================================================================
		$scope.setAbility = function (ability) {
			_abilityChangeLock = true;
			$scope.ability = ability;
			$scope.currentModifier = ability._modifierList[0];

			abilityChangeWatch();

			setTimeout(function() {
				_abilityChangeLock = false;
			}, 500);
		};

		$scope.setModifier = function (modifier) {
			$scope.currentModifier = modifier;
		};
		$scope.removeModifier = function (modifier) {
			$.dialog({
				title: "Delete Confirm",
				content: "Do you want to delete modifier: '" + modifier._name + "'",
				confirm: true
			}, function(ret) {
				if(!ret) return;

				common.array.remove(modifier, $scope.ability._modifierList);
				if($scope.currentModifier === modifier) $scope.currentModifier = $scope.ability._modifierList[0];
				$scope.$apply();
			});
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
			var _modifier = new Modifier();
			_modifier._name = $scope.ability._name + "_modifier";
			$scope.ability._modifierList.push(_modifier);

			$scope.currentModifier = _modifier;
		};

		$scope.setLanguage = function (language) {
			$scope.language = language;
		};

		$scope.newAbility = function() {
			if(!$scope.abilityList) return;

			$("#newMDL").modal();
			$scope.newAbility._type = "DOTA_ABILITY_BEHAVIOR_UNIT_TARGET";
			$scope.newAbility._target = "DOTA_UNIT_TARGET_TEAM_ENEMY";
			$scope.newAbility._channelled = false;
			$scope.newAbility._autoID = true;
		};
		$scope.newAbility.confirm = function() {
			var _newAbility = new Ability(isItem);
			_newAbility._changed = true;
			$scope.abilityList.push(_newAbility);
			$scope.setAbility(_newAbility);

			// Type
			$scope.ability.AbilityBehavior[$scope.newAbility._type] = true;
			if($scope.newAbility._type !== "Passive") {
				// Target type
				$scope.ability.AbilityUnitTargetType.DOTA_UNIT_TARGET_HERO = true;
				$scope.ability.AbilityUnitTargetType.DOTA_UNIT_TARGET_BASIC = true;

				// Target team
				$scope.ability.AbilityUnitTargetTeam = $scope.newAbility._target;

				// Channel
				if($scope.newAbility._channelled) {
					$scope.ability.AbilityBehavior.DOTA_ABILITY_BEHAVIOR_CHANNELLED = true;
				}
			}

			if($scope.newAbility._autoID) $scope.assignAutoID($scope.ability);

			setTimeout(function() {
				$("#listCntr").scrollTop(9999999);
			}, 10);
			$("#newMDL").modal('hide');
		};
		$scope.newAbility.type = [
			["Target","对目标","DOTA_ABILITY_BEHAVIOR_UNIT_TARGET"],
			["No Target","无目标","DOTA_ABILITY_BEHAVIOR_NO_TARGET"],
			["Point","对地点","DOTA_ABILITY_BEHAVIOR_POINT"],
			["Passive","被动","DOTA_ABILITY_BEHAVIOR_PASSIVE"],
		];
		$scope.newAbility.target = [
			["Enemy","敌军","DOTA_UNIT_TARGET_TEAM_ENEMY"],
			["Friendly","友军","DOTA_UNIT_TARGET_TEAM_FRIENDLY"],
			["Both","全部","DOTA_UNIT_TARGET_TEAM_BOTH"],
		];

		$scope.assignAutoID = function(ability) {
			if(!ability._isItem) return;

			var _IDs = [];
			$.each($scope.abilityList, function(i, _ability) {
				_IDs[_ability.ID] = true;
			});

			for(var _id = 1000 ; _id < 5000 ; _id += 1) {
				if(_IDs[_id] !== true) {
					ability.ID = _id + "";
					break;
				}
			}
		};

		$scope.copyAbility = function() {
			if(!_menuAbility) return;

			var _writer = new KV.Writer();
			_menuAbility.doWriter(_writer);

			// 复制技能
			var _clone = Ability.parse({
				value: new KV(_writer._data)
			}, isItem);
			_clone._name += "_clone";
			_clone._changed = true;
			$scope.assignAutoID(_clone);

			// 复制配置
			var _abilities = $scope.config.abilities = $scope.config.abilities || {};
			var _ability = _abilities[_menuAbility._name] = _abilities[_menuAbility._name] || {};
			var _cloneAbility = _abilities[_clone._name] = _abilities[_clone._name] || {};
			$.extend(_cloneAbility, _ability, true);
			if(_cloneAbility.editorAliasName) {
				_cloneAbility.editorAliasName += " copy";
			}

			var _index = $.inArray(_menuAbility, $scope.abilityList);
			$scope.setAbility(_clone);
			$scope.abilityList.splice(_index + 1, 0, $scope.ability);
		};

		$scope.deleteAbility = function() {
			if(!_menuAbility) return;

			$.dialog({
				title: "Delete Confirm 【删除确认】",
				content: "Do you want to delete '"+_menuAbility._name+"'",
				confirm: true
			}, function(ret) {
				if(!ret) return;

				var _isCurrent = $scope.ability === _menuAbility
				common.array.remove(_menuAbility, $scope.abilityList);
				if(_isCurrent) {
					$scope.ability = $scope.abilityList[0];
				}
				$scope.$apply();
			});
		};

		// Ability changed listen
		// > ability._eventList.length
		$scope.$watch('ability._eventList.length', function(){
			$scope.optUpdateLimitation();
		});
		// > ability._abilitySpecialList.length
		$scope.$watch('ability._abilitySpecialList.length', function(){
			$scope.optUpdateLimitation();
		});
		// > ability._modifierList.length
		$scope.$watch('ability._modifierList.length', function(){
			$scope.optUpdateLimitation();
		});
		// > Change
		var _abilityChangeWatchListener;
		function abilityChangeWatch() {
			if(_abilityChangeWatchListener) return;

			_abilityChangeWatchListener = $scope.$watch('ability', function(newVal, oldVal){
				if(_abilityChangeLock || !newVal) return;

				newVal._changed = true;

				if(_abilityChangeWatchListener) {
					_abilityChangeWatchListener();
					_abilityChangeWatchListener = null;
				}
			}, true);
		}

		// Sync ability language
		$scope.$watch('ability._name', function(newVal, oldVal){
			if(_abilityChangeLock) return;

			console.log("Sync ability!");
			// Change configuration mapping
			var _configAbility = common.getValueByPath($scope, "config.abilities." + oldVal);
			if(_configAbility) {
				$scope.config.abilities[newVal] = _configAbility;
				delete $scope.config.abilities[oldVal];
			}


			$.each($scope.languageList, function(i, language) {
				// Common description
				$.each(Language.AbilityLang, function(i, langField) {
					var _preKey = Language.abilityAttr(oldVal, langField.attr);
					if(_preKey in language.map) {
						var _preDesc = language.map[_preKey];
						language.map[Language.abilityAttr(newVal, langField.attr)] = _preDesc;
						delete language.map[_preKey];
					}
				});

				// special description
				$.each($scope.ability._abilitySpecialList, function(i, langAbilitySpecialField) {
					var _preKey = Language.abilityAttr(oldVal, langAbilitySpecialField[0]);
					if(_preKey in language.map) {
						var _preDesc = language.map[_preKey];
						language.map[Language.abilityAttr(newVal, langAbilitySpecialField[0])] = _preDesc;
						delete language.map[_preKey];
					}
				});
			});
		});

		// Sync modifier language
		$scope.$watch('ability._modifierList', function(newVal, oldVal){
			if(_abilityChangeLock) return;

			console.log("Sync modifier!");
			$.each(newVal, function(i, _modifier) {
				var _preModifier = common.array.find(_modifier._innerID, oldVal, "_innerID");
				if(_preModifier) {
					$.each($scope.languageList, function(i, language) {
						// Common description
						$.each(Language.ModifierLang, function(i, langField) {
							var _preKey = Language.modifierAttr(_preModifier._name, langField.attr)
							if(_preKey in language.map) {
								var _preDesc = language.map[_preKey];
								language.map[Language.modifierAttr(_modifier._name, langField.attr)] = _preDesc;
								delete language.map[_preKey];
							}
						});
					});
				}
			});
		}, true);

		// ================================================================
		// =                          Auto Detect                         =
		// ================================================================
		// Naming conflict check
		// TODO: Use name change event
		var _conflictCheckInterval = $interval(function() {
			var _checkMap = {};
			$scope.conflictMap = {};
			$.each($scope.abilityList, function(i, _ability) {
				if(_checkMap[_ability._name]) {
					$scope.conflictMap[_ability._name] = true;
				}
				_checkMap[_ability._name] = true;
			});
		}, 2000);

		// Check language description
		$scope.checkReport = {};
		$scope.abilitiesCheck = function() {
			var _reportList = [];
			$scope.checkReport = {
				language: _reportList
			};

			$.each($scope.abilityList, function(i, ability) {
				if(common.getValueByPath($scope, "config.abilities." + ability._name + ".markUsage") === "dummy") return;

				// Loop language
				$.each($scope.languageList, function(i, language) {
					// =============== Ability ===============
					if(!ability.AbilityBehavior.DOTA_ABILITY_BEHAVIOR_HIDDEN) {
						$.each(Language.AbilityLang, function (i, langField) {
							if (!langField.frequent) return;

							if (!language.map[Language.abilityAttr(ability._name, langField.attr)]) {
								_reportList.push({
									ability: ability,
									language: language,
									field: langField,
								});
							}
						});
					}

					// =============== Modifier ===============
					$.each(ability._modifierList, function(i, modifier) {
						if(modifier.IsHidden === "1") return;

						$.each(Language.ModifierLang, function(j, langField) {
							if (!langField.frequent) return;

							if (!language.map[Language.modifierAttr(modifier._name, langField.attr)]) {
								_reportList.push({
									ability: ability,
									modifier: modifier,
									language: language,
									field: langField,
								});
							}
						});
					});
				});
			});

			$("#checkReportMDL").modal();
		};

		// ================================================================
		// =                        File Operation                        =
		// ================================================================
		// 读取配置文件
		if (!globalContent[_globalConfigKey]) {
			NODE.loadFile(isItem ? Ability.itemConfig : Ability.abilityConfig, "utf8").then(function (data) {
				$scope.config = JSON.parse(data);
			}, function() {
				$scope.config = {};
			}).finally(function() {
				globalContent[_globalConfigKey] = $scope.config;
			});
		} else {
			$scope.config = globalContent[_globalConfigKey];
		}

		// 读取技能文件
		if (!globalContent[_globalListKey]) {
			NODE.loadFile(_filePath, "utf8").then(function (data) {
				var _kv = KV.parse(data);
				$.each(_kv.value, function (i, unit) {
					if (typeof  unit.value !== "string") {
						var _ability = Ability.parse(unit, isItem, 1);
						_LOG("Ability", 0, "实体：", _ability._name, _ability);

						$scope.abilityList.push(_ability);
					}
				});

				globalContent[_globalListKey] = $scope.abilityList;
				$scope.setAbility($scope.abilityList[0]);

				setTimeout(function() {
					$(window).resize();
				}, 100);

				console.log("Scope >>>", $scope);
			}, function () {
				$.dialog({
					title: "OPS!",
					content: "Can't find npc_abilities_custom.txt <br/> 【打开npc_abilities_custom.txt失败】",
				});
			}).finally(function() {
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
		// =                        Configuration                         =
		// ================================================================
		$scope.setAbilityMarkUsage = function(usage) {
			if(!$scope.config) return;

			var _abilities = $scope.config.abilities = $scope.config.abilities || {};
			var _ability = _abilities[_menuAbility._name] = _abilities[_menuAbility._name] || {};
			if(usage) {
				_ability.markUsage = usage;
			} else {
				delete _ability.markUsage;
			}
		};

		$scope.setAbilityMarkColor = function(color) {
			if(!$scope.config) return;

			var _abilities = $scope.config.abilities = $scope.config.abilities || {};
			var _ability = _abilities[_menuAbility._name] = _abilities[_menuAbility._name] || {};
			if(color) {
				_ability.markColor = color;
			} else {
				delete _ability.markColor;
			}
		};

		$scope.setAbilityEditorAlias = function() {
			if(!$scope.config) return;

			var _abilities = $scope.config.abilities = $scope.config.abilities || {};
			var _ability = _abilities[_menuAbility._name] = _abilities[_menuAbility._name] || {};

			var $input = $("<input type='text' class='form-control' />");
			$input.val(_ability.editorAliasName || "");
			$.dialog({
				title: "Alias Name in Editor 【编辑器中的别名】",
				content: $input,
				confirm: true
			}, function(ret) {
				if(!ret) return;

				var _alias = $input.val();
				if(_alias) {
					_ability.editorAliasName = _alias;
				} else {
					delete _ability.editorAliasName;
				}
				$scope.$apply();
			});
			setTimeout(function() {
				$input.focus();
			}, 500);
		};

		// ================================================================
		// =                              UI                              =
		// ================================================================
		// Select ability
		$scope.setAbilityMouseDown = function(ability) {
			$scope.setAbility(ability);
		};

		// 列表框布局
		var winWidth;
		$(window).on("resize.abilityList", function() {
			setTimeout(function() {
				var _winWidth = $(window).width();
				var $abilityCntr = $(".abilityCntr");

				if(_winWidth !== winWidth && $abilityCntr.length) {
					var _left = $abilityCntr.offset().left;
					$("#listCntr").outerWidth(_left - 15);
					$("#newItem").outerWidth(_left - 15);
					winWidth = _winWidth;
				}
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
			var $menu = $("#abilityMenu").show();
			common.ui.offsetWin($menu, {
				left: e.originalEvent.x,
				top: e.originalEvent.y
			});

			_menuAbility = angular.element(this).scope()._ability;
			refreshMenu("#abilityMenu");

			e.preventDefault();
			return false;
		});

		$scope.$on("$destroy",function() {
			$interval.cancel(_conflictCheckInterval);
			//$("#langColorPicker").off('hidePicker.colorpicker').colorpicker('destroy');
			//$('[data-id="description"]').off("focus.colorPicker");
			$(window).off("resize.abilityList");
			$("#listCntr").off("mousewheel.abilityList");
			$(document).off("contextmenu.abilityList");
		});
	};
};

hammerControllers.controller('abilityCtrl', _abilityCtrl(false));
hammerControllers.controller('itemCtrl', _abilityCtrl(true));