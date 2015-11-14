'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Operation", function(Sound) {
	var Operation = function() {
		var _my = this;

		_my.name = "";
		_my.attrs = {};

		return _my;
	};

	Operation.prototype.getPrecache = function() {
		if(this.name === "AttachEffect" || this.name === "FireEffect" || this.name === "TrackingProjectile" || this.name === "LinearProjectile") {
			return this.attrs["EffectName"] ? ["particle", this.attrs["EffectName"]] : null;
		} else if(this.name === "FireSound") {
			return this.attrs["EffectName"] ? ["soundfile", Sound.revertMap[this.attrs["EffectName"]]] : null;
		}
		// TODO: Model
	};

	Operation.prototype.getEventOperation = function() {
		return common.array.find(this.name, Operation.EventOperation, "0");
	};

	Operation.prototype.getAttr = function(attr) {
		var _eventOperation = this.getEventOperation();
		if($.inArray(attr, _eventOperation[3]) !== -1) {
			return this.attrs[attr];
		}
		return null;
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Operation.parse = function(kvUnit, lvl) {
		_LOG("KV", lvl + 1, "└ 操作：", kvUnit.key, kvUnit);

		var _operation = new Operation();

		var _attr = common.array.find(kvUnit.key, Operation.EventItemOperation, "0", false, false);

		if(_attr) {
			kvUnit.key = _attr[0];
			_operation.name = kvUnit.key;

			// 属性
			$.each(kvUnit.value, function (i, unit) {
				var _meta = Operation.EventOperationMap[unit.key];

				if (_meta && (_meta.type === "text" || _meta.type === "single")) {
					// 文本
					_operation.attrs[unit.key] = unit.value;
				} else if (_meta && _meta.type === "bool") {
					// 布尔值
					_operation.attrs[unit.key] = unit.value === "1" || unit.value === "MODIFIER_STATE_VALUE_ENABLED";
				} else if (_meta && _meta.type === "operation") {
					// 操作
					_operation.attrs[unit.key] = $.map(unit.value, function (_opUnit) {
						return Operation.parse(_opUnit, lvl + 1);
					});
				} else if (_meta && _meta.type === "blob") {
					// Blob块
					_operation.attrs[unit.key] = unit.kvToString();
				} else if (_meta && _meta.type === "unitGroup") {
					// 单位选择组
					_operation.attrs[unit.key] = {};
					if (typeof unit.value === "string") {
						// 如果是单个目标
						_operation.attrs[unit.key].target = unit.value;
					} else {
						// 如果是单位组
						_operation.attrs[unit.key].target = "[Group Units]";
						$.each(unit.value, function (i, _tgtUnit) {
							// 遍历属性赋值
							var _tmplUnit = common.array.find(_tgtUnit.key, Operation.UnitGroupColumns, "0");

							// Code Specific: Target Group
							_operation.attrs[unit.key]._action = "radius";
							if (_tmplUnit) {
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
							} else if(_tgtUnit.key.toUpperCase() === "LINE") {
								// Code Specific: Target Group
								_operation.attrs[unit.key]._action = "line";
								var _lineMap = _tgtUnit.value.kvToMap();
								_operation.attrs[unit.key][_tgtUnit.key] = {
									Length: _lineMap.Length,
									Thickness: _lineMap.Thickness,
								};
							} else {
								_WARN("KV", lvl + 2, "Operation Unit Group not match:", _tgtUnit.key, _tgtUnit.value);
							}
						});
					}
				} else {
					// Hack: Operation
					if(_operation.name === "RunScript") {
						if(_operation.attrs.CustomizeKV) {
							_operation.attrs.CustomizeKV += '\n"' + unit.key + '"	"' + unit.value + '"';
						} else {
							_operation.attrs.CustomizeKV = '"' + unit.key + '"	"' + unit.value + '"';
						}
					} else {
						_WARN("KV", lvl + 2, "Operation Object not match:", unit.key, unit.value);
					}
				}
			});
		} else {
			_WARN("KV", lvl + 1, "Unmatched Operation key:", kvUnit.key);
		}

		return _operation;
	};

	// ================================================
	// =                    格式化                    =
	// ================================================
	Operation.prototype.doWriter = function(writer) {
		// 名称
		writer.write('"$1"', this.name);
		writer.write('{');

		// 操作属性
		$.each(this.attrs, function(key, value) {
			var _meta = Operation.EventOperationMap[key];
			if(!_meta) {
				_WARN("SAVE", 0, "Operation meta not exist:", key, value);
			} else {
				switch (_meta.type) {
					case "text":
					case "single":
						break;
					case "bool":
						value = value ? "1" : "0";
						break;
					case "unitGroup":
						// 单位组
						if(value.target !== "[Group Units]") {
							// 单个单位
							value = value.target;
						} else {
							writer.write('"$1"', key);
							writer.write('{');
							// 一组单位：覆盖写法
							$.each(value, function(_key, _value) {
								if(_key === "target" || _key.match(/^_/)) return;

								// Code Specific: Target Group
								if(_key === "Radius") {
									if(value._action === "radius") {
										writer.write('"$1"		"$2"', _key, _value);
									}
								} else if(_key === "Line") {
									if(value._action === "line") {
										writer.write('"Line"');
										writer.write("{");
										writer.write('"Length"		"$1"', _value.Length);
										writer.write('"Thickness"		"$1"', _value.Thickness);
										writer.write("}");
									}
								} else {
									writer.write('"$1"		"$2"', _key, typeof _value === "object" ? common.map.join(_value, " | ") : _value);
								}
							});
							writer.write('}');
							return;
						}
						break;
					case "group":
						value = common.map.join(value, " | ");
						break;
					case "blob":
						if(_meta.append) {
							writer.write(value);
						} else {
							writer.write('"$1"', key);
							writer.write('{');
							writer.write(value);
							writer.write('}');
						}
						return;
					case "operation":
						writer.write('"$1"', key);
						writer.write('{');
						if(value) {
							$.each(value, function (i, _subOpeartion) {
								if (i !== 0) writer.write('');

								_subOpeartion.doWriter(writer);
							});
						}
						writer.write('}');
						return;
					default :
						_WARN("SAVE", 0, "Can't match Operation meta:", _meta, key, value);
						break;
				}
			}

			if(value && value !== "-") {
				writer.write('"$1"			"$2"', key, value);
			}
		});

		writer.write('}');
	};

	Operation.EventOperation = [
		["ApplyModifier", "添加修饰器", true, ["Target", "ModifierName"]],
		["RemoveModifier", "移除修饰器", true, ["Target", "ModifierName"]],
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
		["CleaveAttack", "分裂攻击", false, ["CleavePercent", "CleaveRadius"]],
		["CreateThinker", "创建计时器", false, ["Target", "ModifierName"]],
		["LinearProjectile", "线性投射物", false, ["Target","EffectName","MoveSpeed","StartRadius","EndRadius","FixedDistance","StartPosition",
													"TargetTeams","TargetTypes","TargetFlags","HasFrontalCone","ProvidesVision","VisionRadius"]],
		];

	Operation.EventItemOperation = [
		["SpendCharge", "消耗物品", true, []],
	].concat(Operation.EventOperation);

	// ==========================================================
	// =                       Auto Match                       =
	// ==========================================================
	var _match_EffectName = function(operation) {
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

	Operation.EventOperationMap = {
		Target: {type: "unitGroup", value: ["","CASTER","TARGET","POINT","ATTACKER","UNIT", "[Group Units]"]},
		AbilityName: {type: "text"},
		ModifierName: {type: "text", match: function(operation, ability) {
			_match_ModifierName.ability = ability;
			return _match_ModifierName;
		}, link: function(value, operation, ability) {
			var _modifier = common.array.find(value, ability._modifierList, "_name");
			if(_modifier) {
				_link_ModifierName.modifier = _modifier;
				return _link_ModifierName;
			}
			return null;
		}},
		EffectName: {type: "text", match: _match_EffectName},
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
		CustomizeKV: {type: "blob", append: true},
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
		CleavePercent: {type: "text"},
		CleaveRadius: {type: "text"},
		StartRadius: {type: "text"},
		EndRadius: {type: "text"},
		FixedDistance: {type: "text"},
		StartPosition: {type: "text"},// TODO: hitloc? attach_attack1? attach_origin?
		TargetTeams: {type: "single", value: ["DOTA_UNIT_TARGET_TEAM_BOTH","DOTA_UNIT_TARGET_TEAM_ENEMY","DOTA_UNIT_TARGET_TEAM_FRIENDLY","DOTA_UNIT_TARGET_TEAM_CUSTOM","DOTA_UNIT_TARGET_TEAM_NONE"]},
		TargetTypes: {type: "group", value: [
			["DOTA_UNIT_TARGET_HERO","英雄", true],
			["DOTA_UNIT_TARGET_BASIC","基本", true],
			["DOTA_UNIT_TARGET_ALL","所有"],
			["DOTA_UNIT_TARGET_BUILDING","建筑"],
			["DOTA_UNIT_TARGET_COURIER","信使"],
			["DOTA_UNIT_TARGET_CREEP","野怪"],
			["DOTA_UNIT_TARGET_CUSTOM","普通"],
			["DOTA_UNIT_TARGET_MECHANICAL","机械"],
			["DOTA_UNIT_TARGET_NONE","无"],
			["DOTA_UNIT_TARGET_OTHER","其他"],
			["DOTA_UNIT_TARGET_TREE","树木"],
		]},
		TargetFlags: {type: "group", value: [
			["DOTA_UNIT_TARGET_FLAG_CHECK_DISABLE_HELP","检测玩家'禁用帮助'选项"],
			["DOTA_UNIT_TARGET_FLAG_DEAD","已死亡"],
			["DOTA_UNIT_TARGET_FLAG_FOW_VISIBLE","*暂无说明*"],
			["DOTA_UNIT_TARGET_FLAG_INVULNERABLE","无敌"],
			["DOTA_UNIT_TARGET_FLAG_MAGIC_IMMUNE_ENEMIES","魔法免疫的敌人"],
			["DOTA_UNIT_TARGET_FLAG_MANA_ONLY","*暂无说明*"],
			["DOTA_UNIT_TARGET_FLAG_MELEE_ONLY","*暂无说明*"],
			["DOTA_UNIT_TARGET_FLAG_NO_INVIS","不是隐形的"],
			["DOTA_UNIT_TARGET_FLAG_NONE","无"],
			["DOTA_UNIT_TARGET_FLAG_NOT_ANCIENTS","不是远古"],
			["DOTA_UNIT_TARGET_FLAG_NOT_ATTACK_IMMUNE","不是攻击免疫"],
			["DOTA_UNIT_TARGET_FLAG_NOT_CREEP_HERO","不是野怪"],
			["DOTA_UNIT_TARGET_FLAG_NOT_DOMINATED","不可控制的"],
			["DOTA_UNIT_TARGET_FLAG_NOT_ILLUSIONS","不是幻象"],
			["DOTA_UNIT_TARGET_FLAG_NOT_MAGIC_IMMUNE_ALLIES","不是魔法免疫的盟友"],
			["DOTA_UNIT_TARGET_FLAG_NOT_NIGHTMARED","非被催眠的"],
			["DOTA_UNIT_TARGET_FLAG_NOT_SUMMONED","非召唤的"],
			["DOTA_UNIT_TARGET_FLAG_OUT_OF_WORLD","被放逐出世界的"],
			["DOTA_UNIT_TARGET_FLAG_PLAYER_CONTROLLED","玩家控制的"],
			["DOTA_UNIT_TARGET_FLAG_RANGED_ONLY","范围唯一的"],
		]},
		HasFrontalCone:{type: "bool"},
	};

	Operation.UnitGroupColumns = [
		["Types", "", [], "group"],
		["Teams", "", [], "single"],
		["Flags", "", [], "group"],
		["Center", "", [], "single"],
		["Radius", "", [], "text"],
	];

	return Operation;
});