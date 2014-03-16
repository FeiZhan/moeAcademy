// moegirl illustration

var MOEILLUSTRA = MOEILLUSTRA || new Object();
MOEILLUSTRA.config = {
	files: ['data/moegirls.json'],
	canvas: undefined,
	count: 0,
	current_illustra: 0,
};
// initialize by loading json files
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
	// load json files
	for (var i in MOEILLUSTRA.config.files) {
		loadJson(MOEILLUSTRA.config.files[i]);
	}
};
// init when page loaded
$(function() {
	MOEILLUSTRA.init();
});
// main function
MOEILLUSTRA.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEILLUSTRA.config.canvas = canvas;
	MOEILLUSTRA.showFrame();
	MOEILLUSTRA.waitLoad();
};
// wait for loading json
MOEILLUSTRA.waitLoad = function () {
	if (0 == MOEILLUSTRA.illustra.length) {
		console.log("loading");
		setTimeout(MOEILLUSTRA.waitLoad, 300);
		return;
	}
	MOEILLUSTRA.showRandom();
};
// illustrations for moegirls
MOEILLUSTRA.illustra = new Array();
// load illustrations from json
MOEILLUSTRA.loadIllustra = function (data) {
	MOEILLUSTRA.illustra = MOEILLUSTRA.illustra.concat(data);
	console.log("loaded illustra ", MOEILLUSTRA.illustra.length);
}
// show the framework
MOEILLUSTRA.showFrame = function () {
	var canvas = $("#" + MOEILLUSTRA.config.canvas);
	// clear canvas
	canvas.empty();
	// create image photo
	canvas.append($('<a href="#" class="id-pagelink pagelink" target="_blank"><img border="0" src="resources/nophoto.jpg" alt="photo" width="20%" class="id-photo photo" /></a>'));
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").hide();
	// create random button
	canvas.append($('<a href="#" class="id-randombutton randombutton">Random</a>'));
	$("#" + MOEILLUSTRA.config.canvas + " .id-randombutton").click(MOEILLUSTRA.showRandom);
	// create an empty table for information
	canvas.append($('<table class="id-table" border="0"></table>'));
};
// show a random illustra
MOEILLUSTRA.showRandom = function () {
	// random
	var r = Math.floor( Math.random() * MOEILLUSTRA.illustra.length );
	MOEILLUSTRA.config.current_illustra = r;
	MOEILLUSTRA.showIllustra(MOEILLUSTRA.illustra[MOEILLUSTRA.config.current_illustra]);
}
// show an illustra
MOEILLUSTRA.showIllustra = function (illustra) {
	var table = $("#" + MOEILLUSTRA.config.canvas + " .id-table");
	// clear the table
	table.empty();
	table.append($('<tr><th class="id-th0"></th><th class="id-th1"></th></tr>'));
	// clear link and photo
	$("#" + MOEILLUSTRA.config.canvas + " .id-pagelink").attr("href", "#");
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").hide();
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").attr("src", "resources/nophoto.jpg");
	// for each attribute
	for (var i in illustra) {
		// append photo
		if ("photo" == i) {
			$("#" + MOEILLUSTRA.config.canvas + " .id-photo").attr("src", illustra[i]);
		}
		// append link
		else if ("link" == i) {
			$("#" + MOEILLUSTRA.config.canvas + " .id-pagelink").attr("href", illustra["link"]);
		} else { // append an attribute
			var td = illustra[i];
			// stringify a json
			if (typeof illustra[i] == "array" || typeof illustra[i] == "object") {
				td = JSON.stringify(illustra[i]);
			}
			// if too long
			if (td.length > 30) {
				//td = td.substring(0, 30) + "...";
			}
			table.append($('<tr><td>' + i + '</td><td>' + td + '</td></tr>'));
		}
	}
	// fade in
	$("#" + MOEILLUSTRA.config.canvas + " .id-photo").hide().css({visibility: "inherit"}).fadeIn("slow");
	table.hide().css({visibility: "inherit"}).fadeIn("slow");
};






















