'use strict';

// =======================================================
// =                        Event                        =
// =======================================================
app.factory("Event", function() {
	var Event = function() {};

	// ================================================
	// =                  Event List                  =
	// ================================================
	Event.EventList = [
		"OnSpellStart",

		"OnAbilityStart",
		"OnAbilityExecuted",
		"OnAbilityEndChannel",
		"OnAbilityPhaseStart",

		"OnAttack",
		"OnAttacked",
		"OnAttackAllied",
		"OnAttackFailed",
		"OnChannelFinish",
		"OnChannelInterrupted",
		"OnChannelSucceeded",
		"OnEquip",
		"OnUnequip",
		"OnHealReceived",
		"OnHealthGained",
		"OnHeroKilled",
		"OnKill",
		"OnManaGained",
		"OnOrder",
		"OnOwnerDied",
		"OnOwnerSpawned",
		"OnProjectileDodge",
		"OnProjectileFinish",
		"OnProjectileHitUnit",
		"OnRespawn",
		"OnSpentMana",
		"OnStateChanged",
		"OnTeleported",
		"OnTeleporting",
		"OnToggleOff",
		"OnToggleOn",
		"OnUnitMoved",
		"OnUpgrade",
	];

	Event.ModifierEventList = [
		"OnCreated",
		"OnDestroy",
		"OnIntervalThink",

		"OnAttackLanded",
		"OnAttackStart",
		"OnDealDamage",
		"OnDeath",
		"OnOrbFire",
		"OnOrbImpact",
		"OnTakeDamage",
		"Orb",
	].concat(Event.EventList);

	return Event;
});