'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Sound", function(NODE, FS) {
	var Sound = function() {
	};

	Sound.init = function() {
		if(Sound.map) return;

		Sound.map = {};
		Sound.revertMap = {};

		if(!FS) return;

		FS.readFile("res/sounds.json", "utf8", function (err, data) {
			if(err) {
				$.dialog({
					title: "OPS!",
					content: "Can't load sound mapping resource. 【无法加载声音资源文件】",
				});
			} else {
				var _worker = new Worker("public/js/worker/soundWorker.js");
				_worker.onmessage = function(event) {
					Sound.map = event.data.map;
					Sound.revertMap = event.data.revertMap;
				};
				_worker.postMessage(data);
			}
		});
	};

	Sound.match = function(match) {
		match = (match || "").trim().toUpperCase();
		if(!match) return [];

		var _matchList = [];
		var _maxMatch = 10;
		$.each(Sound.map, function(key, value) {
			if (key.toUpperCase().indexOf(match) !== -1) {
				// Find in key
				$.each(value, function(i, val) {
					_maxMatch -= 1;
					_matchList.push([val]);
				});
			} else {
				// Find in value
				$.each(value, function(i, val) {
					if (val.toUpperCase().indexOf(match) !== -1) {
						_maxMatch -= 1;
						_matchList.push({
							value: val
						});
					}
				});
			}

			if(_maxMatch < 0) return false;
		});

		return _matchList;
	};

	return Sound;
});