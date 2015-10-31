'use strict';

// ======================================================
// =                        事件                        =
// ======================================================
app.factory("Event", function(Operation) {
	var Event = function() {
		var _my = this;

		_my._name = "OnSpellStart";
		_my._comment = "";

		_my._operationList = [new Operation()];

		return _my;
	};

	Event.prototype.getPrecacheList = function() {
		var _list = [];

		$.each(this._operationList, function(i, operation) {
			var _effect = operation.getPrecache();
			if(_effect) _list.push(_effect);
		});

		return _list;
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Event.parse = function(kvUnit, lvl) {
		_LOG("KV", lvl, "└ 事件：", kvUnit.value.title, kvUnit);

		var _event = new Event();
		_event._name = kvUnit.value.title;
		_event._comment = kvUnit.value.comment;
		_event._operationList = [];

		$.each(kvUnit.value.kvList, function (i, unit) {
			_event._operationList.push(Operation.parse(unit, lvl + 1));
		});

		return _event;
	};

	// ================================================
	// =                    格式化                    =
	// ================================================
	Event.prototype.doWriter = function(writer) {
		writer.writeComment(this._comment);

		// 名称
		writer.write('"$1"', this._name);
		writer.write('{');

		// 操作
		if(this._operationList.length) {
			$.each(this._operationList, function (i, operation) {
				if(i !== 0) writer.write('');

				operation.doWriter(writer);
			});
		}

		writer.write('}');
	};

	// ================================================
	// =                     属性                     =
	// ================================================
	Event.EventList = [
		["OnSpellStart","开始施法"],
		["OnAbilityEndChannel","停止施法"],
		["OnAbilityPhaseStart","开始阶段（转身之前）"],
		["OnAbilityStart","技能开始"],
		["OnAttack","攻击"],
		["OnAttackAllied","攻击队友"],
		["OnAttackFailed","攻击失败"],
		["OnChannelFinish","持续施法结束"],
		["OnChannelInterrupted","持续施法中断"],
		["OnChannelSucceeded","持续施法成功"],
		["OnCreated","创建"],
		["OnEquip","装备？"],
		["OnHealReceived","受到治疗？"],
		["OnHealthGained","获得治疗"],
		["OnHeroKilled","英雄被杀？"],
		["OnManaGained","获得魔法值"],
		["OnOrder","命令？"],
		["OnOwnerDied","拥有者死亡"],
		["OnOwnerSpawned","拥有者出生"],
		["OnProjectileDodge","投射物闪避"],
		["OnProjectileFinish","投射物结束"],
		["OnProjectileHitUnit","投射物命中"],
		["OnRespawn","重生"],
		["OnSpentMana","消耗魔法"],
		["OnStateChanged","状态改变？"],
		["OnTeleported","传送完成"],
		["OnTeleporting","传送中"],
		["OnToggleOff","开关：关"],
		["OnToggleOn","开关：开"],
		["OnUnitMoved","移动"],
		["OnUpgrade","技能升级"],
	];

	Event.ModifierEventList = [
		["OnCreated","Modifier创建"],
		["OnDestroy","Modifier移除"],
		["OnIntervalThink","定时器"],

		["OnAttack","攻击"],
		["OnAttacked","被攻击"],
		["OnAttackLanded","攻击命中"],
		["OnAttackStart","开始攻击"],
		["OnAttackFailed","攻击失败时"],
		["OnAttackAllied","攻击盟友时"],
		["OnDealDamage","施加伤害"],
		["OnDeath","死亡"],
		["OnOrbFire","法球被释放"],
		["OnOrbImpact","法球命中"],
		["OnTakeDamage","受到伤害"],
		["Orb","法球"],
		["OnProjectileDodge","闪避弹道"],
		["OnEquip","装备物品"],
		["OnOrder","执行指令"],
		["OnUnitMoved","移动"],
		["OnAbilityStart","开始技能"],
		["OnAbilityExecuted","释放技能"],
		["OnAbilityEndChannel","结束持续施法"],
		["OnStateChanged","状态改变"],
		["OnRespawn","重生"],
		["OnSpentMana","花费魔法"],
		["OnTeleporting","正在传送"],
		["OnTeleported","传送结束"],
		["OnHealthGained","获得生命值"],
		["OnManaGained","获得魔法值"],
		["OnHeroKilled","被英雄杀死"],
		["OnHealReceived","受到治疗"],
		["OnKill","杀死单位"],
	];

	return Event;
});