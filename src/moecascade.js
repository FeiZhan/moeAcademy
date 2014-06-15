// moegirl cascade
MOEPROJ.MOECASC = MOEPROJ.MOECASC || new Object();
var MOECASC = MOEPROJ.MOECASC;
MOECASC.ui;
MOECASC.data = ['data/moegirls.json'];
MOECASC.moegirls = new Array();
// the order of each moegirl
MOECASC.order = new Array();
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
	MOECASC.order = new Array();
	// nothing happens when clicking detail div
	$("#" + MOEPROJ.config.canvas + " #detail").click(function( event ) {
		event.stopPropagation();
	});
	$("#" + MOEPROJ.config.canvas + " #detail img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	var page_click = function (evt) {
		switch (MOECASCUI.show_detail) {
		case true:
			// when clicking out of detail div, detail disappears
			if (evt.target.id != "detail") {
				$("#" + MOEPROJ.config.canvas + " #detail").fadeOut("slow");
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
	$('html').off("click").on("click", page_click);
	// check if scrolling
	var page_scroll = function() {
		clearTimeout($.data(this, 'scrollTimer'));
		$.data(this, 'scrollTimer', setTimeout(function() {
			// if scroll to buttom
			if ($(window).scrollTop() == ($(document).height() - $(window).height())) {
				for (var i = 0; i < 20; ++ i) {
					MOECASC.addMoegirl();
				}
			}
		}, 250));
	}
	$(window).off("scroll").on("scroll", page_scroll);
	$("#" + MOEPROJ.config.canvas).hide().css({visibility: "inherit"}).fadeIn("slow");
	for (var i = 0; i < 30; ++ i) {
		MOECASC.addMoegirl();
	}
};

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



// append a moegirl div to cascade
MOECASC.addMoegirl = function () {
	var ran = Math.floor( Math.random() * MOECASC.moegirls.length );
	var html =
		'<div class="pin">'
			+ '<img src="' + MOECASC.moegirls[ran].photo + '" />'
			+ '<p>' + MOECASC.moegirls[ran].name + '</p>'
		+ '</div>';
	$("#" + MOEPROJ.config.canvas + " #columns").append(html);
	$("#" + MOEPROJ.config.canvas + " #columns .pin:last img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	MOECASC.order.push(ran);
	// when showing detail, make it opaque
	if (true == MOECASCUI.show_detail) {
		$("#" + MOEPROJ.config.canvas + " #columns .pin:last").addClass("opaque");
	}
	// click to show detail div
	$("#" + MOEPROJ.config.canvas + " #columns .pin:last").click(function () {
		MOECASCUI.show_detail = "showing";
		var moegirl = MOECASC.moegirls[MOECASC.order[$(this).prevAll().length]];
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
	table.append($('<tr><th class=""></th><th class=""></th></tr>'));
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
	$("#" + MOEPROJ.config.canvas + " #detail").hide().css({visibility: "inherit"}).fadeIn("slow");
}
