'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Modifier", function(Event) {
	var Modifier = function(kvUnit) {
		if(!kvUnit._entity) {
			kvUnit._entity = new Mdf(kvUnit);
		}
		return kvUnit._entity;
	};

	var Mdf = function(kvUnit) {
		var _my = this;
		_my.kv = kvUnit;

		// Event List
		_my._eventList = [];

		return _my;
	};

	// Get Events
	Mdf.prototype.getEventList = function() {
		var _my = _this;
		_my._eventList.splice(0);
		$.each(_my.kv.value, function(i, kv) {
			if(common.array.find(kv.key, Event.ModifierEventList, "", false, false)) {
				_my._eventList.push(kv);
			}
		});
		return _my._eventList;
	};

	// ================================================
	// =                  Attr List                   =
	// ================================================
	Modifier.AttrList = [
		[
			{group: "common", attr: "Attributes", type: "group"},
			{group: "common", attr: "Duration", type: "text"},
			{group: "common", attr: "Passive", type: "boolean"},
			{group: "common", attr: "TextureName", type: "text"},
		],
		[
			{group: "state", attr: "IsBuff", type: "boolean"},
			{group: "state", attr: "IsDebuff", type: "boolean"},
			{group: "state", attr: "IsHidden", type: "boolean"},
			{group: "state", attr: "IsPurgable", type: "boolean"},
		],
	];

	return Modifier;
});