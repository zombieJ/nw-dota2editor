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
		["RunScript", true, ["Target", "ScriptFile", "Function", "CustomizeKV"]],
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

	return Operation;
});