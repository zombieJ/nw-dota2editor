'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Unit", function($q, KV, NODE) {
	var Unit = function() {
		var _my = this;

		// ========================================
		// =                 属性                 =
		// ========================================
		_my._name = "undefined";
		_my._comment = "";

		_my.HasInventory = "-";

		// Creature
		_my.Creature = {};

		return _my;
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Unit.parse = function(kvUnit) {
		var _unit = new Unit();
		_unit._name = kvUnit.key;
		_unit._comment = kvUnit.comment;

		$.each(kvUnit.value, function(i, kv) {
			var _attr = null;
			$.each(Unit.AttrList, function(i, attrGroup) {

			});

			if(typeof kv.value === "string") {
				_unit[kv.key] = kv.value;
			}
		});

		return _unit;
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
			{group: "common", attr: "BaseClass", type: "text", showFunc: function($scope) {return !$scope.isHero;}},
			{group: "common", attr: "Model", type: "text"},
			{group: "common", attr: "ModelScale", type: "text"},
			{group: "common", attr: "Level", type: "text"},
			{group: "common", attr: "HasInventory", type: "single"},
		],

		[
			{group: "bounty", attr: "BountyGoldMin", type: "text"},
			{group: "bounty", attr: "BountyGoldMax", type: "text"},
		],

		[
			{group: "bounds", attr: "HealthBarOffset", type: "text"},
			{group: "bounds", attr: "BoundsHullName", type: "text"},
			{group: "bounds", attr: "RingRadius", type: "text"},
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

	Unit.AttrAbilityList = [
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

	Unit.AttrAttackDefenseList = [
		[
			{group: "attack", attr: "AttackCapabilities", type: "single"},
			{group: "attack", attr: "AttackDamageType", type: "single"},
			{group: "attack", attr: "AttackDamageMin", type: "text"},
			{group: "attack", attr: "AttackDamageMax", type: "text"},
			{group: "attack", attr: "AttackRate", type: "text"},
			{group: "attack", attr: "AttackAnimationPoint", type: "text"},
			{group: "attack", attr: "AttackAcquisitionRange", type: "text"},
			{group: "attack", attr: "AttackRange", type: "text"},
		],

		[
			{group: "armor", attr: "ArmorPhysical", type: "text"},
			{group: "armor", attr: "MagicalResistance", type: "text"},
		],
	];

	Unit.AttrOtherList = [
		[
			{group: "movement", attr: "MovementCapabilities", type: "single"},
			{group: "movement", attr: "MovementSpeed", type: "text"},
			{group: "movement", attr: "MovementTurnRate", type: "text"},
		],

		[
			{group: "status", attr: "StatusHealth", type: "text"},
			{group: "status", attr: "StatusHealthRegen", type: "text"},
			{group: "status", attr: "StatusMana", type: "text"},
			{group: "status", attr: "StatusManaRegen", type: "text"},
		],

		[
			{group: "Vision", attr: "VisionDaytimeRange", type: "text"},
			{group: "Vision", attr: "VisionNighttimeRange", type: "text"},
		],

		[
			{group: "Team", attr: "TeamName", type: "text"},
			{group: "Team", attr: "CombatClassAttack", type: "text"},
			{group: "Team", attr: "CombatClassDefend", type: "text"},
			{group: "Team", attr: "UnitRelationShipClass", type: "text"},
		],
	];

	Unit.AttrCreatureList = [
		[
			{group: "Common", attr: "DisableClumpingBehavior", type: "boolean"},
			{group: "Common", attr: "CanRespawn", type: "boolean"},
			{group: "Common", attr: "DisableResistance", type: "text"},
		],

		[
			{group: "Level", attr: "HPGain", type: "text"},
			{group: "Level", attr: "DamageGain", type: "text"},
			{group: "Level", attr: "ArmorGain", type: "text"},
			{group: "Level", attr: "MagicResistGain", type: "text"},
			{group: "Level", attr: "MoveSpeedGain", type: "text"},
			{group: "Level", attr: "BountyGain", type: "text"},
			{group: "Level", attr: "XPGain", type: "text"},
		],

		[
			{group: "Wearable", attr: "AttachWearables", type: "wearable"},
		],
	];

	Unit.AttrList = [
		{name: "Common", value: Unit.AttrCommonList},
		{name: "Hero", value: Unit.AttrHeroList, showFunc: function($scope) {return $scope.isHero;}},
		{name: "Ability", value: Unit.AttrAbilityList},
		{name: "AttackDefense", value: Unit.AttrAttackDefenseList},
		{name: "Others", value: Unit.AttrOtherList},
		{name: "Creature", value: Unit.AttrCreatureList, showFunc: function($scope) {return $scope.isHero || $scope.ability.BaseClass === "npc_dota_creature";}},
	];

	// ================================================
	// =                     枚举                     =
	// ================================================
	Unit.HasInventory = [
		["-","无"],
		["0","否"],
		["1","是"],
	];

	return Unit;
});