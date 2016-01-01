'use strict';

var _abilityCtrl = function(isItem) {
	return function ($scope, $timeout, globalContent, NODE, Ability, Modifier, UI, KV, Locale, Config, Language, AppFileSrv) {
		if (!globalContent.isOpen) return;

		window.scope = $scope;

		$scope.isItem = isItem;
		$scope.ready = false;
		$scope.abilityList = [];
		$scope.ability = null;
		$scope.currentModifier = null;

		$scope._newAbilityFork = null;
		$scope._newAbilityForkLang = true;
		$scope._newAbilityName = "";

		$scope._newTmplAbility = {};

		$scope._newUnassignedKey = "";
		$scope._newUnassignedValue = "";

		$scope.config = Config.fetch(isItem ? "item" : "ability");

		var _globalListKey = isItem ? "itemList" : "abilityList";
		var _filePath = isItem ? Ability.itemFilePath : Ability.filePath;


		$scope.currentTab = "common";
		$scope.setCurrentTab = function (current) {
			$scope.currentTab = current;
		};

		AppFileSrv.watchFolder();

		// ================================================================
		// =                           Function                           =
		// ================================================================
		$scope.setAbility = function (ability) {
			$scope.ability = ability;
			$scope.currentModifier = $scope.ability.getModifierList()[0];
		};

		$scope.setModifier = function(modifier) {
			$scope.currentModifier = modifier;
		};

		$scope.addEvent = function(entity) {
			var _kv = new KV("", []);
			_kv._isEvent = true;
			entity.value.push(_kv);
		};

		$scope.addModifier = function() {
			var _modifierList = $scope.ability.kv.assumeKey("Modifiers", true);
			var _oriName = "modifier_" + $scope.ability._name;
			var _tgtName = _oriName;
			var _index = 2;
			while(common.array.find(_tgtName, _modifierList.value, "key")) {
				_tgtName = _oriName + "_" + _index;
				_index += 1;
			}
			var _modifier = new KV(_tgtName, []);
			_modifierList.value.push(_modifier);

			$scope.currentModifier = _modifier;
		};

		$scope.delModifierCallback = function(modifier) {
			if($scope.currentModifier === modifier) {
				$timeout(function() {$scope.currentModifier = $scope.ability.getModifierList()[0];});
			}
		};

		$scope.addAbilitySpecial = function() {
			$scope.ability.kv.assumeKey("AbilitySpecial", true).value.push(new KV("00", [
				new KV("var_type", "FIELD_INTEGER"),
				new KV()
			]));
		};

		// ==========> Ability Icon
		var _iconStep = 0;
		$scope.$watch('ability.get("AbilityTextureName")', function() {
			if(!$scope.ability) return "";

			_iconStep = 0;
			var _path = "";
			if(isItem) {
				_path = globalContent.project + "/resource/flash3/images/items/" + ($scope.ability.get("AbilityTextureName") || "").replace(/^item_/, "") + ".png";
			} else {
				_path = globalContent.project + "/resource/flash3/images/spellicons/" + ($scope.ability.get("AbilityTextureName") || "") + ".png";
			}
			$(".ability-img").attr("src", _path);
		});
		window.iconError = function() {
			if(_iconStep === 0) {
				_iconStep = 1;

				var _path = "";
				if(isItem) {
					_path = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/flash3/images/items/" + ($scope.ability.get("AbilityTextureName") || "").replace(/^item_/, "") + ".png";
				} else {
					_path = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/flash3/images/spellicons/" + ($scope.ability.get("AbilityTextureName") || "") + ".png";
				}

				$(".ability-img").attr("src", _path);
			} else {
				$(".ability-img").attr("src", 'public/img/logo.jpg');
			}
		};

		// ==========> New
		$scope.newEntity = function(source) {
			$scope._newAbilityFork = source;
			$scope._newAbilityForkLang = true;
			$scope._newAbilityName = $scope._newAbilityFork ? $scope._newAbilityFork._name + "_clone" : "Undefined";

			UI.modal("#newAbilityMDL");
		};

		$scope.confirmNewEntity = function() {
			var _checkResult = $scope.renameCheck($scope._newAbilityName);

			if(typeof _checkResult === "string") {
				$.dialog({
					title: "OPS",
					content: _checkResult
				}, function() {
					UI.modal.highlight("#newAbilityMDL");
				});
			} else {
				var _clone = new Ability($scope._newAbilityFork ? $scope._newAbilityFork.kv.clone() : null);
				_clone._name = $scope._newAbilityName;
				_clone._changed = true;

				if($scope._newAbilityFork) {
					// Clone Language
					if($scope._newAbilityForkLang) {
						$.each(globalContent.languageList, function(i, lang) {
							$.each(Language.AbilityLang, function(i, langField) {
								var _oriKey = Language.abilityAttr($scope._newAbilityFork._name, langField.attr);
								var _tgtKey = Language.abilityAttr(_clone._name, langField.attr);
								lang.kv.set(_tgtKey, lang.kv.get(_oriKey));
							});
						});
					}

					// Clone Configuration
					var _oriConfig = $scope.config.get("abilities", $scope._newAbilityFork._name) || {};
					var _tgtConfig = $scope.config.get("abilities", _clone._name) || {};
					$.extend(_tgtConfig, _oriConfig, true);
					$scope.config.data("abilities." + _clone._name, _tgtConfig);

					var _index = $.inArray($scope._newAbilityFork, $scope.abilityList);
					$scope.abilityList.splice(_index + 1, 0, _clone);
				} else {
					$scope.abilityList.push(_clone);
				}
				$scope.setAbility(_clone);
				$scope.assignAutoID(_clone);

				$("#newAbilityMDL").modal('hide');
			}
		};

		// ==========> New Template
		$scope.newTmplAbility = function() {
			if(!$scope.abilityList) return;

			UI.modal.highlight($("#newTmplMDL").modal());
			$scope._newTmplAbility._type = "DOTA_ABILITY_BEHAVIOR_UNIT_TARGET";
			$scope._newTmplAbility._target = "DOTA_UNIT_TARGET_TEAM_ENEMY";
			$scope._newTmplAbility._channelled = false;
			$scope._newTmplAbility._autoID = true;

			var _oriName = "newAbility";
			var _tgtName = _oriName;
			var _index = 2;
			while(common.array.find(_tgtName, $scope.abilityList, "_name")) {
				_tgtName = _oriName + "_" + _index;
				_index += 1;
			}
			$scope._newTmplAbility._name = _tgtName;
		};
		$scope.newTmplAbility.confirm = function() {
			var _newAbility = new Ability();
			_newAbility._changed = true;
			$scope.abilityList.push(_newAbility);
			$scope.setAbility(_newAbility);

			// Type
			$scope.ability._name = $scope._newTmplAbility._name;
			$scope.ability.kv.set("AbilityBehavior", $scope._newTmplAbility._type);
			if($scope._newTmplAbility._type !== "DOTA_ABILITY_BEHAVIOR_PASSIVE") {
				// Target type
				$scope.ability.kv.set("AbilityUnitTargetType", "DOTA_UNIT_TARGET_HERO | DOTA_UNIT_TARGET_BASIC");

				// Target team
				$scope.ability.kv.set("AbilityUnitTargetTeam", $scope._newTmplAbility._target);

				// Channel
				if($scope._newTmplAbility._channelled) {
					$scope.ability.kv.set("AbilityBehavior", $scope.ability.kv.get("AbilityBehavior") + " | DOTA_ABILITY_BEHAVIOR_CHANNELLED");
				}
			}

			// Item
			_newAbility.kv.set("BaseClass", "item_datadriven");
			if($scope._newTmplAbility._autoID) {
				$scope.assignAutoID($scope.ability);
			}

			setTimeout(function() {
				$("#listCntr").scrollTop(9999999);
			}, 10);
			$("#newTmplMDL").modal('hide');
		};
		$scope._newTmplAbility.type = [
			"DOTA_ABILITY_BEHAVIOR_UNIT_TARGET",
			"DOTA_ABILITY_BEHAVIOR_NO_TARGET",
			"DOTA_ABILITY_BEHAVIOR_POINT",
			"DOTA_ABILITY_BEHAVIOR_PASSIVE"
		];
		$scope._newTmplAbility.target = [
			"DOTA_UNIT_TARGET_TEAM_ENEMY",
			"DOTA_UNIT_TARGET_TEAM_FRIENDLY",
			"DOTA_UNIT_TARGET_TEAM_BOTH"
		];

		$scope.assignAutoID = function(ability) {
			if(!isItem) return;

			var _IDs = {};
			$.each($scope.abilityList, function(i, _ability) {
				_IDs[_ability.get("ID")] = true;
			});

			for(var _id = 1500 ; _id < 5000 ; _id += 1) {
				if(_IDs[_id] !== true) {
					ability.kv.set("ID", _id + "");
					break;
				}
			}
		};

		// ==========> Rename
		$scope.renameCheck = function(newName) {
			for(var i = 0 ; i < $scope.abilityList.length ; i += 1) {
				if($scope.abilityList[i]._name === newName) {
					return Locale('conflictName');
				}
			}
			return true;
		};

		$scope.renameCallback = function(newName, oldName, entity) {
			$.each(globalContent.languageList, function(i, lang) {
				$.each(Language.AbilityLang, function(i, langField) {
					var _oldKey = Language.abilityAttr(oldName, langField.attr);
					var _newKey = Language.abilityAttr(newName, langField.attr);
					if(!lang.kv.get(_oldKey)) lang.kv.set(_newKey, lang.kv.get(_oldKey));
					lang.kv.delete(_oldKey);
				});
			});
		};

		// ==========> Rename
		$scope.renameModifierCheck = function(newName) {
			var _matched = false;
			$.each($scope.abilityList, function(i, _ability) {
				if(common.array.find(newName, _ability.getModifierList(), "key")) {
					_matched = true;
					return false;
				}
			});
			if(_matched) return {msg: Locale('conflictNameConfirm'), type: "confirm"};
			return true;
		};

		$scope.renameModifierCallback = function(newName, oldName, entity) {
			var _conflict = !!$scope.renameModifierCheck(newName).type;

			$.each(globalContent.languageList, function(i, lang) {
				$.each(Language.ModifierLang, function(i, langField) {
					var _oldKey = Language.modifierAttr(oldName, langField.attr);
					var _newKey = Language.modifierAttr(newName, langField.attr);
					if(!lang.kv.get(_oldKey)) lang.kv.set(_newKey, lang.kv.get(_oldKey));
					if(!_conflict) lang.kv.delete(_oldKey);
				});
			});
		};

		// ==========> Unassigned
		$scope.newUnassigned = function () {
			UI.modal("#newUnassignedMDL");
		};
		$scope.confirmNewUnassigned = function() {
			if(!$scope._newUnassignedKey.match(/^[\w\d_]+$/)) {
				$.dialog({
					title: Locale('Error'),
					content: Locale('illegalCharacter')
				});
			} else if($scope.ability.kv.getKV($scope._newUnassignedKey, false)) {
				$.dialog({
					title: Locale('Error'),
					content: Locale('duplicateDefined')
				});
			} else {
				$scope.ability.kv.value.push(new KV($scope._newUnassignedKey, $scope._newUnassignedValue));
				$scope.ability.refreshUnassignedList();
				$scope._newUnassignedKey = "";
				$scope._newUnassignedValue = "";
				$("#newUnassignedMDL").modal('hide');
			}
		};
		$scope.refreshUnassigned = function () {
			$scope.ability.refreshUnassignedList();
		};

		// ================================================================
		// =                        File Operation                        =
		// ================================================================
		// Read Ability file
		if (!globalContent[_globalListKey]) {
			NODE.loadFile(_filePath, "utf8").then(function (data) {
				var _kv = KV.parse(data);
				$.each(_kv.value, function (i, unit) {
					if (typeof  unit.value !== "string") {
						var _unit = Ability.parse(unit);
						_LOG("Ability", 0, "实体：", _unit._name, _unit);

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
					content: "Can't find "+_filePath+" <br/> 【打开"+_filePath+"失败】"
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
		// =                     List Item Operation                      =
		// ================================================================
		$scope.setAbilityMarkUsage = function(usage) {
			var _ability = $scope.config.assumeObject("abilities", _menuAbility._name);
			if(usage) {
				_ability.markUsage = usage;
			} else {
				delete _ability.markUsage;
			}
		};

		$scope.setAbilityMarkColor = function(color) {
			var _ability = $scope.config.assumeObject("abilities", _menuAbility._name);
			if(color) {
				_ability.markColor = color;
			} else {
				delete _ability.markColor;
			}
		};

		$scope.setAbilityEditorAlias = function() {
			var _ability = $scope.config.assumeObject("abilities", _menuAbility._name);

			UI.modal.input(Locale('EditorAlias'), "", _ability.editorAliasName, function(_alias) {
				if(_alias) {
					_ability.editorAliasName = _alias;
				} else {
					delete _ability.editorAliasName;
				}
			});
		};

		$scope.copyAbility = function() {
			if(!_menuAbility) return;

			$scope.newEntity(_menuAbility);
		};

		$scope.deleteAbility = function() {
			if(!_menuAbility) return;

			$.dialog({
				title: "Delete Confirm",
				content: "Do you want to delete '"+_menuAbility._name+"'",
				confirm: true
			}, function(ret) {
				if(!ret) return;

				var _isCurrent = $scope.ability === _menuAbility;
				common.array.remove(_menuAbility, $scope.abilityList);
				if(_isCurrent) {
					$scope.setAbility($scope.abilityList[0]);
				}
				$scope.$apply();
			});
		};

		// ================================================================
		// =                            Search                            =
		// ================================================================
		$scope.searchBox = false;

		$scope.searchPress = function($event) {
			if($event.which === 27) {
				$scope.searchBox = false;
			}
		};

		$scope.searchMatch = function(match) {
			match = (match || "").toUpperCase();
			var _mainLangKV = globalContent.mainLang().kv;

			var _list = $.map($scope.abilityList, function(_ability) {
				if(
					common.text.contains(_ability._name, match) ||															// Name
					common.text.contains(_ability.kv.comment, match) ||														// Comment
					common.text.contains($scope.config.get('abilities', _ability._name, 'editorAliasName'), match) ||		// Alias
					common.text.contains(_mainLangKV.get(Language.abilityAttr(_ability._name, '')), match) ||				// Main language name
					common.text.contains(_mainLangKV.get(Language.abilityAttr(_ability._name, 'Description')), match)		// Main language description
				) {
					return {
						_key: $scope.config.get('abilities', _ability._name, 'editorAliasName') || globalContent.mainLang().kv.get(Language.abilityAttr(_ability._name, '')) || null,
						value: _ability._name,
						ability: _ability
					};
				}
			});
			return _list;
		};

		$("#search").on("selected.search", function(e, item) {
			var _ability = item.ability;
			if(_ability) {
				$scope.ability = _ability;
				$scope.searchBox = false;
			}
		});

		// ================================================================
		// =                              UI                              =
		// ================================================================
		// Select ability
		$scope.setAbilityMouseDown = function (ability) {
			$scope.setAbility(ability);
		};

		// List Container layout
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

		// Prevent list container scroll
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

		// Right click on list item
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

		// ================================================================
		// =                          Global Key                          =
		// ================================================================
		globalContent.hotKey($scope, {
			N: function() {
				$scope.newTmplAbility();
			},
			_N: "Create new template ability",
			F: function() {
				$scope.searchKey = "";
				$scope.searchBox = true;
				setTimeout(function () {
					$("#search").focus();
				}, 100);
			},
			_F: "Search ability"
		});

		// =================================================================
		// =                          Application                          =
		// =================================================================
		$scope.$on("AppSaved",function() {
			$scope.setAbility($scope.ability);
		});

		$scope.$on("$destroy",function() {
			$(window).off("resize.abilityList");
			$("#listCntr").off("mousewheel.abilityList");
			$(document).off("contextmenu.abilityList");
			$("#search").off("selected.search");
			AppFileSrv.stopWatch();
		});
	};
};

hammerControllers.controller('abilityCtrl', _abilityCtrl(false));
hammerControllers.controller('itemCtrl', _abilityCtrl(true));