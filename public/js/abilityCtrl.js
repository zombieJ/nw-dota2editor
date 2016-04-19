'use strict';

var _abilityCtrl = function(isItem) {
	return function ($q, $scope, $timeout, globalContent, NODE, Ability, Modifier, UI, KV, Locale, Config, Language,
					 AppVersionSrv, AppFileSrv, AppSpellLibSrv) {
		if (!globalContent.isOpen) return;

		window.scope = $scope;

		$scope.isItem = isItem;
		$scope.ready = false;
		$scope.abilityList = [];
		$scope.ability = null;
		$scope.currentModifier = null;

		$scope._newAbilityFork = null;
		$scope._newAbilityForkModiers = null;
		$scope._newAbilityForkLang = true;
		$scope._newAbilityName = "";

		$scope._newTmplAbility = {};

		var gui;
		var clipboard;
		try {
			gui = require('nw.gui');
			clipboard = gui.Clipboard.get();
		} catch (error) {}
		var _canCopyModifierID = null;
		var _canCopyModifierPrevStatus = false;
		$scope._canCopyModifier = false;

		$scope._newUnassignedKey = "";
		$scope._newUnassignedValue = "";

		var _abilityListDeferred = $q.defer();

		$scope.config = Config.fetch(isItem ? "item" : "ability", configInitFunc);
		$scope.config.exportFunction = configExportFunc;

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
			$scope.currentModifier = $scope.ability ? $scope.ability.getModifierList()[0] : null;

			if($scope.ability) {
				if(isItem) {
					window._currentItem = $scope.ability._name;
				} else {
					window._currentAbility = $scope.ability._name;
				}
			}
		};

		$scope.setModifier = function(modifier) {
			$scope.currentModifier = modifier;
		};

		$scope.isCurrentAbility = function(ability) {
			return ability === $scope.ability;
		};

		$scope.addEvent = function(entity) {
			var _kv = new KV("", []);
			_kv._isEvent = true;
			entity.value.push(_kv);

			UI.highlight("[data-id='event']:visible tbody:last");
		};

		$scope.switchEvent = function(event, eventList, oriKVList, offset) {
			var _oriIndex = $.inArray(event, eventList);
			var _tgtIndex = _oriIndex + offset;
			if(Math.min(_oriIndex, _tgtIndex) < 0) return;
			if(Math.max(_oriIndex, _tgtIndex) >= eventList.length) return;

			var _oriEvent = event;
			var _tgtEvent = eventList[_tgtIndex];

			var _oriKVIndex = $.inArray(_oriEvent, oriKVList);
			var _tgtKVIndex = $.inArray(_tgtEvent, oriKVList);

			oriKVList[_tgtKVIndex] = _oriEvent;
			oriKVList[_oriKVIndex] = _tgtEvent;
		};

		function getNoConflictModifierName() {
			var _modifierList = $scope.ability.kv.assumeKey("Modifiers", true);
			var _oriName = "modifier_" + $scope.ability._name;
			var _tgtName = _oriName;
			var _index = 2;
			while(common.array.find(_tgtName, _modifierList.value, "key")) {
				_tgtName = _oriName + "_" + _index;
				_index += 1;
			}

			return _tgtName;
		}

		$scope.addModifier = function() {
			var _modifierList = $scope.ability.kv.assumeKey("Modifiers", true);
			var _modifier = new KV(getNoConflictModifierName(), []);
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

		// Copy / paste modifier
		function _canCopyModifierCheck() {
			var _content = clipboard.get() + "";
			$scope._canCopyModifier = /^__MODIFIER__/.test(_content);

			if(_canCopyModifierPrevStatus !== $scope._canCopyModifier) {
				_canCopyModifierPrevStatus = $scope._canCopyModifier;
				$scope.$apply();
			}
		}

		_canCopyModifierID = setInterval(_canCopyModifierCheck, 1000);

		$scope.copyModifier = function(modifier) {
			clipboard.set("__MODIFIER__" + modifier.toString(), 'text');
			$.notify({
				title: "<b>Copy Success</b>",
				content: "Click 【<span class='fa fa-clipboard'></span>】 to paste.",
				type: "success",
				timeout: 5000,
				region: "system"
			});
			$(".ability-modifer-list .menu").addClass('hide');
			setTimeout(function() {
				$(".ability-modifer-list .menu").removeClass('hide');
			}, 1);
			_canCopyModifierCheck();
		};

		$scope.pasteModifier = function() {
			_canCopyModifierCheck();
			if(!$scope._canCopyModifier) return;
			var _modifier = KV.parse(clipboard.get().replace('__MODIFIER__', ''));

			UI.modal.input(Locale('New'), Locale('Modifiers'), getNoConflictModifierName(), function(key) {
				_modifier.key = key;
				var _modifierList = $scope.ability.kv.assumeKey("Modifiers", true);
				_modifierList.value.push(_modifier);
				$scope.currentModifier = _modifier;
			});
		};

		// ==========> Ability Special
		$scope._abilitySpecialMatch = function(match) {
			match = (match || "").toUpperCase();
			if(!match.match(/^%/) || !$scope.ability) return [];

			match = match.slice(1);
			var _list =  $.map($scope.ability.getSpecialList(), function(kv) {
				if((kv.value[1].key || "").toUpperCase().indexOf(match) !== -1) {
					return {value: "%" + kv.value[1].key};
				}
			});
			return _list;
		};

		// ==========> Ability Icon
		$scope.iconSrcList = [];
		var _iconCache = {};
		var _iconEmpty = [isItem ? 'public/img/none_item.png' : 'public/img/logo.jpg'];

		$scope.getIconList = function(ability) {
			var textureName = ability && ability.get("AbilityTextureName");
			if(!textureName) return _iconEmpty;

			if(!_iconCache[textureName]) {
				if (isItem) {
					_iconCache[textureName] = [
						globalContent.project + "/resource/flash3/images/items/" + textureName.replace(/^item_/, "") + ".png",
						"https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/flash3/images/items/" + textureName.replace(/^item_/, "") + ".png",
						'public/img/none_item.png'
					];
				} else {
					_iconCache[textureName] = [
						globalContent.project + "/resource/flash3/images/spellicons/" + textureName + ".png",
						"https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/flash3/images/spellicons/" + textureName + ".png",
						'public/img/logo.jpg'
					];
				}
			}
			return _iconCache[textureName];
		};

		$scope.$watch('ability.get("AbilityTextureName")', function(newValue, oldValue) {
			$scope.iconSrcList = $scope.getIconList($scope.ability);
		});

		// ==========> Ability Texture
		$scope.texturePickerFilter = "";
		$scope.texturePickerList = null;
		$scope.texturePath = isItem ? "items" : "spellicons";
		$scope.texturePickerInit = function() {
			$timeout(function() {
				$scope.texturePickerList = AppFileSrv.listFiles(AppVersionSrv.resPath + "res/" + $scope.texturePath, /\.(png|jpg|gif|bmp)$/i).list;
				$scope.texturePickerCustomizeList = AppFileSrv.listFiles(Config.projectPath + "/resource/flash3/images/" + $scope.texturePath, /\.(png|jpg|gif|bmp)$/i).list;
			});
		};
		$scope.texturePickerPreview = function($event, path) {
			$scope.texturePickerPreviewPath = path;
			if($event.pageX < 200 && $event.pageY < 200) {
				$(".ability-textureCntr-preview").addClass("right");
			} else {
				$(".ability-textureCntr-preview").removeClass("right");
			}
		};
		$scope.selectTexture = function(texture) {
			$scope.ability.kv.set("AbilityTextureName", (isItem ? "item_" : "") + texture.replace(/\.\w+$/, ""));
			$("#texturePickerMDL").modal("hide");
		};
		$scope.texturePickerMatch = function(imgName) {
			if(!$scope.texturePickerFilter) return true;

			return imgName.toUpperCase().indexOf($scope.texturePickerFilter.toUpperCase()) !== -1;
		};

		// ==========> New
		$scope.newEntity = function(source) {
			$scope._newAbilityFork = source;
			$scope._newAbilityForkModiers = {};
			$scope._newAbilityForkLang = true;
			$scope._newAbilityName = $scope._newAbilityFork ? $scope._newAbilityFork._name + "_clone" : "Undefined";

			if(source) $.each(source.getModifierList(), function(i, modifier) {
				$scope._newAbilityForkModiers[modifier.key] = modifier.key;
			});

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
					// Rename modifier
					var _tgtModifiers = _clone.kv.getKV("Modifiers");
					$.each($scope._newAbilityForkModiers, function(oriName, tgtName) {
						_tgtModifiers.getKV(oriName).key = tgtName || oriName;
					});

					// Clone Language
					if($scope._newAbilityForkLang) {
						$.each(globalContent.languageList, function(i, lang) {
							// Ability Lang field
							$.each(Language.AbilityLang, function(i, langField) {
								var _oriKey = Language.abilityAttr($scope._newAbilityFork._name, langField.attr);
								var _tgtKey = Language.abilityAttr(_clone._name, langField.attr);
								lang.kv.set(_tgtKey, lang.kv.get(_oriKey));
							});

							// Ability Special
							$.each($scope._newAbilityFork.getSpecialList(), function(i, abilitySpecial) {
								var _oriKey = Language.abilityAttr($scope._newAbilityFork._name, abilitySpecial.value[1].key);
								var _tgtKey = Language.abilityAttr(_clone._name, abilitySpecial.value[1].key);
								lang.kv.set(_tgtKey, lang.kv.get(_oriKey));
							});

							// Modifier list
							$.each($scope._newAbilityForkModiers, function(oriName, tgtName) {
								// Modifier Lang field
								$.each(Language.ModifierLang, function (i, langField) {
									var _oriKey = Language.modifierAttr(oriName, langField.attr);
									var _tgtKey = Language.modifierAttr(tgtName || oriName, langField.attr);
									lang.kv.set(_tgtKey, lang.kv.get(_oriKey));
								});
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

				$scope.treeView.list.push(
					_registerAbilityTreeItem({_id: +new Date()}, _clone)
				);

				setTimeout(function() {
					$("#listCntr").scrollTop(9999999);
				}, 100);
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
			var type = $("#newTmplNav li.active").attr("data-type");
			if(type === "spellLib") {
				$scope.newTmplAbility_SpellLibConfirm();
			} else {
				$scope.newTmplAbility_TemplateConfirm();
			}
		};

		$scope.newTmplAbility_TemplateConfirm = function() {
			var _newAbility = new Ability();
			_newAbility._changed = true;
			$scope.abilityList.push(_newAbility);
			$scope.setAbility(_newAbility);

			$scope.treeView.list.push(
				_registerAbilityTreeItem({_id: +new Date()}, _newAbility)
			);

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
			if($scope.isItem) {
				_newAbility.kv.set("BaseClass", "item_datadriven");
				if ($scope._newTmplAbility._autoID) {
					$scope.assignAutoID($scope.ability);
				}
			}

			setTimeout(function() {
				$("#listCntr").scrollTop(9999999);
			}, 100);
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

		// ==========> New Spell Library
		$scope.spellLibItem = [];
		$scope.spellLibCache = {};
		$scope.spellLibList = [];
		setTimeout(function () {
			$scope.spellLibList = AppSpellLibSrv.getAbilityList();
			$scope.$apply();
		}, 1000);

		$scope.spellLibPreview = function (_spell) {
			if(!_spell) return;

			$.dialog({
				title: _spell,
				content: $("<textarea class='form-control' readonly rows='25'>").text($scope.spellLibCache[_spell].data),
				size: "large"
			});
		};

		$scope.updateSpellLib = function () {
			var _spell = $scope.spellLibItem[0];
			if(!_spell) return;

			var cache = $scope.spellLibCache[_spell];
			if(!cache) {
				cache = {
					ready: false,
					scripts: {},
					requireScript: false
				};

				AppFileSrv.readFile(AppVersionSrv.resPath + "res/spellLib/kv/abilities/" + _spell).then(function (data) {
					cache.ready = true;
					cache.data = data;
					//var kv = KV.parse(data);
					var match = data.match(/"ScriptFile"\s+.*"/ig) || [];

					$.each(match, function (i, script) {
						var _script = script.match(/"([^"]*)"$/)[1];
						cache.scripts[_script] = _script;
						cache.requireScript = true;
					});
				}, function () {
					// TODO: Process do retry or something
					cache.ready = "failed";
				});

				$scope.spellLibCache[_spell] = cache;
			}
		};

		$scope.newTmplAbility_SpellLibConfirm = function () {
			var _spell = $scope.spellLibItem[0];
			if(!_spell) return;
			var cache = $scope.spellLibCache[_spell];
			if(!cache || cache.ready !== true) return;

			var _data = cache.data;

			// Copy files
			$.each(cache.scripts, function (src, tgt) {
				_data = common.text.replaceAll(_data, src, tgt);
				var _srcPath = AppVersionSrv.resPath + "res/spellLib/lua/" + src;
				var _tgtPath = globalContent.project + "/scripts/vscripts/" + tgt;
				if(!AppFileSrv.fileExist(_srcPath)) {
					$.notify({
						title: "<b>File Not Found</b>",
						content: "File: " + src + " not exist. Please check...",
						type: "warning",
						region: "system"
					});
				} else if(!AppFileSrv.fileExist(_tgtPath)) {
					AppFileSrv.copyFile(_srcPath, _tgtPath);
				}
			});

			// Copy ability
			var kv = KV.parse(_data);
			var _newAbility = Ability.parse(kv);
			_newAbility.kv.key = $scope._newTmplAbility._name;
			_newAbility._changed = true;

			// Item
			if($scope.isItem) {
				_newAbility.kv.set("BaseClass", "item_datadriven");
				$scope.assignAutoID($scope.ability);
			} else {
				_newAbility.kv.set("BaseClass", "ability_datadriven");
			}

			// Insert
			$scope.abilityList.push(_newAbility);
			$scope.setAbility(_newAbility);
			$scope.treeView.list.push(
				_registerAbilityTreeItem({_id: +new Date()}, _newAbility)
			);

			setTimeout(function() {
				$("#listCntr").scrollTop(9999999);
			}, 100);
			$("#newTmplMDL").modal('hide');
		};

		// ==========> New Group
		$scope.newGroup = function() {
			UI.modal.input(Locale('New'), Locale('FolderName'), "New Folder", function(grpName) {

				$scope.treeView.list.push({
					_id : +new Date(),
					name: grpName,
					list: []
				});
			});
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

		$scope.renameCallback = function(newName, oldName) {
			$.each(globalContent.languageList, function(i, lang) {
				// Regular attributes
				$.each(Language.AbilityLang, function(i, langField) {
					var _oldKey = Language.abilityAttr(oldName, langField.attr);
					var _newKey = Language.abilityAttr(newName, langField.attr);
					if(lang.kv.get(_oldKey)) {
						lang.kv.set(_newKey, lang.kv.get(_oldKey));
					}
					if(_newKey.toUpperCase() !== _oldKey.toUpperCase()) lang.kv.delete(_oldKey);
				});

				// Special Abilities
				$.each($scope.ability.getSpecialList(), function(i, special) {
					var _oldKey = Language.abilityAttr(oldName, special.value[1].key);
					var _newKey = Language.abilityAttr(newName, special.value[1].key);
					if(lang.kv.get(_oldKey)) {
						lang.kv.set(_newKey, lang.kv.get(_oldKey));
					}
					if(_newKey.toUpperCase() !== _oldKey.toUpperCase()) lang.kv.delete(_oldKey);
				});
			});
		};

		// ==========> Rename Modifier
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

		$scope.renameModifierCallback = function(newName, oldName) {
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

		// ==========> Tree View
		$scope.fileMenu = [
			{label: Locale('Duplicate'), click: function() {
				_menuAbility = this._item.ability;
				$scope.copyAbility();
				$scope.$apply();
			}},
			{label: Locale('Delete'), click: function() {
				_menuAbility = this._item.ability;
				$scope.deleteAbility();
				$scope.$apply();
			}},
		];

		function treeViewInit() {
			// =============== Tree View Initialization ===============
			// Initialize tree view
			if(!$scope.treeView) {
				$scope.treeView = $scope.config.assumeObject("treeView");
				$scope.treeView.name = $scope.treeView.name || "root";
				$scope.treeView.list = $scope.treeView.list || [];
				$scope.treeView._id = +new Date();
				$scope.treeView.noHead = true;
				$scope.treeView.open = true;
			}

			// Loop abilities
			var _cacheSet = new Set();
			var _list = [];
			function _loopAbilities(item) {
				// Loop folder
				if(item.list) {
					$.each(item.list.slice(), function(i, _item) {
						if(_item.list) {
							// ============== Folder ==============
							if(!_item.ability || common.array.find(_item.ability, $scope.abilityList)) {
								_loopAbilities(_item);
							} else {
								common.array.remove(_item, item.list);
							}
						} else {
							// ============= Ability =============
							if(common.array.find(_item.ability, $scope.abilityList)) {
								if(!_cacheSet.has(_item._name)) {
									_cacheSet.add(_item._name);
									_loopAbilities(_item);
								} else {
									common.array.remove(_item, item.list);
								}
							} else {
								common.array.remove(_item, item.list);
							}
						}
					});
				}
				// Check item
				if(item.ability) {
					_list.push(item);
				}
			}
			_loopAbilities($scope.treeView);

			// Fill rest abilities
			var _id = 0;
			$.each($scope.abilityList, function (i, _ability) {
				if(!common.array.find(_ability, _list, "ability")) {
					var _item = {
						_id : +new Date() + "_" + (_id++)
					};
					_registerAbilityTreeItem(_item, _ability);
					$scope.treeView.list.push(_item);
				}
			});
		}

		// ================================================================
		// =                        Config Function                       =
		// ================================================================
		// Register ability tree item properties
		function _registerAbilityTreeItem(item, ability) {
			Object.defineProperties(item, {
				name: {
					configurable: true,
					get: function() {return globalContent.mainLang().kv.get(Language.abilityAttr(ability._name, ''), Config.global.kvCaseSensitive) || ability._name;}
				},
				ability: {
					configurable: true,
					get: function() {return ability;}
				},
				icon: {
					configurable: true,
					get: function() {
						var mark = $scope.config.get('abilities', ability._name, 'markUsage');
						if(mark === "dummy") return "cubes";
						if(mark === "test") return "rocket";
						return "";
					}
				},
				color: {
					configurable: true,
					get: function() {return $scope.config.get('abilities', ability._name, 'markColor');}
				},
				qualityColor: {
					configurable: true,
					get: function() {
						if(!isItem) return "";
						return Ability.ItemQuality.color[ability.get("ItemQuality")];
					}
				}
			});
			return item;
		}

		function _configInitTreeView(item) {
			if(item._name) {
				var _ability = common.array.find(item._name, $scope.abilityList, "_name");
				_registerAbilityTreeItem(item, _ability);
			}
			$.each(item.list || [], function(i, subItem) {
				_configInitTreeView(subItem);
			});
		};

		function _configExportTreeView(item) {
			if(item.ability) {
				item._name = item.ability._name;
			}
			$.each(item.list || [], function(i, subItem) {
				_configExportTreeView(subItem);
			});
		};

		function configInitFunc(configData) {
			// Tree View
			_abilityListDeferred.promise.then(function() {
				if(configData.treeView) {
					_configInitTreeView(configData.treeView);
				}

				treeViewInit();
				globalContent[_globalListKey]._treeView = $scope.treeView;
			});
			return configData;
		}

		function configExportFunc(configData) {
			// Tree View
			if(configData.treeView) {
				_configExportTreeView(configData.treeView);
			}
			return configData;
		}

		// ================================================================
		// =                        File Operation                        =
		// ================================================================
		// Read Ability file
		(function () {
			if (!globalContent[_globalListKey]) {
				/*NODE.loadFile(_filePath, "utf8").then(function (data) {
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
						content: "Can't find " + _filePath + " <br/> 【打开" + _filePath + "失败】"
					});
				}).finally(function () {
					$scope.ready = true;
					_abilityListDeferred.resolve();
				});*/
				KV.read(globalContent.projectFolder + "/" + _filePath).then(function (kv) {
					
				});
			} else {
				$scope.abilityList = globalContent[_globalListKey];
				$scope.treeView = globalContent[_globalListKey]._treeView;

				var _currentAbility = common.array.find(isItem ? window._currentItem : window._currentAbility, $scope.abilityList, "_name");

				$scope.setAbility(_currentAbility ? _currentAbility : $scope.abilityList[0]);
				$scope.ready = true;
				_abilityListDeferred.resolve();
			}
		})();

		// 多语言支持
		$scope.languageList = globalContent.languageList;
		globalContent.languageList._promise.then(function () {
			$scope.language = $scope.languageList[0];
		});

		// ================================================================
		// =                     List Item Operation                      =
		// ================================================================
		$scope.abilityMarkUsageList = [['dummy', 'cubes'], ['test', 'rocket']];
		$scope.abilityMarkColorList = ['#00a65a','#00c0ef','#dd4b39','#f39c12','#666666'];

		$scope.setAbilityMarkUsage = function(usage) {
			var _ability = $scope.config.assumeObject("abilities", $scope.ability._name);
			if(usage) {
				_ability.markUsage = usage;
			} else {
				delete _ability.markUsage;
			}
		};

		$scope.setAbilityMarkColor = function(color) {
			var _ability = $scope.config.assumeObject("abilities", $scope.ability._name);
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
				content: $("<div>").html("<p class='lead text-danger'>" + Locale("DeleteAbility") + " '"+_menuAbility._name+"'?</p>")
					.append($("<label>")
						.append("<input type='checkbox' checked> ")
						.append(Locale("DeleteWithModifier"))
					),
				confirm: true
			}, function(ret) {
				if(!ret) return;

				// Delete Ability
				var _isCurrent = $scope.ability === _menuAbility;
				common.array.remove(_menuAbility, $scope.abilityList);
				if(_isCurrent) {
					$scope.setAbility($scope.abilityList[0]);
				}

				// Delete Language
				var deleteModifierLang = $(this).find("input").prop("checked");
				$.each(globalContent.languageList, function(i, lang) {
					// Regular attributes
					$.each(Language.AbilityLang, function(i, langField) {
						lang.kv.delete(Language.abilityAttr(_menuAbility._name, langField.attr));
					});

					// Special Abilities
					$.each(_menuAbility.getSpecialList(), function(i, special) {
						lang.kv.delete(Language.abilityAttr(_menuAbility._name, special.value[1].key));
					});

					// Modifiers
					if(deleteModifierLang) {
						$.each(_menuAbility.getModifierList(), function(i, modifier) {
							$.each(Language.ModifierLang, function(i, langField) {
								lang.kv.delete(Language.modifierAttr(modifier.key, langField.attr));
							});
						});
					}
				});


				treeViewInit();
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

			return $.map($scope.abilityList, function(_ability) {
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
		};

		$("#search").on("selected.search", function(e, item) {
			var _ability = item.ability;
			if(_ability) {
				$scope.ability = _ability;
				$scope.searchBox = false;
			}
		});


		// ================================================================
		// =                        Ability Check                         =
		// ================================================================
		$scope.checkReportFilter = "";
		$scope.checkReport = [];
		$scope.checkReportFilteredList = [];

		$scope.abilitiesCheck = function() {
			$scope.checkReportFilter = "";
			$scope.checkReportFilteredList = $scope.checkReport = [];

			$.each($scope.abilityList, function(i, _ability) {
				var _markUsage = $scope.config.get('abilities', _ability._name, 'markUsage');
				if(_markUsage === 'dummy' || _markUsage === 'test') return;

				// Language check
				$.each(globalContent.languageList, function(j, lang) {
					if(!lang.kv) return;

					// Ability
					$.each(Language.AbilityLang, function(k, langField) {
						if(!langField.frequent) return;
						if(!lang.kv.get(Language.abilityAttr(_ability._name, langField.attr))) {
							$scope.checkReport.push({
								ability: _ability,
								language: lang,
								langField: langField
							});
						}
					});

					// Modifier
					$.each(_ability.getModifierList(), function (k, modifierKV) {
						if(modifierKV.get('IsHidden') === '1') return;

						$.each(Language.ModifierLang, function(l, langField) {
							if(!langField.frequent) return;
							if(!lang.kv.get(Language.modifierAttr(modifierKV.key, langField.attr))) {
								$scope.checkReport.push({
									ability: _ability,
									modifier: modifierKV,
									language: lang,
									langField: langField
								});
							}
						});
					});
				});

				if($scope.checkReport.length >= 100) return false;
			});

			$("#checkReportMDL").modal();
		};

		$scope.checkReportFilterChange = function() {
			var _keys = $scope.checkReportFilter.split(/\s+/);
			$scope.checkReportFilteredList = $.grep($scope.checkReport, function(item) {
				var _has = true;
				$.each(_keys, function(i, key) {
					if(
						// Language
						common.text.contains(item.language.name, key) ||
						common.text.contains(item.langField.attr || 'Title', key) ||
						// Ability
						common.text.contains(item.ability._name, key) ||
						// Modifier
						common.text.contains(common.getValueByPath(item, "modifier.key"), key) ||
						common.text.contains(item.modifier && "modifier", key)
					) {} else {
						_has = false;
						return false;
					}
				});

				return _has;
			});
		};

		// ================================================================
		// =                              UI                              =
		// ================================================================
		// List Container layout
		var winWidth;
		$(window).on("resize.abilityList", function () {
			setTimeout(function () {
				var _winWidth = $(window).width();
				var $abilityCntr = $(".abilityCntr");

				if (_winWidth !== winWidth && $abilityCntr.length) {
					var _left = $abilityCntr.offset().left;
					$("#listCntr").outerWidth(_left - 15);
					$("#btnGroup").outerWidth(_left - 15);
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
		var _hotKeySetting = {
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
			_F: "Search ability",
			L: function() {
				$("#descriptionTab").click();
			},
			_L: "Switch to Tab [Language]"
		};

		// Fast Tab
		var _tabList = [["O", "common"],["E", "events"],["M", "modifiers"],["K", "abilitySpecial"],["P", "precache"],["U", "unassigned"]];
		if(isItem) _tabList.push(["I", "item"]);
		$.each(_tabList, function(i, tabEntity) {
			var _key = tabEntity[0];
			var _tab = tabEntity[1];
			_hotKeySetting[_key] = function() {
				$scope.currentTab = _tab;
				$("#abilityTab").click();
			};
			_hotKeySetting["_"+_key] = "Switch to Tab [" + _tab + "]";
		});

		globalContent.hotKey($scope, _hotKeySetting);

		// Tree View
		$scope.treeItemClick = function(e, item) {
			if(item.ability) {
				$scope.setAbility(item.ability);
				if(e.ctrlKey) return false;
			}
		};

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
			clearInterval(_canCopyModifierID);
		});
	};
};

hammerControllers.controller('abilityCtrl', _abilityCtrl(false));
hammerControllers.controller('itemCtrl', _abilityCtrl(true));