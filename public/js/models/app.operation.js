'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Operation", function(KV, Sound, AppFileSrv) {
	var Operation = function(kvUnit) {
		return new Op(kvUnit);
	};

	var Op = function(kvUnit) {
		var _my = this;
		_my.kv = kvUnit;

		return _my;
	};

	// ===============================================
	// =                PreCache List                =
	// ===============================================
	Op.prototype.getKVPrecacheList = function() {
		var _kv = this.kv;
		if((_kv.key + "").trim() === "") return null;

		if($.inArray(_kv.key, ["AttachEffect","FireEffect","TrackingProjectile","LinearProjectile"]) !== -1) {
			return _kv.get("EffectName") ? [new KV("particle", _kv.get("EffectName"))] : null;
		} else if(_kv.key === "CleaveAttack") {
			return _kv.get("CleaveEffect") ? [new KV("particle", _kv.get("CleaveEffect"))] : null;
		} else if(_kv.key === "FireSound") {
			return _kv.get("EffectName") ? [new KV("soundfile", Sound._nameMap[_kv.get("EffectName")])] : null;
		} else {
			var _operation = common.array.find(_kv.key, Operation.EventItemOperation, "0", false, false);
			if(_operation) {
				var _list = $.map(_operation[2], function(optAttr) {
					if(Operation.OperationAttrMap[optAttr].type !== "operation") return;
					return $.map(_kv.get(optAttr) || [], function(_operation) {
						return Operation(_operation).getKVPrecacheList();
					});
				});
				return _list;
			} else {
				_WARN("Operation", 0, "Precache Operation not find:", _kv.key);
			}
		}
		// TODO: Model
	};

	// ===============================================
	// =                Save Process                 =
	// ===============================================
	Op.prototype.saveProcess = function() {
		var _oriValue = this.kv.value;
		if($.isArray(_oriValue)) {
			this.kv.value = $.grep(_oriValue, function(attrKV) {
				return !attrKV.isList() || attrKV.value.length;
			});
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
		["ApplyMotionController", false, ["Target","ScriptFile","HorizontalControlFunction","VerticalControlFunction","Duration"]]
	];

	Operation.EventItemOperation = [
		["SpendCharge", true, []]
	].concat(Operation.EventOperation);

	Operation.EventOperationMap = {};
	$.each(Operation.EventItemOperation, function(i, item) {
		Operation.EventOperationMap[item[0]] = item;
	});

	// Parse operation list for operation select usage
	Operation.OperationList = $.map(Operation.EventOperation, function(operation) {
		return {value: operation[0]};
	});
	Operation.OperationItemList = $.map(Operation.EventItemOperation, function(operation) {
		return {value: operation[0]};
	});

	// ===============================================
	// =               Operation Attr                =
	// ===============================================
	// Effect Name
	var _match_EffectName = function(operation) {
		if(!operation) return null;
		return operation.key === "FireSound" ? Sound.match : null;
	};

	// Modifier Name
	var _match_ModifierName = function(match) {
		match = (match || "").toUpperCase();
		var _list = $.map(_match_ModifierName.ability.getModifierList(), function(modifierKV) {
			if((modifierKV.key || "").toUpperCase().indexOf(match) !== -1) return {value: modifierKV.key};
		});
		return _list;
	};

	var _link_ModifierName = function() {
		var $scope = angular.element("#listCntr").scope();
		$scope.currentTab = "modifiers";
		$scope.currentModifier = _link_ModifierName.modifier;
	};

	// Ability Special
	var _match_AbilitySpecial = function(operation, ability) {
		_match_AbilitySpecial.ability = ability;
		return _match_AbilitySpecialFunc;
	};
	var _match_AbilitySpecialFunc = function(match) {
		match = (match || "").toUpperCase();
		if(!match.match(/^%/) || !_match_AbilitySpecial.ability) return [];

		match = match.slice(1);
		var _list =  $.map(_match_AbilitySpecial.ability.getSpecialList(), function(kv) {
			if((kv.value[1].key || "").toUpperCase().indexOf(match) !== -1) {
				return {value: "%" + kv.value[1].key};
			}
		});
		return _list;
	};

	// Script file
	var _match_ScriptFile = function(match) {
		match = (match || "").toUpperCase();
		return $.map(AppFileSrv.fileMatchList, function(item) {
			return (item.value || "").toUpperCase().indexOf(match) !== -1 ? item : null;
		});
	};

	// Function
	var _match_Function_Entity = function(operation) {
		this.matchFunc = function(match) {
			match = (match || "").toUpperCase();
			var _path = operation.get("ScriptFile");

			return $.map(AppFileSrv.prepareFuncMatchList(_path), function(funcName) {
				return (funcName.value || "").toUpperCase().indexOf(match) !== -1 ? funcName : null;
			});
		};
		return this;
	};

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
			value: [["attach_hitloc"], ["follow_origin"], ["follow_overhead"], ["start_at_customorigin"], ["world_origin"], ["follow_chest"], ["follow_head"]]
		},
		ControlPoints: {type: "tree"},
		ControlPointEntities: {type: "tree"},
		Type: {type: "single", value: [["DAMAGE_TYPE_MAGICAL"], ["DAMAGE_TYPE_PHYSICAL"], ["DAMAGE_TYPE_PURE"]]},
		MinDamage: {type: "text", match: _match_AbilitySpecial},
		MaxDamage: {type: "text", match: _match_AbilitySpecial},
		Damage: {type: "text", match: _match_AbilitySpecial},
		CurrentHealthPercentBasedDamage: {type: "text", match: _match_AbilitySpecial},
		MaxHealthPercentBasedDamage: {type: "text", match: _match_AbilitySpecial},
		Radius: {type: "text", match: _match_AbilitySpecial},
		HealAmount: {type: "text", match: _match_AbilitySpecial},
		Center: {type: "single", value: [["CASTER"], ["TARGET"], ["POINT"], ["ATTACKER"], ["UNIT"], ["PROJECTILE"]]},
		Duration: {type: "text", match: _match_AbilitySpecial},
		Delay: {type: "text", match: _match_AbilitySpecial},
		Distance: {type: "text", match: _match_AbilitySpecial},
		Height: {type: "text", match: _match_AbilitySpecial},
		IsFixedDistance: {type: "boolean"},
		ShouldStun: {type: "boolean"},
		ScriptFile: {type: "text", match: function() {return _match_ScriptFile;}},
		Function: {type: "text", match: function(operation, ability) {
			operation._match_function_entity = operation._match_function_entity || new _match_Function_Entity(operation);
			return operation._match_function_entity.matchFunc;
		}},
		UnitName: {type: "text"},
		UnitCount: {type: "text", match: _match_AbilitySpecial},
		UnitLimit: {type: "text", match: _match_AbilitySpecial},
		SpawnRadius: {type: "text", match: _match_AbilitySpecial},
		GrantsGold: {type: "text", match: _match_AbilitySpecial},
		GrantsXP: {type: "text", match: _match_AbilitySpecial},
		Dodgeable: {type: "boolean"},
		ProvidesVision: {type: "boolean"},
		VisionRadius: {type: "text", match: _match_AbilitySpecial},
		MoveSpeed: {type: "text", match: _match_AbilitySpecial},
		SourceAttachment: {type: "text"},// TODO: hitloc?
		Chance: {type: "text", match: _match_AbilitySpecial},
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
			["DOTA_PSEUDO_RANDOM_TROLL_BASH"]
		]},
		OnSuccess: {type: "operation"},
		OnFailure: {type: "operation"},
		Action: {type: "operation"},
		OnSpawn: {type: "operation"},
		CleavePercent: {type: "text", match: _match_AbilitySpecial},
		CleaveRadius: {type: "text", match: _match_AbilitySpecial},
		StartRadius: {type: "text", match: _match_AbilitySpecial},
		CleaveEffect: {type: "text"},
		LifestealPercent: {type: "text", match: _match_AbilitySpecial},
		EndRadius: {type: "text", match: _match_AbilitySpecial},
		FixedDistance: {type: "text", match: _match_AbilitySpecial},
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
				["DOTA_UNIT_TARGET_TREE", "树木"]
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
				["DOTA_UNIT_TARGET_FLAG_PREFER_ENEMIES", "更倾向敌人"]
			]
		},
		HasFrontalCone: {type: "boolean"},
		HorizontalControlFunction: {type: "text"},
		VerticalControlFunction: {type: "text"},
		DeleteOnHit: {type: "boolean"},
	};

	$.each(Operation.OperationAttrMap, function(key, opAttr) {
		opAttr.attr = key;
	});
	return Operation;
});