'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Operation", function() {
	var _operation = function() {
		var _my = this;

		_my.name = "";
		_my.attrs = {};

		return _my;
	};

	_operation.EventOperation = [
		["ApplyModifier", "添加修饰器", true, ["Target", "ModifierName"]],
		["AttachEffect", "添加特效", true, ["EffectName","EffectAttachType","Target","ControlPoints"]],
		["FireEffect", "触发特效", true, ["EffectName", "EffectAttachType", "Target", "ControlPoints"]],
		["Damage", "伤害", true, ["Target", "Type","Damage", "MinDamage", "MaxDamage", "CurrentHealthPercentBasedDamage", "MaxHealthPercentBasedDamage"]],
		["Heal","治疗",true,["HealAmount","Target"]],
		["FireSound", "触发声音",true,["EffectName", "Target"]],
		["RunScript","执行脚本", true, ["Target", "ScriptFile", "Function", "CustomizeKV"]],
		["Stun","击晕",true, ["Target", "Duration"]],
		["TrackingProjectile","跟踪投射物", true, ["Target", "EffectName", "Dodgeable", "ProvidesVision", "VisionRadius", "MoveSpeed", "SourceAttachment"]],
		["Random", "随机", true,["Chance", "PseudoRandom", "OnSuccess", "OnFailure"]],

		["SpawnUnit","召唤单位", false, ["UnitName", "UnitCount", "Target", "UnitLimit", "SpawnRadius", "Duration", "GrantsGold", "GrantsXP"]],
		["LevelUpAbility","技能升级",false,["Target", "AbilityName"]],
		["Knockback","击退",false,["Target","Center", "Duration", "Distance", "Height", "IsFixedDistance", "ShouldStun"]],
		["AddAbility","添加技能",false,["Target","AbilityName"]],
		["RemoveAbility","删除技能",false,["Target","AbilityName"]],
		["Blink", "闪烁", false, ["Target"]],
		["DestroyTrees","摧毁树木", false, ["Target","Radius"]],
		["Lifesteal", "生命偷取", false, ["Target", "LifestealPercent"]],
		/*
		["ActOnTargets
		Target, Action
		["CleaveAttack
		CleavePercent, CleaveRadius
		["CreateThinker
		Target, ModifierName
		["DelayedAction
		Delay, Action

		["LinearProjectile
		Target, EffectName, MoveSpeed, StartRadius, EndRadius, FixedDistance, StartPosition, TargetTeams, TargetTypes, TargetFlags, HasFrontalCone, ProvidesVision, VisionRadius
		*/
	];

	_operation.EventOperationMap = {
		Target: {type: "single", value: ["CASTER","TARGET","POINT","ATTACKER","UNIT"]},
		AbilityName: {type: "text"},
		ModifierName: {type: "text"},
		EffectName: {type: "text"},
		EffectAttachType: {type: "single", value: ["follow_origin", "follow_overhead", "start_at_customorigin", "world_origin"]},
		ControlPoints: {type: "blob"},
		Type: {type: "single", value: ["DAMAGE_TYPE_MAGICAL","DAMAGE_TYPE_PHYSICAL","DAMAGE_TYPE_PURE"]},
		MinDamage: {type: "text"},
		MaxDamage: {type: "text"},
		Damage: {type: "text"},
		CurrentHealthPercentBasedDamage: {type: "text"},
		MaxHealthPercentBasedDamage: {type: "text"},
		Radius: {type: "text"},
		HealAmount: {type: "text"},
		Center: {type: "single", value: ["CASTER","TARGET","POINT","ATTACKER","UNIT", "PROJECTILE"]},
		Duration: {type: "text"},
		Distance: {type: "text"},
		Height: {type: "text"},
		IsFixedDistance: {type: "bool"},
		ShouldStun: {type: "bool"},
		ScriptFile: {type: "text"},
		Function: {type: "text"},
		CustomizeKV: {type: "blob"},
		UnitName: {type: "text"},
		UnitCount: {type: "text"},
		UnitLimit: {type: "text"},
		SpawnRadius: {type: "text"},
		GrantsGold: {type: "text"},
		GrantsXP: {type: "text"},
		Dodgeable: {type: "bool"},
		ProvidesVision: {type: "bool"},
		VisionRadius: {type: "text"},
		MoveSpeed: {type: "text"},
		SourceAttachment: {type: "text"},// TODO: hitloc?
		Chance: {type: "text"},
		PseudoRandom: {type: "bool"},
		OnSuccess: {type: "operation"},
		OnFailure: {type: "operation"},
	};

	return _operation;
});