var MOEILLUSTRA = MOEILLUSTRA || new Object();
MOEILLUSTRA.config = {
	files: ['data/raw.json'],
	canvas: undefined,
	count: 0,
};
MOEILLUSTRA.init = function () {
	function loadJson(file) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			console.log("loaded", file);
			MOEILLUSTRA.loadIllustra(data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.error("data load error", textStatus, errorThrown);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	for (var i in MOEILLUSTRA.config.files) {
		loadJson(MOEILLUSTRA.config.files[i]);
	}
};
$(function() {
	MOEILLUSTRA.init();
});
MOEILLUSTRA.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	MOEILLUSTRA.config.canvas = canvas;
	MOEILLUSTRA.showFrame();
	MOEILLUSTRA.waitLoad();
};
MOEILLUSTRA.waitLoad = function () {
	if (0 == MOEILLUSTRA.illustra.length) {
		console.log("loading");
		setTimeout(MOEILLUSTRA.waitLoad, 300);
		return;
	}
	MOEILLUSTRA.showRandom();
};
MOEILLUSTRA.illustra = new Array();
MOEILLUSTRA.loadIllustra = function (data) {
	for (var i in data) {
		/*if (! (i in MOEILLUSTRA.illustra)) {
			MOEILLUSTRA.illustra[i] = data[i];
			++ MOEILLUSTRA.config.count;
		} else {
			console.warn("data conflict", i);
		}*/
		MOEILLUSTRA.illustra.push(data[i]);
	}
}
MOEILLUSTRA.showFrame = function () {
	var canvas = $("#" + MOEILLUSTRA.config.canvas);
	canvas.empty();
	canvas.append($('<a href="#" class="id-pagelink pagelink" target="_blank"><img border="0" src="resources/nophoto.jpg" alt="photo" width="20%" class="id-photo photo" /></a>'));
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").hide();
	canvas.append($('<button type="button" class="id-randombutton button randombutton">随机</button>'));
	$("#" + MOEILLUSTRA.config.canvas + " .id-randombutton").click(MOEILLUSTRA.showRandom);
	canvas.append($('<table class="id-table" border="0"></table>'));
};
MOEILLUSTRA.showIllustra = function (illustra) {
	var table = $("#" + MOEILLUSTRA.config.canvas + " .id-table");
	table.empty();
	table.append($('<tr><th class="id-th0"></th><th class="id-th1"></th></tr>'));
	$("#" + MOEILLUSTRA.config.canvas + " .id-pagelink").attr("href", "#");
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").hide();
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").attr("src", "resources/nophoto.jpg");
	for (var i in illustra) {
		if ("photo" == i) {
			$("#" + MOEILLUSTRA.config.canvas + " .id-photo").attr("src", illustra[i]);
		}
		else if ("link" == i) {
			$("#" + MOEILLUSTRA.config.canvas + " .id-pagelink").attr("href", illustra["link"]);
		} else {
			var td = illustra[i];
			if (typeof illustra[i] == "array" || typeof illustra[i] == "object") {
				td = JSON.stringify(illustra[i]);
			}
			if (td.length > 30) {
				//td = td.substring(0, 30) + "...";
			}
			table.append($('<tr><td>' + i + '</td><td>' + td + '</td></tr>'));
		}
	}
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").hide().css({visibility: "inherit"}).fadeIn("slow");
	table.hide().css({visibility: "inherit"}).fadeIn("slow");
};
MOEILLUSTRA.showRandom = function () {
	var r = Math.floor( Math.random() * MOEILLUSTRA.illustra.length );
	MOEILLUSTRA.config.current_illustra = r;
	MOEILLUSTRA.showIllustra(MOEILLUSTRA.illustra[MOEILLUSTRA.config.current_illustra]);
}





















