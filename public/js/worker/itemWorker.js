onmessage = function(event) {
	var _json = JSON.parse(event.data);
	_json = _json.items_game.items;
	var _list = [];

	for(var key in _json) {
		var value = _json[key];
		_list[key] = {
			name: value.name,
			image_inventory: value.image_inventory,
		};
	};

	postMessage({
		list: _list,
	});
};