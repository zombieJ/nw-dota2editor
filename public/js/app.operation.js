'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Operation", function() {
	var Operation = function() {
		var _my = this;

		_my.name = "";
		_my.attrs = {};

		return _my;
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Operation.parse = function(kvUnit, lvl) {
		_LOG("KV", lvl + 1, "└ 操作：", kvUnit.value.title, kvUnit);

		var _operation = new Operation();
		_operation.name = kvUnit.key;

		// 属性
		$.each(kvUnit.value.kvList, function(i, unit) {
			var _meta = Operation.EventOperationMap[unit.key];

			if(_meta && (_meta.type === "text" || _meta.type === "single")) {
				// 文本
				_operation.attrs[unit.key] = unit.value;
			} else if(_meta && _meta.type === "bool") {
				// 布尔值
				_operation.attrs[unit.key] = unit.value === "1" || unit.value === "MODIFIER_STATE_VALUE_ENABLED";
			} else if(_meta && _meta.type === "operation") {
				// 操作
				_operation.attrs[unit.key] = $.map(unit.value.kvList, function (_opUnit) {
					return Operation.parse(_opUnit, lvl + 1);
				});
			} else if(_meta && _meta.type === "blob") {
				// Blob块
				_operation.attrs[unit.key] = unit.value.kvToString();
			} else if(_meta && _meta.type === "unitGroup") {
				// 单位选择组
				_operation.attrs[unit.key] = {};
				if(typeof unit.value === "string") {
					// 如果是单个目标
					_operation.attrs[unit.key].target = unit.value;
				} else {
					// 如果是单位组
					_operation.attrs[unit.key].target = "[Group Units]";
					$.each(unit.value.kvList, function(i, _tgtUnit) {
						// 遍历属性赋值
						var _tmplUnit = common.array.find(_tgtUnit.key, Operation.UnitGroupColumns, "0");

						if(_tmplUnit) {
							switch (_tmplUnit[3]) {
								case "text":
								case "single":
									_operation.attrs[unit.key][_tgtUnit.key] = _tgtUnit.value;
									break;
								case "group":
									_operation.attrs[unit.key][_tgtUnit.key] = {};
									$.each(_tgtUnit.value.split("|"), function (i, _value) {
										_value = _value.trim();
										_operation.attrs[unit.key][_tgtUnit.key][_value] = true;
									});
									break;
								default:
									_WARN("KV", lvl + 2, "Operation Unit Group Type not match:", _tmplUnit[3], _tgtUnit.key, _tgtUnit.value);
							}
						} else {
							_WARN("KV", lvl + 2, "Operation Unit Group not match:", _tgtUnit.key, _tgtUnit.value);
						}
					});
				}
			} else {
				_WARN("KV", lvl + 2, "Operation Object not match:", unit.key, unit.value);
			}
		});

		return _operation;
	};

	Operation.EventOperation = [
		["ApplyModifier", "添加修饰器", true, ["Target", "ModifierName"]],
		["AttachEffect", "添加特效", true, ["EffectName","EffectAttachType","Target","ControlPoints", "ControlPointEntities"]],
		["FireEffect", "触发特效", true, ["EffectName", "EffectAttachType", "Target", "ControlPoints", "ControlPointEntities"]],
		["Damage", "伤害", true, ["Target", "Type","Damage", "MinDamage", "MaxDamage", "CurrentHealthPercentBasedDamage", "MaxHealthPercentBasedDamage"]],
		["Heal","治疗",true,["HealAmount","Target"]],
		["FireSound", "触发声音",true,["EffectName", "Target"]],
		["RunScript","执行脚本", true, ["Target", "ScriptFile", "Function", "CustomizeKV"]],
		["Stun","击晕",true, ["Target", "Duration"]],
		["TrackingProjectile","跟踪投射物", true, ["Target", "EffectName", "Dodgeable", "ProvidesVision", "VisionRadius", "MoveSpeed", "SourceAttachment"]],
		["Random", "随机", true,["Chance", "PseudoRandom", "OnSuccess", "OnFailure"]],

		["SpawnUnit","召唤单位", false, ["UnitName", "UnitCount", "Target", "UnitLimit", "SpawnRadius", "Duration", "GrantsGold", "GrantsXP", "OnSpawn"]],
		["ActOnTargets", "让目标行动", false, ["Target", "Action"]],
		["LevelUpAbility","技能升级",false,["Target", "AbilityName"]],
		["Knockback","击退",false,["Target","Center", "Duration", "Distance", "Height", "IsFixedDistance", "ShouldStun"]],
		["AddAbility","添加技能",false,["Target","AbilityName"]],
		["RemoveAbility","删除技能",false,["Target","AbilityName"]],
		["Blink", "闪烁", false, ["Target"]],
		["DestroyTrees","摧毁树木", false, ["Target","Radius"]],
		["DelayedAction", "延迟动作", false, ["Delay", "Action"]],
		["Lifesteal", "生命偷取", false, ["Target", "LifestealPercent"]],
		/*
		["CleaveAttack
		CleavePercent, CleaveRadius
		["CreateThinker
		Target, ModifierName

		["LinearProjectile
		Target, EffectName, MoveSpeed, StartRadius, EndRadius, FixedDistance, StartPosition, TargetTeams, TargetTypes, TargetFlags, HasFrontalCone, ProvidesVision, VisionRadius
		*/
	];

	Operation.EventOperationMap = {
		Target: {type: "unitGroup", value: ["","CASTER","TARGET","POINT","ATTACKER","UNIT", "[Group Units]"]},
		AbilityName: {type: "text"},
		ModifierName: {type: "text"},
		EffectName: {type: "text"},
		EffectAttachType: {type: "single", value: ["follow_origin", "follow_overhead", "start_at_customorigin", "world_origin"]},
		ControlPoints: {type: "blob"},
		ControlPointEntities: {type: "blob"},
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
		Delay: {type: "text"},
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
		Action: {type: "operation"},
		OnSpawn: {type: "operation"},
	};

	Operation.UnitGroupColumns = [
		["Types", "", [], "group"],
		["Teams", "", [], "group"],
		["Flags", "", [], "group"],
		["Center", "", [], "single"],
		["Radius", "", [], "text"],
	];

	return Operation;
});