// moegirl battle ui

MOEPROJ.MOEBATTLEUI = MOEPROJ.MOEBATTLEUI || new Object();
var MOEBATTLEUI = MOEPROJ.MOEBATTLEUI;

MOEBATTLEUI.html = ' \
<div id="board"></div> \
<div id="myhand" class="hand"></div> \
<div id="yourhand" class="hand"></div> \
<a href="#" id="endbutton" class="button disable">结束</a> \
<div id="myhead" class="head"> \
	<img src="#" alt="photo" class="" /> \
	<div class="hp"> \
		<span>0</span> / <span>0</span> \
	</div> \
	<div class="mp"> \
		<span>0</span> / <span>0</span> \
	</div> \
</div> \
<div id="yourhead" class="head"> \
	<img src="#" alt="photo" class="" /> \
	<div class="hp"> \
		<span>0</span> / <span>0</span> \
	</div> \
	<div class="mp"> \
		<span>0</span> / <span>0</span> \
	</div> \
</div> \
<div id="mystatusarea" class="statusarea"></div> \
<div id="yourstatusarea" class="statusarea"></div> \
<div id="myarea" class="area"></div> \
<div id="yourarea" class="area"></div> \
<div id="detail" class="detail"> \
	<div class="name"></div> \
	<div class="cost"></div> \
	<div class="def"></div> \
	<div class="atk"></div> \
	<div class="card-hp"></div> \
	<img src="#" alt="photo" class="" /> \
	<div class="card-detail"></div> \
</div> \
<audio id="audio" src="/mp3/juicy.mp3" preload="auto" /> \
<div id="debug" /> \
';
MOEBATTLEUI.init = function (canvas) {
	document.title = "萌娘对战";
	$("#" + canvas).addClass("moebattle");
};
MOEBATTLEUI.load = function () {
	// endbutton
	$("#" + MOEPROJ.config.canvas + ' #endbutton').on("click", function () {
		// don't work if disabled
		if ($(this).hasClass('disable')) {
			return;
		}
		// end player
		MOEBATTLE.actions.push({
			type: "playerEnd"
		});
	});
	// drop callback for board
	$("#" + MOEPROJ.config.canvas + ' #board').droppable({
		drop: function( event, ui ) {
			var card = ui.draggable[0].id;
			if (undefined === card) {
				return;
			}
			card = card.substring(5);
			// drop the card to board
			if (card in MOEBATTLE.cards) {
				MOEBATTLEUI.Card.drop(card);
			}
		},
		out: function (event, ui) {
			var card = ui.draggable[0].id;
			if (undefined === card) {
				return;
			}
			card = card.substring(5);
			if (card in MOEBATTLE.cards) {
			}
		},
	});
};

// lock for animation
MOEBATTLEUI.AnimaCount = 0;
// the selected item
MOEBATTLEUI.select = {
	target: undefined,
	type: undefined,
	time: new Date()
};

// detail view of a card/icon
MOEBATTLEUI.Detail = function (target_jq, type) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Detail.count;
	++ MOEBATTLEUI.Detail.count;
	if (undefined === type) {
		// find type in element id
		var id = target_jq.attr("id");
		var index = id.indexOf("-");
		if (index >= 0) {
			type = id.substring(0, index);
		}
	}
	this.show(target_jq, type);
};
MOEBATTLEUI.Detail.prototype.canvas = "detail";
MOEBATTLEUI.Detail.count = 0;
// lock up
MOEBATTLEUI.Detail.lock = false;
// show it
MOEBATTLEUI.Detail.prototype.show = function (target_jq, type) {
	// only one detail canvas can be displayed
	if (MOEBATTLEUI.Detail.lock) {
		return;
	}
	MOEBATTLEUI.Detail.lock = true;
	var html = ' \
<div id="' + this.canvas + '" class="detail"> \
	<div class="name"></div> \
	<div class="cost"></div> \
	<div class="def"></div> \
	<div class="atk"></div> \
	<div class="card-hp"></div> \
	<img src="#" alt="photo" class="" /> \
	<div class="card-detail"></div> \
</div> \
	';
	$("#" + MOEPROJ.config.canvas).append(html);
	// find target name in element id
	var target;
	var id = target_jq.attr("id");
	var index = id.indexOf("-");
	if (index >= 0) {
		target = id.substring(index + 1);
	}
	this.addContent(target, type);
	++ MOEBATTLEUI.AnimaCount;
	// show it
	var detail_jq = $("#" + MOEPROJ.config.canvas + " #" + this.canvas);
	detail_jq.show().css("visibility", "inherit");
	// hover to stop hiding
	/*detail_jq.hover(function () {
		detail_jq.stop();
	}, MOEBATTLEUI.hideDetail);*/
	// start animation
	this.chooseDir(detail_jq, undefined, target_jq);
};
// add content to detail canvas
MOEBATTLEUI.Detail.prototype.addContent = function (target, type) {
	switch (type) {
	case "status":
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .name").html(MOEBATTLE.battle.status[target].name);
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " img").attr("src", MOEBATTLE.battle.status[target].photo || "");
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .card-detail").html(MOEBATTLE.battle.status[target].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
		break;
	case "card":
	case "icon":
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .name").html(MOEBATTLE.cards[target].name);
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " img").attr("src", MOEBATTLE.cards[target].photo || "");
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .cost").html("cost: " + (MOEBATTLE.cards[target].cost || 0));
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .atk").html("moe point: " + (MOEBATTLE.cards[target].atk || 0));
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .card-hp").html("hp: " + (MOEBATTLE.cards[target].hp || 0));
		$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " .card-detail").html(MOEBATTLE.cards[target].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
		break;
	case "player":
	default:
		break;
	}
};
// choose direction for detail canvas
MOEBATTLEUI.Detail.prototype.chooseDir = function (detail_jq, dir, target_jq) {
	// undefined direction
	if (undefined === dir || "auto" == dir) {
		// decide the direction to popup based on the location
		var target_pos = target_jq.offset();
		if (target_pos.top < 200) {
			dir = "down";
		}
		else if (target_pos.top + 200 > $(window).height()) {
			dir = "up";
		}
		else if (target_pos.left < $(window).width() / 2) {
			dir = "right";
		}
		else {
			dir = "left";
		}
	}
	switch (dir) {
	case "up": // popup
		detail_jq.css({
			top: target_jq.offset().top,
			left: target_jq.offset().left - 90,
			height: "0%",
			width: target_jq.width()
		}).animate({
			top: '-=400px',
			left: '-=120px',
			height: '+=400px',
			width: '+=240px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "down": // pop down
		detail_jq.css({
			top: target_jq.offset().top + target_jq.height(),
			left: target_jq.offset().left - 90,
			height: "0%",
			width: target_jq.width()
		}).animate({
			//top: '-=400px',
			left: '-=120px',
			height: '+=400px',
			width: '+=240px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "left": // pop left
		detail_jq.css({
			top: target_jq.offset().top,
			left: target_jq.offset().left - 90,
			height: target_jq.height(),
			width: "0%"
		}).animate({
			top: '-=200px',
			left: '-=360px',
			height: '+=400px',
			width: '+=360px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "right": // pop right
		detail_jq.css({
			top: target_jq.offset().top,
			left: target_jq.offset().left - 90 + target_jq.width(),
			height: target_jq.height(),
			width: "0%"
		}).animate({
			top: '-=200px',
			//left: '-=240px',
			height: '+=400px',
			width: '+=360px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "none":
	case 0:
	default:
		-- MOEBATTLEUI.AnimaCount;
		break;
	}
}
// hide detail canvas
MOEBATTLEUI.Detail.prototype.hide = function () {
	$("#" + MOEPROJ.config.canvas + " #" + this.canvas).fadeOut("slow", function () {
		$(this).remove();
		MOEBATTLEUI.Detail.lock = false;
	});
}

MOEBATTLEUI.detail_lock = false;
//@deprecated show detail canvas
MOEBATTLEUI.showDetail = function (card, type, dir) {
	// only one detail canvas can be displayed
	if (MOEBATTLEUI.detail_lock) {
		return;
	}
	MOEBATTLEUI.detail_lock = true;
	MOEBATTLEUI.addDetailContent(card, type);
	var detail_jq = $("#" + MOEPROJ.config.canvas + " #detail");
	detail_jq.show().css("visibility", "inherit");
	var card_jq;
	switch (type) {
	case "icon":
		card_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + card);
		break;
	case "status":
		card_jq = $("#" + MOEPROJ.config.canvas + " #status-" + card);
		break;
	case "player":
		card_jq = card ? $("#" + MOEPROJ.config.canvas + " #yourhead img") : $("#" + MOEPROJ.config.canvas + " #myhead img");
		break;
	case "card":
	default:
		card_jq = $("#" + MOEPROJ.config.canvas + " #card-" + card);
		break;
	}
	// invalid parent card
	if (0 == card_jq.length) {
		return $("#" + MOEPROJ.config.canvas + " #detail");
	}
	// hover to stop hiding
	/*detail_jq.hover(function () {
		detail_jq.stop();
	}, MOEBATTLEUI.hideDetail);*/
	// start animation
	++ MOEBATTLEUI.AnimaCount;
	MOEBATTLEUI.chooseDetailDir(detail_jq, dir, card_jq);
	return $("#" + MOEPROJ.config.canvas + " #detail");
}
// add content to detail canvas
MOEBATTLEUI.addDetailContent = function (card, type) {
	switch (type) {
	case "status":
		$("#" + MOEPROJ.config.canvas + " #detail .name").html(MOEBATTLE.battle.status[card].name);
		$("#" + MOEPROJ.config.canvas + " #detail img").attr("src", MOEBATTLE.battle.status[card].photo || "");
		$("#" + MOEPROJ.config.canvas + " #detail .card-detail").html(MOEBATTLE.battle.status[card].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
		break;
	case "card":
	case "icon":
		$("#" + MOEPROJ.config.canvas + " #detail .name").html(MOEBATTLE.cards[card].name);
		$("#" + MOEPROJ.config.canvas + " #detail img").attr("src", MOEBATTLE.cards[card].photo || "");
		if (MOEBATTLE.cards[card].cost) {
			$("#" + MOEPROJ.config.canvas + " #detail .cost").html("cost: " + (MOEBATTLE.cards[card].cost));
		} else {
			// if not valid, hide
			$("#" + MOEPROJ.config.canvas + " #detail .cost").html("cost: " + "N/A").hide();
		}
		if (MOEBATTLE.cards[card].atk) {
			$("#" + MOEPROJ.config.canvas + " #detail .atk").html("moe point: " + (MOEBATTLE.cards[card].atk || 0));
		} else {
			$("#" + MOEPROJ.config.canvas + " #detail .atk").html("moe point: " + "N/A").hide();
		}
		if (MOEBATTLE.cards[card].hp) {
			$("#" + MOEPROJ.config.canvas + " #detail .card-hp").html("hp: " + (MOEBATTLE.cards[card].hp || 0));
		} else {
			$("#" + MOEPROJ.config.canvas + " #detail .card-hp").html("hp: " + "N/A").hide();
		}
		$("#" + MOEPROJ.config.canvas + " #detail .card-detail").html(MOEBATTLE.cards[card].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
		break;
	case "player":
	default:
		break;
	}
}
// choose direction for detail canvas
MOEBATTLEUI.chooseDetailDir = function (detail_jq, dir, card_jq) {
	// undefined direction
	if (undefined === dir || "auto" == dir) {
		// decide the direction to popup based on the location
		var card_pos = card_jq.offset();
		if (card_pos.top < 200) {
			dir = "down";
		}
		else if (card_pos.top + 200 > $(window).height()) {
			dir = "up";
		}
		else if (card_pos.left < $(window).width() / 2) {
			dir = "right";
		}
		else {
			dir = "left";
		}
	}
	switch (dir) {
	case "up": // popup
		detail_jq.css({
			top: card_jq.offset().top,
			left: card_jq.offset().left - 90,
			height: "0%",
			width: card_jq.width()
		}).animate({
			top: '-=400px',
			left: '-=120px',
			height: '+=400px',
			width: '+=240px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "down": // pop down
		detail_jq.css({
			top: card_jq.offset().top + card_jq.height(),
			left: card_jq.offset().left - 90,
			height: "0%",
			width: card_jq.width()
		}).animate({
			//top: '-=400px',
			left: '-=120px',
			height: '+=400px',
			width: '+=240px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "left": // pop left
		detail_jq.css({
			top: card_jq.offset().top,
			left: card_jq.offset().left - 90,
			height: card_jq.height(),
			width: "0%"
		}).animate({
			top: '-=200px',
			left: '-=360px',
			height: '+=400px',
			width: '+=360px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "right": // pop right
		detail_jq.css({
			top: card_jq.offset().top,
			left: card_jq.offset().left - 90 + card_jq.width(),
			height: card_jq.height(),
			width: "0%"
		}).animate({
			top: '-=200px',
			//left: '-=240px',
			height: '+=400px',
			width: '+=360px'
		}, "fast", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		break;
	case "none":
	case 0:
	default:
		-- MOEBATTLEUI.AnimaCount;
		break;
	}
}
// hide detail canvas
MOEBATTLEUI.hideDetail = function () {
	$("#" + MOEPROJ.config.canvas + " #detail").fadeOut("slow", function () {
		MOEBATTLEUI.detail_lock = false;
	});
}

// arrow
MOEBATTLEUI.Arrow = function (source_jq, func) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Arrow.count;
	++ MOEBATTLEUI.Arrow.count;
	this.draw(this.canvas);
	if (undefined !== source_jq) {
		this.follow(source_jq, func);
	}
};
MOEBATTLEUI.Arrow.prototype.canvas = "arrow";
MOEBATTLEUI.Arrow.count = 0;
MOEBATTLEUI.Arrow.prototype.status = "idle";
// draw the arrow
MOEBATTLEUI.Arrow.prototype.draw = function (canvas) {
	var html = ' \
<div id= "' + this.canvas + '" class="arrow"> \
	<canvas /> \
</div> \
	';
	$("#" + MOEPROJ.config.canvas).append(html);
	// arrow canvas
	var ctx = $("#" + MOEPROJ.config.canvas + " #" + this.canvas + " canvas")[0].getContext('2d');
	// Create gradient
	var grd = ctx.createLinearGradient(0, 0, 0, 150);
	grd.addColorStop(0,"gold");
	grd.addColorStop(1,"white");
	// Fill with gradient
	ctx.fillStyle = grd;
	// shadow
	ctx.shadowColor = '#999';
	ctx.shadowBlur = 20;
	ctx.shadowOffsetX = 30;
	ctx.shadowOffsetY = 10;
	// draw an arrow
	ctx.beginPath();
	ctx.moveTo(150, 0);
	ctx.lineTo(0, 45);
	ctx.lineTo(100, 45);
	ctx.lineTo(100, 150);
	ctx.lineTo(200, 150);
	ctx.lineTo(200, 45);
	ctx.lineTo(300, 45);
	ctx.closePath();
	ctx.fill();
}
// set arrow follow mouse
MOEBATTLEUI.Arrow.prototype.follow = function (source_jq, func) {
	// don't follow again
	if ("follow" == this.status) {
		return;
	}
	var that = this;
	this.status = "follow";
	// find source position
	var source_y = source_jq.position().top + source_jq.height() / 2;
	var source_x = source_jq.position().left + source_jq.width() / 2;
	// trace back to parents
	var parent = source_jq.parent();
	while (undefined !== parent && parent.attr('id') != MOEPROJ.config.canvas) {
		source_x += parent.position().left;
		source_y += parent.position().top;
		parent = parent.parent();
	}
	// draw an arrow following mouse
	var arrow_follow = function (event) {
		// mouse position
		var pagex = event.pageX - $("#" + MOEPROJ.config.canvas).offset().left;
		var pagey = event.pageY - $("#" + MOEPROJ.config.canvas).offset().top;
		// arrow length
		var length = Math.sqrt((pagex - source_x) * (pagex - source_x) + (pagey - source_y) * (pagey - source_y));
		// arrow center
		var newx = (pagex + source_x) / 2 - 25;
		var newy = (pagey + source_y) / 2 - length / 2;
		// arrow length
		$("#" + MOEPROJ.config.canvas + " #" + that.canvas).height(length);
		// arrow angle to rotate
		var angle = Math.atan2(pagey - source_y, pagex - source_x) * 180 / Math.PI + 90;
		$("#" + MOEPROJ.config.canvas + " #" + that.canvas).css({
			top: newy,
			left: newx
		})
		// rotate
		.css({ WebkitTransform: 'rotate(' + angle + 'deg)' }).css({ '-moz-transform': 'rotate(' + angle + 'deg)' })
		.css({visibility: "inherit"}).show();
	};
	// click a target and hide arrow
	var arrow_click_target = function () {
		// don't select the source itself
		if (source_jq.attr('id') == MOEBATTLEUI.select.target) {
			return;
		}
		// if nothing selected
		else if (undefined === MOEBATTLEUI.select.target) {
		}
		// remove arrow
		$("html").off('mousemove', arrow_follow).off("click", arrow_click_target);
		$("#" + MOEPROJ.config.canvas + " #" + that.canvas).hide().remove();
		that.status = "idle";
		if (typeof func == "function") {
			func(source_jq.attr('id'), MOEBATTLEUI.select.target);
		}
	};
	// set arrow to follow mouse
	$("html").on("mousemove", arrow_follow)
	// click anywhere to stop the arrow
	.on("click", arrow_click_target);
};

// game

MOEBATTLEUI.gameOver = function () {
	console.log("game over");
};

// player

// prepare player layout
MOEBATTLEUI.playerCreate = function (player) {
	++ MOEBATTLEUI.AnimaCount;
	var rphoto = Math.round(Math.random() * MOEBATTLE.moegirls.length);
	if (0 == player) {
		// head photo
		$("#" + MOEPROJ.config.canvas + " #myhead img").attr("src", MOEBATTLE.moegirls[rphoto].photo)
		.error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		// hover to show detail
		$("#" + MOEPROJ.config.canvas + " #myhead img").hover(function (obj) {
			MOEBATTLEUI.select.target = player;
			MOEBATTLEUI.select.type = "player";
			MOEBATTLEUI.select.time = new Date();
			$(this).css("z-index", 1);
			MOEBATTLEUI.showDetail(player, "player");
		}, function (obj) {
			MOEBATTLEUI.select.target = undefined;
			MOEBATTLEUI.select.type = undefined;
			$(this).css("z-index", 0);
			MOEBATTLEUI.hideDetail();
		});
		$("#" + MOEPROJ.config.canvas + " #myhead img").hover()
		var span = $("#" + MOEPROJ.config.canvas + ' #myhead .hp span');
		$(span[0]).html(MOEBATTLE.players[player].hp);
		$(span[1]).html(MOEBATTLE.players[player].maxhp);
		span = $("#" + MOEPROJ.config.canvas + ' #myhead .mp span');
		$(span[0]).html(MOEBATTLE.players[player].mp);
		$(span[1]).html(MOEBATTLE.players[player].maxmp);
	}
	else if (1 == player) {
		$("#" + MOEPROJ.config.canvas + " #yourhead img").attr("src", MOEBATTLE.moegirls[rphoto].photo)
		.error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		// hover to show detail
		$("#" + MOEPROJ.config.canvas + " #yourhead img").hover(function (obj) {
			MOEBATTLEUI.select.target = player;
			MOEBATTLEUI.select.type = "player";
			MOEBATTLEUI.select.time = new Date();
			$(this).css("z-index", 1);
			MOEBATTLEUI.showDetail(player, "player");
		}, function (obj) {
			MOEBATTLEUI.select.target = undefined;
			MOEBATTLEUI.select.type = undefined;
			$(this).css("z-index", 0);
			MOEBATTLEUI.hideDetail();
		});
		var span = $("#" + MOEPROJ.config.canvas + ' #yourhead .hp span');
		$(span[0]).html(MOEBATTLE.players[player].hp);
		$(span[1]).html(MOEBATTLE.players[player].maxhp);
		span = $("#" + MOEPROJ.config.canvas + ' #yourhead .mp span');
		$(span[0]).html(MOEBATTLE.players[player].mp);
		$(span[1]).html(MOEBATTLE.players[player].maxmp);
	}
	-- MOEBATTLEUI.AnimaCount;
}
MOEBATTLEUI.playerStart = function () {
	++ MOEBATTLEUI.AnimaCount;
	// change border color
	$("#battle .hand.turn").removeClass("turn");
	if (0 == MOEBATTLE.game.current) {
		$("#battle #myhand").addClass("turn");
	} else {
		$("#battle #yourhand").addClass("turn");
	}
	// click event for endbutton
	if (0 == MOEBATTLE.game.current) {
		$("#" + MOEPROJ.config.canvas + ' #endbutton').removeClass("disable");
	} else {
		// computer player ends automatically
		setTimeout(function () {
			MOEBATTLE.actions.push({
				type: "playerEnd"
			});
		}, 1000);
	}
	-- MOEBATTLEUI.AnimaCount;
}
MOEBATTLEUI.playerEnd = function () {
	++ MOEBATTLEUI.AnimaCount;
	// disable endbutton in case of double click
	$("#" + MOEPROJ.config.canvas + ' #endbutton').addClass("disable");
	-- MOEBATTLEUI.AnimaCount;
}
MOEBATTLEUI.playerChangeHP = function (target, number) {
	var num;
	if (0 == target) {
		$("#" + MOEPROJ.config.canvas + ' #myhead .hp span').html(MOEBATTLE.players[target].hp);
		num = new MOEBATTLEUI.Number(number, $("#" + MOEPROJ.config.canvas + ' #myhead'));
	}
	else {
		$("#" + MOEPROJ.config.canvas + ' #yourhead .hp span').html(MOEBATTLE.players[target].hp);
		num = new MOEBATTLEUI.Number(number, $("#" + MOEPROJ.config.canvas + ' #yourhead'));
	}
};
MOEBATTLEUI.playerChangeMaxHP = function (target, number) {
	if (0 == target) {
		$($("#" + MOEPROJ.config.canvas + ' #myhead .hp span')[1]).html(number);
	}
	else {
		$($("#" + MOEPROJ.config.canvas + ' #yourhead .hp span')[1]).html(number);
	}
};
MOEBATTLEUI.playerChangeMP = function (target, number) {
	if (0 == target) {
		$("#" + MOEPROJ.config.canvas + ' #myhead .mp span').html(number);
	}
	else {
		$("#" + MOEPROJ.config.canvas + ' #yourhead .mp span').html(number);
	}
};
MOEBATTLEUI.playerChangeMaxMP = function (target, number) {
	if (0 == target) {
		$($("#" + MOEPROJ.config.canvas + ' #myhead .mp span')[1]).html(number);
	}
	else {
		$($("#" + MOEPROJ.config.canvas + ' #yourhead .mp span')[1]).html(number);
	}
};
MOEBATTLEUI.playerLoseStatus = function (target, status) {
	if (0 == target) {
		$("#" + MOEPROJ.config.canvas + ' #mystatusarea #status-' + status).remove();
	}
	else {
		$("#" + MOEPROJ.config.canvas + ' #yourstatusarea #status-' + status).remove();
	}
}
MOEBATTLEUI.playerGainStatus = function (target, status) {
	var status = new MOEBATTLEUI.Status(status, target);
}

// card
MOEBATTLEUI.Card = function () {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Card.count;
	++ MOEBATTLEUI.Card.count;
};
MOEBATTLEUI.Card.prototype.canvas = "card";
MOEBATTLEUI.Card.count = 0;
MOEBATTLEUI.Card.prototype.show = function (card) {
	++ MOEBATTLEUI.AnimaCount;
	var html = ' \
<div id="card-' + card + '" class=" card"> \
	<span>test</span> \
	<img src="" alt="photo" /> \
	<div class="card-detail"></div> \
	<div class="cost param"></div> \
	<div class="def param"></div> \
	<div class="atk param"></div> \
	<div class="card-hp param"></div> \
</div> \
	';
	$("#" + MOEPROJ.config.canvas).append(html);
	var card_jq = $("#" + MOEPROJ.config.canvas + " #card-" + card);
	card_jq.draggable({
		stop: function (event, ui) {
			// if the card is in my hand, put it back
			if ($(this).hasClass("inhand")) {
				// float to left
				$(this).css({
					top: "0px",
					left: "0px"
				});
			}
		},
	});
	// assign content
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " span").html(MOEBATTLE.cards[card].name);
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " img").attr("src", MOEBATTLE.cards[card].photo)
	.error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " div.card-detail").html(MOEBATTLE.cards[card].detail);
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " div.cost").html(MOEBATTLE.cards[card].cost || 0);
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " div.def").html(MOEBATTLE.cards[card].def || 0);
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " div.atk").html(MOEBATTLE.cards[card].atk || 0);
	$("#" + MOEPROJ.config.canvas + " #card-" + card + " div.card-hp").html(MOEBATTLE.cards[card].hp || 0);
	var detail;
	card_jq.hover(function () {
		// move to front
		$(this).css("z-index", 1);
		// expand
		//$(this).animate({ height: "+=20px", width: "+=20px", left: "-=10px", top: "-=10px" }, "fast");
		detail = new MOEBATTLEUI.Detail(card_jq);
	}, function () {
		// move back
		$(this).css("z-index", 0);
		//$(this).animate({ height: "-=20px", width: "-=20px", left: "+=10px", top: "+=10px" }, "fast");
		detail.hide();
	});
	-- MOEBATTLEUI.AnimaCount;
	return $("#" + MOEPROJ.config.canvas + " #card-" + card);
};
// drop a card into board
MOEBATTLEUI.Card.drop = function (card) {
	++ MOEBATTLEUI.AnimaCount;
	var card_jq = $("#" + MOEPROJ.config.canvas + " #card-" + card);
	// if not my turn, put card back
	if (0 != MOEBATTLE.game.current) {
		card_jq.animate({
			top: "70%", left: "45%"
		}, "slow", function () {
			-- MOEBATTLEUI.AnimaCount;
		});
		return;
	}
	var player = 0;
	if (card_jq.hasClass("myhand")) {
		player = 0;
	}
	else if (card_jq.hasClass("yourhand")) {
		player = 1;
	}
	// put out of myhand canvas
	var top = card_jq.position().top + card_jq.parent().position().top;
	var left = card_jq.position().left + card_jq.parent().position().left;
	$("#" + MOEPROJ.config.canvas).append(card_jq.detach());
	card_jq.removeClass("inhand myhand yourhand");
	card_jq.css({
		top: top,
		left: left
	});
	// if having target
	if (undefined !== MOEBATTLE.cards[card].target) {
		var arrow = new MOEBATTLEUI.Arrow(card_jq, function () {
			// if no target, put it back
			if (undefined === MOEBATTLEUI.select.target) {
				if (0 == player) {
					$("#" + MOEPROJ.config.canvas + " #myhand").append(card_jq.detach());
					card_jq.addClass("inhand myhand");
				}
				else {
					$("#" + MOEPROJ.config.canvas + " #yourhand").append(card_jq.detach());
					card_jq.addClass("inhand yourhand");
				}
				card_jq.css({
					top: "0px",
					left: "0px"
				});
				return;
			}
			var targetPlayer = "";
			switch ($("#" + MOEBATTLEUI.select.type + "-" + MOEBATTLEUI.select.target).parent().attr("id")) {
			case "myhand":
			case "myarea":
				targetPlayer = 0;
				break;
			case "yourhand":
			case "yourarea":
				targetPlayer = 1;
				break;
			default:
				targetPlayer = undefined;
				break;
			}
			MOEBATTLE.actions.unshift({
				type: "cardUseWithTarget",
				card: card,
				targetPlayer: targetPlayer,
				target: MOEBATTLEUI.select.target,
			});
		});
	} else { // use directly
		MOEBATTLE.actions.unshift({
			type: "cardUse",
			from: player,
			card: card,
		});
	}
	-- MOEBATTLEUI.AnimaCount;
}
// draw card animation
MOEBATTLEUI.Card.draw = function (player, card, from) {
	// invalid
	if (player < 0 || player >= MOEBATTLE.players.length) {
		return;
	}
	// animation for drawing a card
	var detail_jq = MOEBATTLEUI.showDetail(card, "card");
	if (undefined === detail_jq) {
		console.warn("fail to cardDraw ui");
		return;
	}
	++ MOEBATTLEUI.AnimaCount;
	detail_jq.css({
		top: '48%',
		left: '95%',
		height: '4%',
		width: '1%'
	})
	// expand
	.animate({
		top: '10%',
		left: '50%',
		height: '80%',
		width: '40%'
	}, "fast", function () {
		var that = this;
		// show detail
		setTimeout(function () {
			// move to player's hand
			var top = "75%", left = "45%";
			if (0 == player) {
				top = "75%", left = "45%";
			} else {
				top = "5%", left = "45%";
			}
			$(that).find(".card-detail").hide();
			$(that).animate({
				top: top,
				left: left,
				height: "150px",
				width: "100px"
			}, "slow", function () {
				// create a card
				var card_obj = new MOEBATTLEUI.Card();
				var card_jquery = card_obj.show(card);
				// put inside myhand canvas
				if (0 == player) {
					$("#" + MOEPROJ.config.canvas + " #myhand").append(card_jquery.detach());
					card_jquery.addClass("inhand myhand");
				} else { // put inside yourhand canvas
					$("#" + MOEPROJ.config.canvas + " #yourhand").append(card_jquery.detach());
					card_jquery.addClass("inhand yourhand");
				}
				// float to left
				card_jquery.css({
					top: "0px",
					left: "0px"
				});
				$(that).fadeOut("slow", function () {
					$(this).find(".card-detail").css({visibility: "inherit"}).show();
					MOEBATTLEUI.detail_lock = false;
				});
				card_jquery.hide().css({visibility: "inherit"}).fadeIn("slow", function () {
					-- MOEBATTLEUI.AnimaCount;
				});
			});
		}, 200);
	});
};
MOEBATTLEUI.Card.useWithoutTarget = function (card) {
	++ MOEBATTLEUI.AnimaCount;
	// expand and disappear
	$("#" + MOEPROJ.config.canvas + ' #card-' + card).animate({
		top: '-=100px',
		left: '-=100px',
		height: '+=200px',
		width: '+=200px',
		opacity: 0,
	}, "slow", function () {
		$(this).remove();
		MOEBATTLEUI.skillAnimate(card, "");
		-- MOEBATTLEUI.AnimaCount;
	});
}
MOEBATTLEUI.Card.useWithTarget = function (card) {
	++ MOEBATTLEUI.AnimaCount;
	// expand and disappear
	$("#" + MOEPROJ.config.canvas + ' #card-' + card).animate({
		top: '-=100px',
		left: '-=100px',
		height: '+=200px',
		width: '+=200px',
		opacity: 0,
	}, "slow", function () {
		$(this).remove();
		MOEBATTLEUI.skillAnimate(card, "");
		-- MOEBATTLEUI.AnimaCount;
	});
}
MOEBATTLEUI.Card.addToArea = function (card, player) {
	++ MOEBATTLEUI.AnimaCount;
	// shrink to image size
	var height = $("#" + MOEPROJ.config.canvas + " #card-" + card + " img").height();
	var width = $("#" + MOEPROJ.config.canvas + " #card-" + card + " img").width();
	//@bug useless  fit to max-, min-height, width
	if (height > 60) {
		width *= 60 / height;
		height = 60;
	}
	if (width > 60) {
		height *= 60 / width;
		width = 60;
	}
	if (height < 10) {
		height = 10;
	}
	if (width < 10) {
		width = 10;
	}
	MOEBATTLEUI.Card.moveToAreaAnima(card, player, height, width);
	-- MOEBATTLEUI.AnimaCount;
}
MOEBATTLEUI.Card.moveToAreaAnima = function (card, player, height, width) {
	++ MOEBATTLEUI.AnimaCount;
	// move to player's area
	$("#" + MOEPROJ.config.canvas + ' #card-' + card).animate({
		top: "50%",
		left: "45%",
		height: height + "px",
		width: width + "px",
	}, "slow", function () {
		$(this).remove();
		// add an icon in area
		var char = new MOEBATTLEUI.Char(card, player);
		MOEBATTLEUI.skillAnimate(card, "skill0");
		-- MOEBATTLEUI.AnimaCount;
	});
}

// icon
MOEBATTLEUI.Icon = function () {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Icon.count;
	++ MOEBATTLEUI.Icon.count;
};
MOEBATTLEUI.Icon.prototype.canvas = "icon";
MOEBATTLEUI.Icon.count = 0;
MOEBATTLEUI.Icon.prototype.show = function () {
};

// character
MOEBATTLEUI.Char = function (card, player, height, width) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Char.count;
	++ MOEBATTLEUI.Char.count;
	var area_jq;
	switch (player) {
	case 1:
		area_jq = $("#" + MOEPROJ.config.canvas + ' #yourarea');
		break;
	case 0:
	default:
		area_jq = $("#" + MOEPROJ.config.canvas + ' #myarea');
		break;
	}
	this.show(card, area_jq, height, width);
};
MOEBATTLEUI.Char.prototype.canvas = "char";
MOEBATTLEUI.Char.count = 0;
MOEBATTLEUI.Char.prototype.show = function (card, area_jq) {
	++ MOEBATTLEUI.AnimaCount;
	var html = ' \
<div id="icon-' + card + '" class="icon myuse"> \
	<span></span> \
	<img src="" alt="icon" class="" /> \
	<div class="cost param"></div> \
	<div class="def param"></div> \
	<div class="atk param"></div> \
	<div class="card-hp param"></div> \
</div> \
	';
	area_jq.append(html);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " img").attr("src", MOEBATTLE.cards[card].photo).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.atk").html(MOEBATTLE.cards[card].atk || 0);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.def").html(MOEBATTLE.cards[card].def || 0);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.card-hp").html(MOEBATTLE.cards[card].hp || 0);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.cost").html(MOEBATTLE.cards[card].cost || 0);
	var icon_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + card);
	var detail;
	var hover_flag = false;
	var that = this;
	icon_jq.hover(function (obj) {
		MOEBATTLEUI.select.target = card;
		MOEBATTLEUI.select.type = "icon";
		MOEBATTLEUI.select.time = new Date();
		hover_flag = true;
		$(that).css("z-index", 1);
		if (undefined !== detail) {
			detail.hide();
		}
		detail = new MOEBATTLEUI.Detail(icon_jq);

	}, function (obj) {
		hover_flag = false;
		// delay to check leave
		setTimeout(function () {
			if (! hover_flag) {
				MOEBATTLEUI.select.target = undefined;
				MOEBATTLEUI.select.type = undefined;
				$(that).css("z-index", 0);
				detail.hide();
			}
		}, 200);
	});
	icon_jq.on("click", function () {
		if (undefined === MOEBATTLEUI.select.target) {
			return;
		}
		//actions.push({type: "strike", from: card, to: MOEBATTLEUI.select.target});
		var arrow = new MOEBATTLEUI.Arrow(icon_jq, function (from, to) {
			// hit target icon
			if (undefined === from || undefined === to) {
				return;
			}
			var from_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + from);
			var to_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + to);
			if (0 == from_jq.length || 0 == to_jq.length) {
				return;
			}
			var from_pos = from_jq.position();
			var from_parent_pos = from_jq.parent().offset();
			var to_pos = to_jq.position();
			var to_parent_pos = to_jq.parent().offset();
			from_jq.animate({ 
				top: to_pos.top + to_parent_pos.top - from_parent_pos.top,
				left: to_pos.left + to_parent_pos.left - from_parent_pos.left,
			}, "fast", function () {
				from_jq.animate({ 
					top: from_pos.top,
					left: from_pos.left,
				}, "fast", function () {
				});
			});
		});
		
	})
	icon_jq.hide().css({visibility: "inherit"}).fadeIn("fast", function () {
		-- MOEBATTLEUI.AnimaCount;
	});
	return $("#" + MOEPROJ.config.canvas + ' #icon-' + card);
};

MOEBATTLEUI.charChangeHP = function (player, target, number) {
	$("#" + MOEPROJ.config.canvas + ' #char-' + target + ' .hp').html( MOEBATTLE.players[player].chars[target].hp );
	var parent = $("#" + MOEPROJ.config.canvas + ' #icon-' + target);
	var num = new MOEBATTLEUI.Number(number, parent);
	var overlay;
	if (number < 0) {
		overlay = new MOEBATTLEUI.Overlay("resources/effects/628_1.gif", parent);
	}
};

// status
MOEBATTLEUI.Status = function (status, player) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Status.count;
	++ MOEBATTLEUI.Status.count;
	var area_jq;
	switch (player) {
	case 1:
		area_jq = $("#" + MOEPROJ.config.canvas + ' #yourstatusarea');
		break;
	case 0:
	default:
		area_jq = $("#" + MOEPROJ.config.canvas + ' #mystatusarea');
		break;
	}
	this.show(status, area_jq);
};
MOEBATTLEUI.Status.prototype.canvas = "status";
MOEBATTLEUI.Status.count = 0;
MOEBATTLEUI.Status.prototype.show = function (status, area_jq) {
	++ MOEBATTLEUI.AnimaCount;
	var html = ' \
<div id="status-' + status + '" class="status myuse"> \
	<img src="" alt="status" class="" /> \
</div> \
	';
	area_jq.append(html);
	$("#" + MOEPROJ.config.canvas + " #status-" + status + " img").attr("src", MOEBATTLE.battle.status[status].photo).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	var status_jq = $("#" + MOEPROJ.config.canvas + " #status-" + status);
	var detail;
	status_jq.hover(function (obj) {
		MOEBATTLEUI.select.target = status;
		MOEBATTLEUI.select.type = "status";
		MOEBATTLEUI.select.time = new Date();
		$(this).css("z-index", 1);
		detail = new MOEBATTLEUI.Detail(status_jq);
	}, function (obj) {
		MOEBATTLEUI.select.target = undefined;
		MOEBATTLEUI.select.type = undefined;
		$(this).css("z-index", 0);
		detail.hide();
	});
	$("#" + MOEPROJ.config.canvas + ' #status-' + status).hide().css({visibility: "inherit"}).fadeIn("fast", function () {
		-- MOEBATTLEUI.AnimaCount;
	});
	return $("#" + MOEPROJ.config.canvas + ' #status-' + status);
};

// anime
MOEBATTLEUI.Anime = function (img) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Anime.count;
	if (undefined !== img)
	{
		this.show(img);
	}
};
MOEBATTLEUI.Anime.prototype.canvas = "anime";
MOEBATTLEUI.Anime.count = 0;
MOEBATTLEUI.Anime.mutex = 0;
MOEBATTLEUI.Anime.prototype.show = function (img) {
	++ MOEBATTLEUI.AnimaCount;
	var html = ' \
<div id="' + this.canvas + '" class="anime"> \
	<img src="#" alt="anime" class="" /> \
</div> \
	';
	$("#" + MOEPROJ.config.canvas).append(html);
	$("#" + MOEPROJ.config.canvas + " #" + this.canvas + " img").attr("src", img).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("#" + MOEPROJ.config.canvas + ' #' + this.canvas).addClass("active").fadeIn("fast").show();
	var that = this;
	// disappear after a while
	setTimeout(function () {
		$("#" + MOEPROJ.config.canvas + ' #' + that.canvas).fadeOut("slow", function () {
			$(that).removeClass("active");
			$("#" + MOEPROJ.config.canvas + ' #' + that.canvas + " img").attr("src", "");
			-- MOEBATTLEUI.AnimaCount;
		});
	}, 30);
};

// animate for a skill
MOEBATTLEUI.skillAnimate = function (card, skill) {
	// invalid
	if (! (card in MOEBATTLE.cards) || undefined === MOEBATTLE.cards[card].anime || undefined === MOEBATTLE.cards[card].anime[skill]) {
		return;
	}
	var ani_list = MOEBATTLE.cards[card].anime[skill];
	// choose one by random
	var ran = Math.floor( (Math.random() * ani_list.length) );
	var anime = new MOEBATTLEUI.Anime(ani_list[ran]);
}

// number
MOEBATTLEUI.Number = function (num, parent_jq) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Number.count;
	if (undefined !== parent_jq)
	{
		this.show(num, parent_jq);
	}
};
MOEBATTLEUI.Number.prototype.canvas = "number";
MOEBATTLEUI.Number.count = 0;
MOEBATTLEUI.Number.prototype.show = function (num, parent_jq) {
	var that = this;
	var html = ' \
<div id="' + this.canvas + '" class="number"> \
</div> \
	';
	parent_jq.append(html);
	if (num > 0) {
		num = "+" + num;
	}
	var direction = "up";
	if (parent_jq.offset().top < 100) {
		direction = "down";
	}
	var jq = $("#" + MOEPROJ.config.canvas + ' #' + this.canvas);
	jq.html(num);
	switch (direction) {
	case "down":
		jq.css({top: "110%"})
		.animate({
			top: "210%",
			opacity: 0,
		}, 1500, function () {
			$(this).hide();
		});
		break;
	case "up":
	default:
		jq.css({top: "-10%"})
		// disappear after a while
		.animate({
			top: "-110%",
			opacity: 0,
		}, 1500, function () {
			$(this).hide();
		});
		break;
	}
};

// overlay
MOEBATTLEUI.Overlay = function (img, parent_jq) {
	// set a new canvas id
	this.canvas += MOEBATTLEUI.Overlay.count;
	if (undefined !== parent_jq)
	{
		this.show(img, parent_jq);
	}
};
MOEBATTLEUI.Overlay.prototype.canvas = "overlay";
MOEBATTLEUI.Overlay.count = 0;
MOEBATTLEUI.Overlay.prototype.show = function (img, parent_jq) {
	var that = this;
	var html = ' \
<div id="' + this.canvas + '" class="overlay"> \
	<img src="' + img + '" alt="overlay" /> \
</div> \
	';
	parent_jq.append(html);
	$("#" + MOEPROJ.config.canvas + ' #' + this.canvas + " img").error(function () {
		$(this).hide();
	});
	var jq = $("#" + MOEPROJ.config.canvas + ' #' + this.canvas);
	jq.fadeIn("fast").fadeOut(1000, function () {
		$(this).hide();
	});
};







