// moegirl cascade

MOEPROJ.MOECASC = MOEPROJ.MOECASC || new Object();
var MOECASC = MOEPROJ.MOECASC;

MOECASC.ui;
MOECASC.data = ['data/filenames.json'];
MOECASC.moegirls = new Array();
// the list of each moegirl to display
MOECASC.list = new Array();
// load html and files
MOECASC.load = function (canvas) {
	// set ui
	MOECASC.ui = MOEPROJ.MOECASCUI;
	MOECASC.ui.init(canvas);
	MOEPROJ.load({
		canvas: canvas,
		html: MOECASC.ui.html,
		data: MOECASC.data,
	}, MOECASC.run, MOECASC.loadData);
};
// callback for loading json data
MOECASC.loadData = function (data) {
	MOECASC.moegirls = MOECASC.moegirls.concat(data);
};
// run when loading completes
MOECASC.run = function () {
	// add init moegirls
	MOECASC.list = MOECASC.shuffleMoegirls(24);
	for (var i = 0; i < 24; ++ i) {
		MOECASC.addPin( MOECASC.moegirls[MOECASC.list[i]] );
	}
	MOECASC.ui.load();
};
// get a list of shuffled moegirl numbers
MOECASC.shuffleMoegirls = function (num) {
	var list = new Array();
	for (var i = 0; i < num; ++ i) {
		var ran = Math.floor( Math.random() * MOECASC.moegirls.length );
		list.push(ran);
	}
	return list;
}
// get a list of moegirl details
MOECASC.getMoegirls = function (orders) {
	var list = new Array();
	for (var i in orders) {
		// deep copy
		list.push( jQuery.extend(true, {}, MOECASC.moegirls[ orders[i] ]) )
	}
	return list;
}

// moegirl battle ui

MOEPROJ.MOECASCUI = MOEPROJ.MOECASCUI || new Object();
var MOECASCUI = MOEPROJ.MOECASCUI;
MOECASCUI.html = ' \
<div id="wrapper"> \
	<div id="columns"> \
	</div> \
</div> \
<div id="detail"> \
	<a href="#" target="_blank"> \
		<img border="0" src="resources/nophoto.jpg" alt="photo" /> \
	</a> \
	<a href="#" target="_blank"> \
		<span></span> \
	</a> \
	<table border="0"></table> \
</div> \
';
MOECASCUI.show_detail = false;
MOECASCUI.init = function (canvas) {
	document.title = "萌娘图鉴";
	$("#" + canvas).addClass("moecascade");
};
MOECASCUI.load = function () {
	// nothing happens when clicking detail div
	$("#" + MOEPROJ.config.canvas + " #detail").click(function( event ) {
		event.stopPropagation();
	});
	var page_click = function (evt) {
		switch (MOECASCUI.show_detail) {
		case true:
			// when clicking out of detail div, detail disappears
			if (evt.target.id != "detail") {
				$("#" + MOEPROJ.config.canvas + " #detail").fadeOut("fast");
				$("#" + MOEPROJ.config.canvas + " #columns .pin").removeClass("opaque");
				MOECASCUI.show_detail = false;
			}
			break;
		case false:
			break;
		case "showing":
			// when clicking moegirls, don't make detail div disappear
			MOECASCUI.show_detail = true;
			break;
		default:
			break;
		}
	}
	// click on the webpage
	$('html').unbind("click").off("click", page_click);
	$('html').on("click", page_click);
	var page_scroll = function() {
		clearTimeout($.data(this, 'scrollTimer'));
		$.data(this, 'scrollTimer', setTimeout(function() {
			// if scroll to bottom
			if ($(window).scrollTop() == ($(document).height() - $(window).height())) {
				// add new moegirls
				var last = MOECASC.list.length;
				MOECASC.list = MOECASC.list.concat(MOECASC.shuffleMoegirls(24));
				for (var i = 0; i < 24; ++ i) {
					MOECASC.addPin( MOECASC.moegirls[MOECASC.list[last + i]] );
				}
			}
		}, 250));
	}
	// check if scrolling
	$(window).off("scroll", page_scroll).on("scroll", page_scroll);
	// fade in
	$("#" + MOEPROJ.config.canvas).hide().css({visibility: "inherit"}).fadeIn("slow");
};
// append a moegirl div to cascade
MOECASC.addPin = function (data) {
	var html = ' \
<div class="pin"> \
	<img src="' + data.photo + '" /> \
	<p>' + data.name + '</p> \
</div> \
	';
	$("#" + MOEPROJ.config.canvas + " #columns").append(html);
	$("#" + MOEPROJ.config.canvas + " #columns .pin:last img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	// when showing detail, make it opaque
	if (true == MOECASCUI.show_detail) {
		$("#" + MOEPROJ.config.canvas + " #columns .pin:last").addClass("opaque");
	}
	// click to show detail div
	$("#" + MOEPROJ.config.canvas + " #columns .pin:last").click(function () {
		MOECASCUI.show_detail = "showing";
		var moegirl = MOECASC.moegirls[MOECASC.list[$(this).prevAll().length]];
		MOECASC.showDetail(moegirl);
	});
}
// show detail div
MOECASC.showDetail = function (moegirl) {
	// make all pins opaque
	$("#" + MOEPROJ.config.canvas + " #columns .pin").addClass("opaque");
	// clear link and photo
	$("#" + MOEPROJ.config.canvas + " #detail span").empty();
	$("#" + MOEPROJ.config.canvas + " #detail a").attr("href", "#");
	$("#" + MOEPROJ.config.canvas + " #detail img").attr("src", "resources/nophoto.jpg");
	var table = $("#" + MOEPROJ.config.canvas + " #detail table");
	table.empty();
	table.append($('<tr><th></th><th></th></tr>'));
	// for each attribute
	for (var i in moegirl) {
		if ("name" == i) {
			$("#" + MOEPROJ.config.canvas + " #detail span").html(moegirl["name"]);
		}
		// append photo
		else if ("photo" == i) {
			$("#" + MOEPROJ.config.canvas + " #detail img").attr("src", moegirl["photo"]);
		}
		// append link
		else if ("link" == i) {
			$("#" + MOEPROJ.config.canvas + " #detail a").attr("href", moegirl["link"]);
		}
		else if ("firstp" == i || "catlinks" == i || "old_photo" == i) {
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
	$("#" + MOEPROJ.config.canvas + " #detail").hide().css({visibility: "inherit"}).fadeIn("fast");
}
