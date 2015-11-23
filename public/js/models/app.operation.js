'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Operation", function(Sound) {
	var Operation = function(kvUnit) {
		if(!kvUnit._entity) {
			kvUnit._entity = new Op(kvUnit);
		}
		return kvUnit._entity;
	};

	var Op = function(kvUnit) {
		var _my = this;
		_my.kv = kvUnit;

		return _my;
	};

	// ===============================================
	// =             Operation Attr List             =
	// ===============================================
	Op.prototype.getAttrList = function() {
		var OP = common.array.find(this.kv.key, Operation.EventItemOperation, "0", false, false);
		if(!OP) {
			_ERROR("Operation", 0, "Operation not found:", this.kv.key, this.kv)
		} else {
			return OP[2];
		}
	};

	// ===============================================
	// =               Operation List                =
	// ===============================================
	Operation.EventOperation = [
		["ApplyModifier", true, ["Target", "ModifierName", "Duration"]],
		["RemoveModifier", true, ["Target", "ModifierName"]],
		["AttachEffect", true, ["EffectName","EffectAttachType","Target","ControlPoints", "ControlPointEntities"]],
		["FireEffect", true, ["EffectName", "EffectAttachType", "Target", "ControlPoints", "ControlPointEntities"]],
		["Damage", true, ["Target", "Type","Damage", "MinDamage", "MaxDamage", "CurrentHealthPercentBasedDamage", "MaxHealthPercentBasedDamage"]],
		["Heal",true,["HealAmount","Target"]],
		["FireSound",true,["EffectName", "Target"]],
		["RunScript", true, ["Target", "ScriptFile", "Function"]],
		["Stun",true, ["Target", "Duration"]],
		["TrackingProjectile", true, ["Target", "EffectName", "Dodgeable", "ProvidesVision", "VisionRadius", "MoveSpeed", "SourceAttachment"]],
		["Random", true,["Chance", "PseudoRandom", "OnSuccess", "OnFailure"]],

		["SpawnUnit", false, ["UnitName", "UnitCount", "Target", "UnitLimit", "SpawnRadius", "Duration", "GrantsGold", "GrantsXP", "OnSpawn"]],
		["ActOnTargets", false, ["Target", "Action"]],
		["LevelUpAbility",false,["Target", "AbilityName"]],
		["Knockback",false,["Target","Center", "Duration", "Distance", "Height", "IsFixedDistance", "ShouldStun"]],
		["AddAbility",false,["Target","AbilityName"]],
		["RemoveAbility",false,["Target","AbilityName"]],
		["Blink", false, ["Target"]],
		["DestroyTrees", false, ["Target","Radius"]],
		["DelayedAction", false, ["Delay", "Action"]],
		["Lifesteal", false, ["Target", "LifestealPercent"]],
		["CleaveAttack", false, ["CleavePercent", "CleaveRadius", "CleaveEffect"]],
		["CreateThinker", false, ["Target", "ModifierName"]],
		["LinearProjectile", false, ["Target","EffectName","MoveSpeed","StartRadius","EndRadius","FixedDistance","StartPosition",
			"TargetTeams","TargetTypes","TargetFlags","HasFrontalCone","ProvidesVision","VisionRadius"]],
		["ApplyMotionController", "运动控制", false, ["Target","ScriptFile","HorizontalControlFunction","VerticalControlFunction","Duration"]],
	];

	Operation.EventItemOperation = [
		["SpendCharge", true, []],
	].concat(Operation.EventOperation);

	Operation.EventOperationMap = {};
	$.each(Operation.EventItemOperation, function(i, item) {
		Operation.EventOperationMap[item[0]] = item;
	});

	// ===============================================
	// =               Operation Attr                =
	// ===============================================
	var _match_EffectName = function(operation) {
		if(!operation) return null;
		return operation.name === "FireSound" ?  Sound.match : null;
	};

	var _match_ModifierName = function(match) {
		match = (match || "").toUpperCase();
		var _list = $.map(_match_ModifierName.ability._modifierList, function(modifier) {
			if((modifier._name || "").toUpperCase().indexOf(match) !== -1) return [[modifier._name]];
		});
		return _list;
	};

	var _link_ModifierName = function() {
		var $scope = angular.element("#listCntr").scope();
		$scope.currentTab = "modifiers";
		$scope.currentModifier = _link_ModifierName.modifier;
	};

	//{group: "common", attr: "BaseClass", type: "text", defaultValue: "ability_datadriven"},
	Operation.OperationAttrMap = {
		Target: {type: "unitGroup", value: ["CASTER", "TARGET", "POINT", "ATTACKER", "UNIT", "[Group Units]"]},
		AbilityName: {type: "text"},
		ModifierName: {
			type: "text", match: function (operation, ability) {
				_match_ModifierName.ability = ability;
				return _match_ModifierName;
			}, link: function (value, operation, ability) {
				var _modifier = common.array.find(value, ability._modifierList, "_name");
				if (_modifier) {
					_link_ModifierName.modifier = _modifier;
					return _link_ModifierName;
				}
				return null;
			}
		},
		EffectName: {type: "text", match: _match_EffectName},
		EffectAttachType: {
			type: "single",
			value: [["follow_origin"], ["follow_overhead"], ["start_at_customorigin"], ["world_origin"]]
		},
		ControlPoints: {type: "tree"},
		ControlPointEntities: {type: "tree"},
		Type: {type: "single", value: [["DAMAGE_TYPE_MAGICAL"], ["DAMAGE_TYPE_PHYSICAL"], ["DAMAGE_TYPE_PURE"]]},
		MinDamage: {type: "text"},
		MaxDamage: {type: "text"},
		Damage: {type: "text"},
		CurrentHealthPercentBasedDamage: {type: "text"},
		MaxHealthPercentBasedDamage: {type: "text"},
		Radius: {type: "text"},
		HealAmount: {type: "text"},
		Center: {type: "single", value: [["CASTER"], ["TARGET"], ["POINT"], ["ATTACKER"], ["UNIT"], ["PROJECTILE"]]},
		Duration: {type: "text"},
		Delay: {type: "text"},
		Distance: {type: "text"},
		Height: {type: "text"},
		IsFixedDistance: {type: "boolean"},
		ShouldStun: {type: "boolean"},
		ScriptFile: {type: "text"},
		Function: {type: "text"},
		UnitName: {type: "text"},
		UnitCount: {type: "text"},
		UnitLimit: {type: "text"},
		SpawnRadius: {type: "text"},
		GrantsGold: {type: "text"},
		GrantsXP: {type: "text"},
		Dodgeable: {type: "boolean"},
		ProvidesVision: {type: "boolean"},
		VisionRadius: {type: "text"},
		MoveSpeed: {type: "text"},
		SourceAttachment: {type: "text"},// TODO: hitloc?
		Chance: {type: "text"},
		PseudoRandom: {type: "text", value: [
			["DOTA_PSEUDO_RANDOM_BREWMASTER_CRIT"],
			["DOTA_PSEUDO_RANDOM_CHAOS_CRIT"],
			["DOTA_PSEUDO_RANDOM_FACELESS_BASH"],
			["DOTA_PSEUDO_RANDOM_ITEM_ABYSSAL"],
			["DOTA_PSEUDO_RANDOM_ITEM_BASHER"],
			["DOTA_PSEUDO_RANDOM_ITEM_BUTTERFLY"],
			["DOTA_PSEUDO_RANDOM_ITEM_GREATERCRIT"],
			["DOTA_PSEUDO_RANDOM_ITEM_HALBRED_MAIM"],
			["DOTA_PSEUDO_RANDOM_ITEM_LESSERCRIT"],
			["DOTA_PSEUDO_RANDOM_ITEM_MAELSTROM"],
			["DOTA_PSEUDO_RANDOM_ITEM_MJOLLNIR"],
			["DOTA_PSEUDO_RANDOM_ITEM_MJOLLNIR_STATIC"],
			["DOTA_PSEUDO_RANDOM_ITEM_MKB"],
			["DOTA_PSEUDO_RANDOM_ITEM_PMS"],
			["DOTA_PSEUDO_RANDOM_ITEM_SANGE_MAIM"],
			["DOTA_PSEUDO_RANDOM_ITEM_SANGEYASHA_MAIM"],
			["DOTA_PSEUDO_RANDOM_ITEM_STOUT"],
			["DOTA_PSEUDO_RANDOM_ITEM_VANGUARD"],
			["DOTA_PSEUDO_RANDOM_JUGG_CRIT"],
			["DOTA_PSEUDO_RANDOM_LYCAN_CRIT"],
			["DOTA_PSEUDO_RANDOM_PHANTOMASSASSIN_CRIT"],
			["DOTA_PSEUDO_RANDOM_SKELETONKING_CRIT"],
			["DOTA_PSEUDO_RANDOM_SLARDAR_BASH"],
			["DOTA_PSEUDO_RANDOM_SNIPER_HEADSHOT"],
			["DOTA_PSEUDO_RANDOM_TROLL_BASH"],
		]},
		OnSuccess: {type: "operation"},
		OnFailure: {type: "operation"},
		Action: {type: "operation"},
		OnSpawn: {type: "operation"},
		CleavePercent: {type: "text"},
		CleaveRadius: {type: "text"},
		StartRadius: {type: "text"},
		EndRadius: {type: "text"},
		FixedDistance: {type: "text"},
		StartPosition: {type: "text"},// TODO: hitloc? attach_attack1? attach_origin?
		TargetTeams: {
			type: "single",
			value: [["DOTA_UNIT_TARGET_TEAM_BOTH"], ["DOTA_UNIT_TARGET_TEAM_ENEMY"], ["DOTA_UNIT_TARGET_TEAM_FRIENDLY"], ["DOTA_UNIT_TARGET_TEAM_CUSTOM"], ["DOTA_UNIT_TARGET_TEAM_NONE"]]
		},
		TargetTypes: {
			type: "group", value: [
				["DOTA_UNIT_TARGET_HERO", "英雄", true],
				["DOTA_UNIT_TARGET_BASIC", "基本", true],
				["DOTA_UNIT_TARGET_ALL", "所有"],
				["DOTA_UNIT_TARGET_BUILDING", "建筑"],
				["DOTA_UNIT_TARGET_COURIER", "信使"],
				["DOTA_UNIT_TARGET_CREEP", "野怪"],
				["DOTA_UNIT_TARGET_CUSTOM", "普通"],
				["DOTA_UNIT_TARGET_MECHANICAL", "机械"],
				["DOTA_UNIT_TARGET_NONE", "无"],
				["DOTA_UNIT_TARGET_OTHER", "其他"],
				["DOTA_UNIT_TARGET_TREE", "树木"],
			]
		},
		TargetFlags: {
			type: "group", value: [
				["DOTA_UNIT_TARGET_FLAG_CHECK_DISABLE_HELP", "检测玩家'禁用帮助'选项"],
				["DOTA_UNIT_TARGET_FLAG_DEAD", "已死亡"],
				["DOTA_UNIT_TARGET_FLAG_FOW_VISIBLE", "*暂无说明*"],
				["DOTA_UNIT_TARGET_FLAG_INVULNERABLE", "无敌"],
				["DOTA_UNIT_TARGET_FLAG_MAGIC_IMMUNE_ENEMIES", "魔法免疫的敌人"],
				["DOTA_UNIT_TARGET_FLAG_MANA_ONLY", "*暂无说明*"],
				["DOTA_UNIT_TARGET_FLAG_MELEE_ONLY", "*暂无说明*"],
				["DOTA_UNIT_TARGET_FLAG_NO_INVIS", "不是隐形的"],
				["DOTA_UNIT_TARGET_FLAG_NONE", "无"],
				["DOTA_UNIT_TARGET_FLAG_NOT_ANCIENTS", "不是远古"],
				["DOTA_UNIT_TARGET_FLAG_NOT_ATTACK_IMMUNE", "不是攻击免疫"],
				["DOTA_UNIT_TARGET_FLAG_NOT_CREEP_HERO", "不是野怪"],
				["DOTA_UNIT_TARGET_FLAG_NOT_DOMINATED", "不可控制的"],
				["DOTA_UNIT_TARGET_FLAG_NOT_ILLUSIONS", "不是幻象"],
				["DOTA_UNIT_TARGET_FLAG_NOT_MAGIC_IMMUNE_ALLIES", "不是魔法免疫的盟友"],
				["DOTA_UNIT_TARGET_FLAG_NOT_NIGHTMARED", "非被催眠的"],
				["DOTA_UNIT_TARGET_FLAG_NOT_SUMMONED", "非召唤的"],
				["DOTA_UNIT_TARGET_FLAG_OUT_OF_WORLD", "被放逐出世界的"],
				["DOTA_UNIT_TARGET_FLAG_PLAYER_CONTROLLED", "玩家控制的"],
				["DOTA_UNIT_TARGET_FLAG_RANGED_ONLY", "范围唯一的"],
			]
		},
		HasFrontalCone: {type: "boolean"},
	};

	$.each(Operation.OperationAttrMap, function(key, opAttr) {
		opAttr.attr = key;
	});
	return Operation;
});