var MOEPROJECT = MOEPROJECT || new Object();
MOEPROJECT.config = {
	files: ['data/moegirls.json'],
	canvas: undefined,
	show_detail: false
};
// initialize by loading json files
MOEPROJECT.init = function () {
	function loadJson(file, func) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
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
	}
	// load card files
	for (var i in MOEPROJECT.config.files) {
		loadJson(MOEPROJECT.config.files[i], function (data) {
			MOEPROJECT.moegirls = MOEPROJECT.moegirls.concat(data);
		});
	}
};
// init when page loaded
$(function() {
	MOEPROJECT.init();
});
// main function for moecascade
MOEPROJECT.run = function (canvas) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEPROJECT.config.canvas = canvas;
	$("#" + canvas).addClass("moecascade");
	MOEPROJECT.showFrame();
	MOEPROJECT.waitLoad();
};
// wait for loading json
MOEPROJECT.waitLoad = function () {
	if (0 == MOEPROJECT.moegirls.length) {
		console.log("loading");
		setTimeout(MOEPROJECT.waitLoad, 300);
		return;
	}
	for (var i = 0; i < 30; ++ i) {
		MOEPROJECT.addMoegirl();
	}
};
MOEPROJECT.showFrame = function () {
	MOEPROJECT.order = new Array();
	var html = 
	'<div id="wrapper">'
		+ '<div id="columns">'
		+ '</div>'
	+ '</div>'
	+ '<div id="detail"><a href="#" class="" target="_blank"><img border="0" src="resources/nophoto.jpg" alt="photo" width="100%" class="" /></a><a href="#" class="" target="_blank"><span></span></a><table class="" border="0"></table></div>';
	$("#" + MOEPROJECT.config.canvas).empty().append(html);
	$("#" + MOEPROJECT.config.canvas + " #detail img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	// nothing happens when clicking detail div
	$("#" + MOEPROJECT.config.canvas + " #detail").click(function( event ) {
		event.stopPropagation();
	});
	var page_click = function (evt) {
		switch (MOEPROJECT.config.show_detail) {
		case true:
			// when clicking out of detail div, detail disappears
			if (evt.target.id != "detail") {
				$("#" + MOEPROJECT.config.canvas + " #detail").fadeOut("slow");
				$("#" + MOEPROJECT.config.canvas + " #columns .pin").removeClass("opaque");
				MOEPROJECT.config.show_detail = false;
			}
			break;
		case false:
			break;
		case "showing":
			// when clicking moegirls, don't make detail div disappear
			MOEPROJECT.config.show_detail = true;
			break;
		default:
			break;
		}
	}
	$('html').off("click").on("click", page_click);
	// check if scrolling
	var page_scroll = function() {
		clearTimeout($.data(this, 'scrollTimer'));
		$.data(this, 'scrollTimer', setTimeout(function() {
			// if scroll to buttom
			if ($(window).scrollTop() == ($(document).height() - $(window).height())) {
				for (var i = 0; i < 20; ++ i) {
					MOEPROJECT.addMoegirl();
				}
			}
		}, 250));
	}
	$(window).off("scroll").on("scroll", page_scroll);
	$("#" + MOEPROJECT.config.canvas).hide().css({visibility: "inherit"}).fadeIn("slow");
}
MOEPROJECT.moegirls = new Array();
// the order of each moegirl
MOEPROJECT.order = new Array();
// append a moegirl div to cascade
MOEPROJECT.addMoegirl = function () {
	var ran = Math.floor( Math.random() * MOEPROJECT.moegirls.length );
	var html =
		'<div class="pin">'
			+ '<img src="' + MOEPROJECT.moegirls[ran].photo + '" />'
			+ '<p>' + MOEPROJECT.moegirls[ran].name + '</p>'
		+ '</div>';
	$("#" + MOEPROJECT.config.canvas + " #columns").append(html);
	$("#" + MOEPROJECT.config.canvas + " #columns .pin:last img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	MOEPROJECT.order.push(ran);
	// when showing detail, make it opaque
	if (true == MOEPROJECT.config.show_detail) {
		$("#" + MOEPROJECT.config.canvas + " #columns .pin:last").addClass("opaque");
	}
	// click to show detail div
	$("#" + MOEPROJECT.config.canvas + " #columns .pin:last").click(function () {
		MOEPROJECT.config.show_detail = "showing";
		var moegirl = MOEPROJECT.moegirls[MOEPROJECT.order[$(this).prevAll().length]];
		MOEPROJECT.showDetail(moegirl);
	});
}
// show detail div
MOEPROJECT.showDetail = function (moegirl) {
	// make all pins opaque
	$("#" + MOEPROJECT.config.canvas + " #columns .pin").addClass("opaque");
	// clear link and photo
	$("#" + MOEPROJECT.config.canvas + " #detail span").empty();
	$("#" + MOEPROJECT.config.canvas + " #detail a").attr("href", "#");
	$("#" + MOEPROJECT.config.canvas + " #detail img").attr("src", "resources/nophoto.jpg");
	var table = $("#" + MOEPROJECT.config.canvas + " #detail table");
	table.empty();
	table.append($('<tr><th class=""></th><th class=""></th></tr>'));
	// for each attribute
	for (var i in moegirl) {
		if ("name" == i) {
			$("#" + MOEPROJECT.config.canvas + " #detail span").html(moegirl["name"]);
		}
		// append photo
		else if ("photo" == i) {
			$("#" + MOEPROJECT.config.canvas + " #detail img").attr("src", moegirl["photo"]);
		}
		// append link
		else if ("link" == i) {
			$("#" + MOEPROJECT.config.canvas + " #detail a").attr("href", moegirl["link"]);
		}
		else if ("firstp" == i || "catlinks" == i) {
			// ignore
		} else { // append an attribute
			var th = i;
			var td = moegirl[i];
			// stringify a json
			if (typeof moegirl[i] == "array" || typeof moegirl[i] == "object") {
				td = "";
				for (var j in moegirl[i]) {
					td += moegirl[i][j] + ", ";
				}
				if (td.length > 2) {
					td = td.substring(0, td.length - 2);
				}
			}
			// if too long
			if (td.length > 30) {
				//td = td.substring(0, 30) + "...";
			}
			table.append($('<tr><td>' + th + '</td><td>' + td + '</td></tr>'));
		}
	}
	$("#" + MOEPROJECT.config.canvas + " #detail").hide().css({visibility: "inherit"}).fadeIn("slow");
}
