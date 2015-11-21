'use strict';

// ======================================================
// =                        技能                        =
// ======================================================
app.factory("Ability", function($q, Event, Modifier) {
	var Ability = function(kv) {
		var _my = this;
		_my.kv = kv || new KV("undefined", []);
		_my._changed = false;

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

		// Event List
		_my._eventList = [];

		return _my;
	};

	// Get
	Ability.prototype.get = function(key) {
		return this.kv.get(key, false);
	};

	// Has
	Ability.prototype.has = function(key, value) {
		var _list = (this.get(key) || "").split("|");
		var _has = false;

		$.each(_list, function(i, line) {
			if(line.trim() === value.trim()) {
				_has = true;
				return false;
			}
		});

		return _has;
	};

	// Get Events
	Ability.prototype.getEventList = function() {
		var _my = this;
		_my._eventList.splice(0);
		$.each(_my.kv.value, function(i, kv) {
			if(common.array.find(kv.key, Event.ModifierEventList, "", false, false)) {
				_my._eventList.push(kv);
			}
		});
		return _my._eventList;
	};

	// Get Modifiers
	Ability.prototype.getModifierList = function() {
		return this.kv.get("Modifiers", false) || common.array.empty;
	};

	// Get Ability Special
	Ability.prototype.getSpecialList = function() {
		return this.kv.get("AbilitySpecial", false) || common.array.empty;
	};

	// =================================================
	// =                     Const                     =
	// =================================================
	Ability.filePath = "scripts/npc/npc_abilities_custom.txt";
	Ability.exportFilePath = "scripts/npc/npc_abilities_custom.txt";

	Ability.itemFilePath = "scripts/npc/npc_items_custom.txt";
	Ability.exportItemFilePath = "scripts/npc/npc_items_custom.txt";

	Ability.abilityConfig = ".dota2editor/ability.conf";
	Ability.itemConfig = ".dota2editor/item.conf";

	// =================================================
	// =                     Parse                     =
	// =================================================
	Ability.parse = function(kvUnit) {
		var _unit = new Ability(kvUnit);
		return _unit;
	};

	// ================================================
	// =                  Attr List                   =
	// ================================================
	var _channelFunc = function($scope) {
		return $scope.ability.has("AbilityBehavior", "DOTA_ABILITY_BEHAVIOR_CHANNELLED");
	 };

	Ability.AttrList = [
		/*[
		 {group: "common", attr: "ConsideredHero", type: "single", showFunc: function($scope) {return !$scope.isHero;}},
		 ],*/
		[
			{group: "common", attr: "BaseClass", type: "text", defaultValue: "ability_datadriven"},
			{group: "common", attr: "AbilityTextureName", type: "text"},
			{
				group: "common", attr: "ScriptFile", type: "text", showFunc: function ($scope) {
				return $scope.ability.get("BaseClass") === "ability_lua";
			}
			},
			{group: "common", attr: "AbilityBehavior", type: "group"},
		],
		[
			{group: "target", attr: "AbilityUnitTargetType", type: "group"},
			{
				group: "target",
				attr: "AbilityUnitTargetTeam",
				type: "single",
				defaultValue: "DOTA_UNIT_TARGET_TEAM_NONE"
			},
			{group: "target", attr: "AbilityUnitTargetFlags", type: "group"},
			{group: "target", attr: "AbilityUnitDamageType", type: "single"},
		],
		[
			{group: "skill", attr: "AbilityType", type: "single", defaultValue: "DOTA_ABILITY_TYPE_BASIC"},
			{group: "skill", attr: "HotKeyOverride", type: "text"},
			{group: "skill", attr: "MaxLevel", type: "text"},
			{group: "skill", attr: "RequiredLevel", type: "text"},
			{group: "skill", attr: "LevelsBetweenUpgrades", type: "text"},
		],
		[
			{group: "animation", attr: "AbilityCastPoint", type: "text"},
			{group: "animation", attr: "AbilityCastAnimation", type: "text"},
		],
		[
			{group: "usage", attr: "AbilityCooldown", type: "text"},
			{group: "usage", attr: "AbilityManaCost", type: "text"},
			{group: "usage", attr: "AbilityCastRange", type: "text"},
			{group: "usage", attr: "AbilityCastRangeBuffer", type: "text"},
			{group: "usage", attr: "AbilityChannelTime", type: "text", showFunc: _channelFunc},
			{group: "usage", attr: "AbilityChannelledManaCostPerSecond", type: "text", showFunc: _channelFunc},
			{
				group: "usage", attr: "AOERadius", type: "text", showFunc: function ($scope) {
					return $scope.ability.has("AbilityBehavior", "DOTA_ABILITY_BEHAVIOR_AOE");
				}
			},
		],
	];

	Ability.ItemAttrList = [
		{group: "item", attr: "ID", type: "text"},
		{group: "item", attr: "ItemCost", type: "text"},
		{group: "item", attr: "ItemDroppable", type: "boolean", true},
		{group: "item", attr: "ItemSellable", type: "boolean", true},
		{group: "item", attr: "ItemShareability", type: "single"},
		{group: "item", attr: "ItemPurchasable", type: "single"},
		{group: "item", attr: "ItemDeclarations", type: "single"},
		{group: "item", attr: "ItemKillable", type: "boolean", true},
		{group: "item", attr: "ItemAlertable", type: "boolean", false},
		{group: "item", attr: "ItemPermanent", type: "single"},
		{group: "item", attr: "ItemInitialCharges", type: "text"},
		{group: "item", attr: "ItemRequiresCharges", type: "single"},
		{group: "item", attr: "ItemStackable", type: "boolean", false},
		{group: "item", attr: "SideShop", type: "text"},
		{group: "item", attr: "SecretShop", type: "text"},
		{group: "item", attr: "ItemCastOnPickup", type: "boolean", false},
		{group: "item", attr: "ItemQuality", type: "single"},
		{group: "item", attr: "ItemShopTags", type: "text"},
		{group: "item", attr: "ItemAliases", type: "text"},
		{group: "item", attr: "MaxUpgradeLevel", type: "text"},
		{group: "item", attr: "ItemBaseLevel", type: "text"},
		{group: "item", attr: "ItemRecipe", type: "boolean", false},
		{group: "item", attr: "ItemResult", type: "text"},
		{group: "item", attr: "ItemRequirements", type: "blob"},  // TODO: 合成公式！
		{group: "item", attr: "ItemDisassembleRule", type: "single"},
	];

	return Ability;
});