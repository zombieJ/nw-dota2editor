'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Unit", function($q, $http, FS, Locale, KV) {
	var Unit = function(kv) {
		var _my = this;
		_my.kv = kv || new KV("undefined", []);
		_my._changed = false;

		// Refresh un-assigned list
		_my.unassignedList = [];
		_my.refreshUnassignedList();

		// ========================================
		// =                 Prop                 =
		// ========================================
		Object.defineProperty(_my, "_name", {
			get: function() {
				return _my.kv.key;
			}, set: function(value) {
				_my.kv.key = value;
			}
		});
		Object.defineProperty(_my, "_comment", {
			get: function() {
				return _my.kv.comment;
			}, set: function(value) {
				_my.kv.comment = value;
			}
		});

		// Force Keep Ability
		for(var i = 1 ; i <= 16 ; i += 1) {
			_my.kv.assumeKey("Ability" + i).keep = true;
		};

		return _my;
	};

	Unit.init = function() {
		if (Unit.list) return;

		Unit.list = {};

		if(!FS) return;

		FS.readFile("res/items_game.json", "utf8", function (err, data) {
			if(err) {
				$.dialog({
					title: "OPS!",
					content: "Can't load item mapping resource. 【无法加载饰品资源文件】",
				});
			} else {
				var _worker = new Worker("public/js/worker/itemWorker.js");
				_worker.onmessage = function(event) {
					Unit.list = event.data.list;
				};
				_worker.postMessage(data);
			}
		});
	};

	Unit.match = function(match) {
		match = (match || "").trim().toUpperCase();
		if(!match || !Unit.list) return [];

		var _matchList = [];
		var _maxMatch = 10;
		$.each(Unit.list, function(key, value) {
			if(!value) return;

			if(
				(key+"").toUpperCase().indexOf(match) !== -1 ||
				(value.name || "").toUpperCase().indexOf(match) !== -1 ||
				(value.image_inventory || "").toUpperCase().indexOf(match) !== -1 ||
				(value.model_player || "").toUpperCase().indexOf(match) !== -1
			) {
				_maxMatch -= 1;
				_matchList.push([key, value.name]);

				if(_maxMatch < 0) return false;
			}
		});

		return _matchList;
	};

	Unit.showWearablePreview = function(key) {
		var _item = common.getValueByPath(Unit, "list." + key, null);
		if(!_item) return null;

		var _path = _item.image_inventory;

		var $content = $("<div class='text-center'>").append($("<p>").text(_item.model_player));
		var $loading = $('<i class="fa fa-refresh fa-spin"></i>').prependTo($content);

		if(_path) {
			// Cache before reborn version
			var $img = $("<img>");
			$img.attr("src", "http://git.oschina.net/zombiej/dota2-econ-heroes/raw/master/" + _path.replace("econ/", "") + ".png");
			$content.prepend($img);
			$img.load(function() {
				$loading.remove();
			});

			// Reborn version
			$img.error(function() {
				var _streamAPIKey = localStorage.getItem("streamAPIKey") || "";
				if(!_streamAPIKey) {
					$content.append($("<small class='text-warning'>").text(Locale('streamKeyNotSet')));
					$loading.remove();
				} else {
					$img.hide();
					var _name = _item.image_inventory.match(/[^\/]*$/)[0].toLowerCase();
					$http.get("https://api.steampowered.com/IEconDOTA2_570/GetItemIconPath/v1/?key=" + _streamAPIKey + "&iconname=" + _name).then(function (ret) {
						var _path = common.getValueByPath(ret, "data.result.path");
						var _url = "http://cdn.dota2.com/apps/570/" + _path;
						$img.attr("src", _url).show();
						$loading.remove();
					}, function() {
						$content.prepend($("<p class='text-danger'>").text(Locale('connectionError')));
						$loading.remove();
					});
				}
			});
		}

		$.dialog({
			title: _item.name,
			content: $content
		});
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Unit.parse = function(kvUnit) {
		var _unit = new Unit(kvUnit);
		return _unit;
	};

	// ================================================
	// =                    格式化                    =
	// ================================================
	Unit.prototype.doWriter = function(writer) {
		var _keepKV = localStorage.getItem("saveKeepKV") === "true";

		var _wearableList = this.kv.getValueByPath('Creature.AttachWearables', []);
		$.each(_wearableList, function(i, _wearable) {
			_wearable.key = "Wearable" + (i + 1);
		});

		writer.writeContent(this.kv.toString(_keepKV));
	};

	// ================================================
	// =                寻找未定义键值                =
	// ================================================
	Unit.prototype.refreshUnassignedList = function() {
		var _my = this;
		_my.unassignedList = [];

		$.each(this.kv.value, function(i, kv) {
			var _key = (kv.key || "").toUpperCase();
			var _match = false;

			if(_key === "CREATURE") return;
			$.each(Unit.AttrList, function(i, attrList) {
				if (!attrList.value) return;

				$.each(attrList.value, function (i, attrGroup) {
					$.each(attrGroup, function (j, attrUnit) {
						if (!attrUnit.path && attrUnit.attr.toUpperCase() === _key) {
							_match = true;
							return false;
						}
					});
					if(_match) return false;
				});
				if(_match) return false;
			});

			if(!_match) {
				_my.unassignedList.push(kv);
			}
		});
	};

	// ================================================
	// =                     常量                     =
	// ================================================
	Unit.filePath = "scripts/npc/npc_units_custom.txt";
	Unit.unitConfig = ".dota2editor/unit.conf";

	Unit.heroFilePath = "scripts/npc/npc_heroes_custom.txt";
	Unit.heroConfig = ".dota2editor/hero.conf";

	// ================================================
	// =                     属性                     =
	// ================================================
	Unit.AttrCommonList = [
		[
			{group: "common", attr: "BaseClass", type: "text"},
			{group: "common", attr: "Model", type: "text"},
			{group: "common", attr: "ModelScale", type: "text"},
			{group: "common", attr: "Level", type: "text"},
			{group: "common", attr: "HasInventory", type: "single"},
			{group: "common", attr: "ConsideredHero", type: "single", showFunc: function($scope) {return !$scope.isHero;}},
		],

		[
			{group: "miniMap", attr: "MinimapIcon", type: "text"},
			{group: "miniMap", attr: "MinimapIconSize", type: "text"},
		],

		[
			{group: "bounty", attr: "BountyXP", type: "text"},
			{group: "bounty", attr: "BountyGoldMin", type: "text"},
			{group: "bounty", attr: "BountyGoldMax", type: "text"},
		],

		[
			{group: "bounds", attr: "HealthBarOffset", type: "text"},
			{group: "bounds", attr: "BoundsHullName", type: "text"},
			{group: "bounds", attr: "RingRadius", type: "text"},
		],
		[
			{group: "ai", attr: "vscripts", type: "text"},
		],
	];

	Unit.AttrHeroList = [
		[
			{group: "hero", attr: "override_hero", type: "text"},
		],
		[
			{group: "attr", attr: "AttributePrimary", type: "single"},
			{group: "attr", attr: "AttributeBaseStrength", type: "text"},
			{group: "attr", attr: "AttributeStrengthGain", type: "text"},
			{group: "attr", attr: "AttributeBaseAgility", type: "text"},
			{group: "attr", attr: "AttributeAgilityGain", type: "text"},
			{group: "attr", attr: "AttributeBaseIntelligence", type: "text"},
			{group: "attr", attr: "AttributeIntelligenceGain", type: "text"},
		],
	];

	Unit.AttrSoundAbilityList = [
		[
			{group: "sound", attr: "SoundSet", type: "text"},
			{group: "sound", attr: "GameSoundsFile", type: "text"},
			{group: "sound", attr: "IdleSoundLoop", type: "text"},
		],

		[
			{group: "ability", attr: "AbilityLayout", type: "text"},
			{group: "ability", attr: "Ability1", type: "text"},
			{group: "ability", attr: "Ability2", type: "text"},
			{group: "ability", attr: "Ability3", type: "text"},
			{group: "ability", attr: "Ability4", type: "text"},
			{group: "ability", attr: "Ability5", type: "text"},
			{group: "ability", attr: "Ability6", type: "text"},
			{group: "ability", attr: "Ability7", type: "text"},
			{group: "ability", attr: "Ability8", type: "text"},
			{group: "ability", attr: "Ability9", type: "text"},
			{group: "ability", attr: "Ability10", type: "text"},
			{group: "ability", attr: "Ability11", type: "text"},
			{group: "ability", attr: "Ability12", type: "text"},
			{group: "ability", attr: "Ability13", type: "text"},
			{group: "ability", attr: "Ability14", type: "text"},
			{group: "ability", attr: "Ability15", type: "text"},
			{group: "ability", attr: "Ability16", type: "text"},
		],
	];

	Unit.AttrAttackDefenseSpeedList = [
		[
			{group: "attack", attr: "AttackCapabilities", type: "single"},
			{group: "attack", attr: "AttackDamageType", type: "single"},
			{group: "attack", attr: "AttackDamageMin", type: "text"},
			{group: "attack", attr: "AttackDamageMax", type: "text"},
			{group: "attack", attr: "AttackRate", type: "text"},
			{group: "attack", attr: "AttackAnimationPoint", type: "text"},
			{group: "attack", attr: "AttackAcquisitionRange", type: "text"},
			{group: "attack", attr: "AttackRange", type: "text"},
			{group: "attack", attr: "AttackRangeBuffer", type: "text"},
		],

		[
			{group: "Projectile", attr: "ProjectileModel", type: "text", showFunc: function($scope) {return $scope.ability.kv.get("AttackCapabilities", false)  === "DOTA_UNIT_CAP_RANGED_ATTACK";}},
			{group: "Projectile", attr: "ProjectileSpeed", type: "text", showFunc: function($scope) {return $scope.ability.kv.get("AttackCapabilities", false) === "DOTA_UNIT_CAP_RANGED_ATTACK";}},
		],

		[
			{group: "armor", attr: "ArmorPhysical", type: "text"},
			{group: "armor", attr: "MagicalResistance", type: "text"},
		],

		[
			{group: "movement", attr: "MovementCapabilities", type: "single"},
			{group: "movement", attr: "MovementSpeed", type: "text"},
			{group: "movement", attr: "MovementTurnRate", type: "text"},
			{group: "movement", attr: "HasAggressiveStance", type: "boolean"},
			{group: "movement", attr: "FollowRange", type: "text"},
		],
	];

	Unit.AttrHPMPVisionList = [
		[
			{group: "status", attr: "StatusHealth", type: "text"},
			{group: "status", attr: "StatusHealthRegen", type: "text"},
			{group: "status", attr: "StatusMana", type: "text"},
			{group: "status", attr: "StatusManaRegen", type: "text"},
			{group: "status", attr: "StatusStartingMana", type: "text"},
		],

		[
			{group: "Vision", attr: "VisionDaytimeRange", type: "text"},
			{group: "Vision", attr: "VisionNighttimeRange", type: "text"},
		],
	];

	Unit.AttrOtherList = [
		[
			{group: "label", attr: "UnitLabel", type: "text"},
		],

		[
			{group: "others", attr: "IsAncient", type: "boolean"},
			{group: "others", attr: "IsNeutralUnitType", type: "boolean"},
			{group: "others", attr: "CanBeDominated", type: "single"},
			{group: "others", attr: "AutoAttacksByDefault", type: "single"},
			{group: "others", attr: "ShouldDoFlyHeightVisual", type: "single"},
			{group: "others", attr: "WakesNeutrals", type: "boolean"},
		],

		[
			{group: "AttackDefend", attr: "CombatClassAttack", type: "single"},
			{group: "AttackDefend", attr: "CombatClassDefend", type: "single"},
		],

		[
			{group: "Team", attr: "TeamName", type: "text"},
			{group: "Team", attr: "UnitRelationShipClass", type: "single"},
			{group: "Team", attr: "SelectionGroup", type: "text"},
			{group: "Team", attr: "SelectOnSpawn", type: "boolean"},
			{group: "Team", attr: "IgnoreAddSummonedToSelection", type: "boolean"},
		],
	];

	Unit.AttrCreatureList = [
		[
			{group: "Common", path: "Creature", attr: "DisableClumpingBehavior", type: "boolean"},
			{group: "Common", path: "Creature", attr: "CanRespawn", type: "boolean"},
			{group: "Common", path: "Creature", attr: "DisableResistance", type: "text"},
		],

		[
			{group: "Level", path: "Creature", attr: "HPGain", type: "text"},
			{group: "Level", path: "Creature", attr: "DamageGain", type: "text"},
			{group: "Level", path: "Creature", attr: "ArmorGain", type: "text"},
			{group: "Level", path: "Creature", attr: "MagicResistGain", type: "text"},
			{group: "Level", path: "Creature", attr: "MoveSpeedGain", type: "text"},
			{group: "Level", path: "Creature", attr: "BountyGain", type: "text"},
			{group: "Level", path: "Creature", attr: "XPGain", type: "text"},
		],
	];

	Unit.AttrList = [
		{name: "Common", value: Unit.AttrCommonList},
		{name: "Hero", value: Unit.AttrHeroList, showFunc: function($scope) {return $scope.isHero;}},
		{name: "SoundAbility", value: Unit.AttrSoundAbilityList},
		{name: "AttackDefenseSpeed", value: Unit.AttrAttackDefenseSpeedList},
		{name: "HPMPVision", value: Unit.AttrHPMPVisionList},
		{name: "Creature", value: Unit.AttrCreatureList, showFunc: function($scope) {return $scope.ability && $scope.ability.kv.get("BaseClass", false) === "npc_dota_creature";}},
		{name: "Wearable", showFunc: function($scope) {return $scope.ability && $scope.ability.kv.get("BaseClass", false) === "npc_dota_creature";}},
		{name: "Others", value: Unit.AttrOtherList},
		{name: "Unassigned"},
	];

	// ================================================
	// =                     枚举                     =
	// ================================================
	Unit.HasInventory = Unit.ConsideredHero = Unit.CanBeDominated = Unit.AutoAttacksByDefault = Unit.ShouldDoFlyHeightVisual = [
		["0","否"],
		["1","是"],
	];

	Unit.BoundsHullName = [
		["DOTA_HULL_SIZE_SMALL","8"],
		["DOTA_HULL_SIZE_REGULAR","16"],
		["DOTA_HULL_SIZE_SIEGE","16"],
		["DOTA_HULL_SIZE_HERO","24"],
		["DOTA_HULL_SIZE_HUGE","80"],
		["DOTA_HULL_SIZE_BUILDING","81"],
		["DOTA_HULL_SIZE_FILLER","96"],
		["DOTA_HULL_SIZE_BARRACKS","144"],
		["DOTA_HULL_SIZE_TOWER","144"],
	];

	Unit.AttackCapabilities = [
		["DOTA_UNIT_CAP_NO_ATTACK","不能攻击"],
		["DOTA_UNIT_CAP_MELEE_ATTACK","近战攻击"],
		["DOTA_UNIT_CAP_RANGED_ATTACK","远程攻击"],
	];

	Unit.AttackDamageType = [];

	Unit.AttributePrimary = [
		["DOTA_ATTRIBUTE_AGILITY", "敏捷"],
		["DOTA_ATTRIBUTE_INTELLECT", "智力"],
		["DOTA_ATTRIBUTE_STRENGTH", "力量"],
	];

	Unit.MovementCapabilities = [
		["DOTA_UNIT_CAP_MOVE_NONE", "不能移动"],
		["DOTA_UNIT_CAP_MOVE_GROUND", "地面"],
		["DOTA_UNIT_CAP_MOVE_FLY", "飞行"],
	];

	Unit.CombatClassAttack = [
		["DOTA_COMBAT_CLASS_ATTACK_BASIC", "普通"],
		["DOTA_COMBAT_CLASS_ATTACK_HERO", "英雄"],
		["DOTA_COMBAT_CLASS_ATTACK_LIGHT", "混乱"],
		["DOTA_COMBAT_CLASS_ATTACK_PIERCE", "穿刺"],
		["DOTA_COMBAT_CLASS_ATTACK_SIEGE", "攻城"],
	];

	Unit.CombatClassDefend = [
		["DOTA_COMBAT_CLASS_DEFEND_BASIC", "普通"],
		["DOTA_COMBAT_CLASS_DEFEND_HERO", "英雄"],
		["DOTA_COMBAT_CLASS_DEFEND_SOFT", "轻型"],
		["DOTA_COMBAT_CLASS_DEFEND_STRONG", "重型"],
		["DOTA_COMBAT_CLASS_DEFEND_STRUCTURE", "建筑"],
		["DOTA_COMBAT_CLASS_DEFEND_WEAK", "脆弱"],
	];

	Unit.UnitRelationShipClass = [
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_DEFAULT", "默认"],
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_BARRACKS", "兵营"],
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_BUILDING", "建筑"],
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_COURIER", "信使"],
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_HERO", "英雄"],
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_SIEGE", "主城"],
		["DOTA_NPC_UNIT_RELATIONSHIP_TYPE_WARD", "眼"],
	];

	return Unit;
});