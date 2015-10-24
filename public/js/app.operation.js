'use strict';

// ======================================================
// =                        技能                        =
// ======================================================
app.factory("Operation", function() {
	var _operation = function() {
		var _my = this;

		_my.name = "";
		_my.attrs = {};

		return _my;
	};

	_operation.EventOperation = [
		["AddAbility","添加技能",false,["Target","AbilityName"]],
		/*["ActOnTargets
		Target, Action
		["ApplyModifier
		Target, ModifierName
		["AttachEffect
		EffectName, EffectAttachType, Target, ControlPoints,
		TargetPoint, EffectRadius, EffectDurationScale, EffectLifeDurationScale ,EffectColorA, EffectColorB, EffectAlphaScale
		["Blink
		Target
		["CleaveAttack
		CleavePercent, CleaveRadius
		["CreateThinker
		Target, ModifierName
		["Damage
		Target, Type, MinDamage/MaxDamage, Damage, CurrentHealthPercentBasedDamage, MaxHealthPercentBasedDamage
		["DelayedAction
		Delay, Action
		["DestroyTrees
		Target, Radius
		["FireEffect
		EffectName, EffectAttachType, Target, ControlPoints
		TargetPoint, EffectRadius, EffectDurationScale, EffectLifeDurationScale ,EffectColorA, EffectColorB, EffectAlphaScale
		["FireSound
		EffectName, Target
		["Heal
		HealAmount, Target
		["Knockback
		Target, Center, Duration, Distance, Height, IsFixedDistance, ShouldStun
		["LevelUpAbility
		Target, AbilityName
		["Lifesteal
		Target, LifestealPercent
		["LinearProjectile
		Target, EffectName, MoveSpeed, StartRadius, EndRadius, FixedDistance, StartPosition, TargetTeams, TargetTypes, TargetFlags, HasFrontalCone, ProvidesVision, VisionRadius
		["Random
		Chance, PseudoRandom, OnSuccess, OnFailure
		["RemoveAbility
		Target, AbilityName
		["RemoveModifier
		Target, ModifierName
		["RunScript
		Target, ScriptFile, Function
		["SpawnUnit
		UnitName, UnitCount, UnitLimit, SpawnRadius, Duration, Target, GrantsGold, GrantsXP
		["Stun
		Target, Duration
		["TrackingProjectile
		Target, EffectName, Dodgeable, ProvidesVision, VisionRadius, MoveSpeed, SourceAttachment
		*/
	];

	_operation.EventOperationMap = {
		Target: {type: "single", value: ["CASTER","TARGET","POINT","ATTACKER","UNIT"]},
		AbilityName: {type: "text"},
	};

	return _operation;
});