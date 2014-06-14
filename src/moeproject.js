// moeproject

// namespace
var MOEPROJ = MOEPROJ || new Object();
// parse url parameters
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
// parse url hash
urlparam["hash"] = window.location.hash.length > 0 ? window.location.hash.substring(1) : "";
// config parameters
MOEPROJ.config = {
	canvas: "",
	ready: new Object(),
};
// initialize the project
MOEPROJ.init = function () {
	// run corresponding view when sidebar is clicked
	$("#sidebar a").click(function () {
		var choice = $(this).attr("id").substring(3);
		// append to hash
		window.location.hash = choice;
		MOEPROJ.run(choice);
	});
};
// run the corresponding view based on choice
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
		MOEBATTLE.load("battle");
		break;
	case "craft":
		MOECRAFT.load("craft");
		break;
	default:
		console.warn("no active page", choice);
		break;
	}
};
// load html and files based on config of view
MOEPROJ.load = function (config, run_func, data_func) {
	// set canvas
	if ("canvas" in config) {
		if (undefined === config.canvas || $("#" + config.canvas).length == 0) {
			console.error("invalid canvas", config.canvas);
			return;
		}
		MOEPROJ.config.canvas = config.canvas;
	}
	// append html to the webpage
	if (("html" in config) && "" != config.html) {
		var canvas = $("#" + MOEPROJ.config.canvas);
		// clear the canvas
		canvas.empty();
		// append html
		canvas.append($(config.html));
		// when image loading in error
		$("#" + MOEPROJ.config.canvas + " img").error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		// fade in
		canvas.hide().css({visibility: "inherit"}).fadeIn("slow");
	}
	// load code files
	if ("code" in config) {
		// array of files
		if (typeof config.code == "array" || typeof config.code == "object") {
			for (var i in config.code) {
				MOEPROJ.loadFile(config.code[i]);
			}
		}
		else {
			// a single file
			MOEPROJ.loadFile(config.code);
		}
	}
	// load data files
	if ("data" in config) {
		// array of files
		if (typeof config.data == "array" || typeof config.data == "object") {
			for (var i in config.data) {
				MOEPROJ.loadFile(config.data[i], data_func);
			}
		}
		else {
			// a single file. call data callback function
			MOEPROJ.loadFile(config.data, data_func);
		}
	}
	// wait for loading, call run callback when loaded
	MOEPROJ.waitLoad(run_func);
};
// wait for load files
MOEPROJ.waitLoad = function (func) {
	var flag = true;
	// for each file to load
	for (var i in MOEPROJ.config.ready) {
		// if not loaded
		if (! MOEPROJ.config.ready[i]) {
			flag = false;
			break;
		}
	}
	// if not loaded, wait again
	if (! flag) {
		setTimeout(function () {
			MOEPROJ.waitLoad(func);
		}, 300);
	}
	else {
		// call callback func
		return func();
	}
};
// load a file
MOEPROJ.loadFile = function (file, func) {
	// define a new file index
	if (! (file in MOEPROJ.config.ready)) {
		MOEPROJ.config.ready[file] = false;
	}
	else {
		// already done, don't load again
		return;
	}
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(file)
			.done(function( script, textStatus ) {
				// set file as ready
				MOEPROJ.config.ready[file] = true;
				console.log("load", file);
				// call callback
				return func(script, textStatus);
			})
			.fail(function( jqxhr, settings, exception ) {
				console.error(exception);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		MOEPROJ.config.ready[file] = true;
		return func();
	}
	else if (".json" == file.substr(file.length - 5)) {
		// load a json file
		return MOEPROJ.loadJson(file, func);
	}
	else {
		// ignore it
		MOEPROJ.config.ready[file] = true;
	}
};
// load a json file
MOEPROJ.loadJson = function (file, func) {
	$.getJSON(file, function(data, textStatus, jqXHR) {
		// set file as ready
		MOEPROJ.config.ready[file] = true;
		console.log("load", file);
		// call callback func
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
// Get function from string, with or without scopes
MOEPROJ.getFunctionFromString = function (string) {
    var scope = window;
    var scopeSplit = string.split('.');
    for (i = 0; i < scopeSplit.length - 1; i++)
    {
        scope = scope[scopeSplit[i]];

        if (scope == undefined) return;
    }

    return scope[scopeSplit[scopeSplit.length - 1]];
}
