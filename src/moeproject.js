// moeproject

var MOEPROJ = MOEPROJ || new Object();
var urlparam = function () {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
			// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
		  query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
		  var arr = [ query_string[pair[0]], pair[1] ];
		  query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
		  query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
} ();
urlparam["hash"] = window.location.hash.length > 0 ? window.location.hash.substring(1) : "";

MOEPROJ.config = {
	canvas: "",
	html: "",
	code: new Array(),
	data: new Array(),
	ready: new Object(),
};
MOEPROJ.init = function () {
	// run corresponding view when sidebar is clicked
	$("#sidebar a").click(function () {
		var choice = $(this).attr("id").substring(3);
		window.location.hash = choice;
		MOEPROJ.run(choice);
	});
};
MOEPROJ.run = function (choice) {
	// change the active button in the sidebar
	var active = $("#sidebar a.active");
	active.removeClass("active");
	$("#sidebar #li-" + choice).addClass("active");
	// show the correpsonding view
	$("#content div").hide();
	$("#content #" + choice).show();
	// run the corresponding code
	switch (choice) {
	case "cascade":
		MOEPROJECT.run("cascade");
		break;
	case "illustra":
		MOEILLUSTRA.run("illustra");
		break;
	case "quest":
		MOEQUEST.load("quest");
		break;
	case "battle":
		MOEBATTLE.run("battle");
		break;
	case "craft":
		MOECRAFT.load("craft");
		break;
	default:
		console.warn("no active page", choice);
		break;
	}
};
MOEPROJ.load = function (config, run_func, data_func) {
	if ("canvas" in config) {
		if (undefined === config.canvas || $("#" + config.canvas).length == 0) {
			console.error("undefined canvas", config.canvas);
			return;
		}
		MOEPROJ.config.canvas = config.canvas;
	}
	if (("html" in config) && "" != config.html) {
		MOEPROJ.config.html = config.html;
		var canvas = $("#" + MOEPROJ.config.canvas);
		// clear the canvas
		canvas.empty();
		// append html
		canvas.append($(MOEPROJ.config.html));
		canvas.hide().css({visibility: "inherit"}).fadeIn("slow");
	}
	if ("code" in config) {
		if (typeof config.code == "array" || typeof config.code == "object") {
			for (var i in config.code) {
				MOEPROJ.loadFile(config.code[i]);
			}
		}
		else {
			MOEPROJ.loadFile(config.code);
		}
	}
	if ("data" in config) {
		if (typeof config.data == "array" || typeof config.data == "object") {
			for (var i in config.data) {
				MOEPROJ.loadFile(config.data[i], data_func);
			}
		}
		else {
			MOEPROJ.loadFile(config.data, data_func);
		}
	}
	MOEPROJ.waitLoad(run_func);
};
MOEPROJ.waitLoad = function (func) {
	var flag = true;
	for (var i in MOEPROJ.config.ready) {
		if (! MOEPROJ.config.ready[i]) {
			flag = false;
			break;
		}
	}
	if (! flag) {
		setTimeout(function () {
			MOEPROJ.waitLoad(func);
		}, 300);
	}
	else {
		func();
	}
};
MOEPROJ.loadFile = function (file, func) {
	if (! (file in MOEPROJ.config.ready)) {
		MOEPROJ.config.ready[file] = false;
	}
	else {
		return;
	}
	if (".js" == file.substr(file.length - 3)) {
		$.getScript(file)
			.done(function( script, textStatus ) {
				MOEPROJ.config.ready[file] = true;
				console.log("load", file);
				return func(script, textStatus);
			})
			.fail(function( jqxhr, settings, exception ) {
				console.error(exception);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		MOEPROJ.config.ready[file] = true;
		return func();
	}
	else if (".json" == file.substr(file.length - 5)) {
		return MOEPROJ.loadJson(file, func);
	}
	else {
		MOEPROJ.config.ready[file] = true;
	}
};
MOEPROJ.loadJson = function (file, func) {
	$.getJSON(file, function(data, textStatus, jqXHR) {
		MOEPROJ.config.ready[file] = true;
		console.log("loaded", file);
		if (typeof func == "function") {
			func(data);
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.error("data load error", textStatus, errorThrown);
	})
	.always(function(data, textStatus, jqXHR) {
	});
};
