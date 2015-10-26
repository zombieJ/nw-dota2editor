'use strict';

// ======================================================
// =                        键值                        =
// ======================================================
app.factory("KV", function() {
	var _KV = function(list) {
		var _lines = typeof list === "string" ? list.split(/\n/) : list;

		this.title = null;
		this.comment = "";

		for(var _lineNum = 0 ; _lineNum < _lines.length ; _lineNum += 1) {
			var _line = (_lines[_lineNum] || "").trim();

			var _content = "";
			var _comment = "";

			var _commentPos = _line.indexOf("//");
			_content = _commentPos != -1 ? _line.slice(0, _commentPos) : _line;
			_comment = _commentPos != -1 ? _line.slice(_commentPos + 2) : "";
			//console.log(_line, "|"+_content, "|"+_comment);

			// 如果标题尚未匹配
			if(this.title === null) {
				this.comment += _comment;
				var _match = _content.match(/"(.*)"/);
				if(_match) {
					this.title = _match[1];
					break;
				}
			}
		}

		return this;
	};
	return _KV;
});