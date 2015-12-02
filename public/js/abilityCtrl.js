'use strict';

var _abilityCtrl = function(isItem) {
	return function ($scope, $timeout, globalContent, NODE, Ability, Modifier, UI, KV, Locale, Config, Language) {
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

		$scope._newUnassignedKey = "";
		$scope._newUnassignedValue = "";

		$scope.config = Config.fetch(isItem ? "item" : "ability");

		var _globalListKey = isItem ? "itemList" : "abilityList";
		var _filePath = isItem ? Ability.itemFilePath : Ability.filePath;


		$scope.currentTab = "common";
		$scope.setCurrentTab = function (current) {
			$scope.currentTab = current;
		};

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
			console.log(entity);
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
			var _modifier = new KV(_tgtName);
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
				new KV(),
			]));
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
				return;
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
								lang.map[_tgtKey] = lang.map[_oriKey];
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

				$("#newAbilityMDL").modal('hide');
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
					if(lang.map[_oldKey] !== undefined) lang.map[_newKey] = lang.map[_oldKey];
					delete lang.map[_oldKey];
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
					if(lang.map[_oldKey] !== undefined) lang.map[_newKey] = lang.map[_oldKey];
					if(!_conflict) delete lang.map[_oldKey];
				});
			});
		};

		/*// ==========> Wearable
		$scope.newWearable = function () {
			var _wearable = new KV("wearable", [new KV("ItemDef")]);
			$scope.ability.kv.assumeKey('Creature.AttachWearables', true).value.push(_wearable);
		};*/

		// ==========> Unassigned
		$scope.newUnassigned = function () {
			UI.modal("#newUnassignedMDL");
		};
		$scope.confirmNewUnassigned = function() {
			if(!$scope._newUnassignedKey.match(/^[\w\d_]+$/)) {
				$.dialog({
					title: Locale('Error'),
					content: Locale('illegalCharacter'),
				});
			} else if($scope.ability.kv.getKV($scope._newUnassignedKey, false)) {
				$.dialog({
					title: Locale('Error'),
					content: Locale('duplicateDefined'),
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
		});
	};
};

hammerControllers.controller('abilityCtrl', _abilityCtrl(false));
hammerControllers.controller('itemCtrl', _abilityCtrl(true));