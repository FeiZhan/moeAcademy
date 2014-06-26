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
<div id="anime"> \
	<img src="#" alt="anime" class="" /> \
</div> \
<div id="detail"> \
	<div class="name"></div> \
	<div class="cost"></div> \
	<div class="def"></div> \
	<div class="atk"></div> \
	<div class="card-hp"></div> \
	<img src="#" alt="photo" class="" /> \
	<div class="card-detail"></div> \
</div> \
';
MOEBATTLEUI.init = function (canvas) {
	document.title = "萌娘对战";
	$("#" + canvas).addClass("moebattle");
};
MOEBATTLEUI.load = function () {
	// endbutton
	$("#" + MOEPROJ.config.canvas + ' #endbutton').on("click", function () {
		if ($(this).hasClass('disable')) {
			return;
		}
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
			if (card in MOEBATTLE.cards) {
				MOEBATTLEUI.cardDrop(card);
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

MOEBATTLEUI.AnimaCount = 0;
MOEBATTLEUI.detail_lock = false;
MOEBATTLEUI.select = {
	target: undefined,
	type: undefined,
	time: new Date()
};

// show detail canvas
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
	var arrow = $("#" + MOEPROJ.config.canvas + " #" + this.canvas + " canvas")[0].getContext('2d');
	// draw an arrow
	arrow.fillStyle = 'yellow';
	arrow.beginPath();
	arrow.moveTo(150, 0);
	arrow.lineTo(0, 45);
	arrow.lineTo(100, 45);
	arrow.lineTo(100, 150);
	arrow.lineTo(200, 150);
	arrow.lineTo(200, 45);
	arrow.lineTo(300, 45);
	arrow.closePath();
	arrow.fill();
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
	if (0 == target) {
		$("#" + MOEPROJ.config.canvas + ' #myhead .hp span').html(number);
	}
	else {
		$("#" + MOEPROJ.config.canvas + ' #yourhead .hp span').html(number);
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
	MOEBATTLEUI.createStatus(target, status);
}

// card

// create a card
MOEBATTLEUI.createCard = function (card) {
	++ MOEBATTLEUI.AnimaCount;
	$("#" + MOEPROJ.config.canvas).append(' \
		<div id="card-' + card + '" class=" card"> \
			<span>test</span> \
			<img src="" alt="photo" /> \
			<div class="card-detail"></div> \
			<div class="cost param"></div> \
			<div class="def param"></div> \
			<div class="atk param"></div> \
			<div class="card-hp param"></div> \
		</div> \
	');
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
	card_jq.hover(function () {
		// move to front
		$(this).css("z-index", 1);
		// expand
		//$(this).animate({ height: "+=20px", width: "+=20px", left: "-=10px", top: "-=10px" }, "fast");
		var detail_jq = MOEBATTLEUI.showDetail(card, "card");
		if (undefined === detail_jq) {
			console.warn("fail to drawCardAnima");
			return;
		}
	}, function () {
		// move back
		$(this).css("z-index", 0);
		//$(this).animate({ height: "-=20px", width: "-=20px", left: "+=10px", top: "+=10px" }, "fast");
		MOEBATTLEUI.hideDetail();
	});
	-- MOEBATTLEUI.AnimaCount;
	return $("#" + MOEPROJ.config.canvas + " #card-" + card);
};
// drop a card into board
MOEBATTLEUI.cardDrop = function (card) {
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
			MOEBATTLE.actions.unshift({
				type: "cardUseWithTarget",
				card: card,
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
MOEBATTLEUI.cardDraw = function (player, card, from) {
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
				var card_jquery = MOEBATTLEUI.createCard(card);
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
MOEBATTLEUI.cardUseWithoutTarget = function (card) {
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
MOEBATTLEUI.cardAddToArea = function (card, player) {
	++ MOEBATTLEUI.AnimaCount;
	// shrink to image size
	var height = $("#" + MOEPROJ.config.canvas + " #card-" + card + " img").height();
	var width = $("#" + MOEPROJ.config.canvas + " #card-" + card + " img").width();
	// fit to max-, min-height, width
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
	MOEBATTLEUI.moveToAreaAnima(card, player, height, width);
	-- MOEBATTLEUI.AnimaCount;
}
MOEBATTLEUI.moveToAreaAnima = function (card, player, height, width) {
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
		MOEBATTLEUI.createIcon(player, card, height, width);
		MOEBATTLEUI.skillAnimate(card, "skill0");
		-- MOEBATTLEUI.AnimaCount;
	});
}

// character

// animation when creating an icon
MOEBATTLEUI.createIcon = function (player, card, height, width) {
	++ MOEBATTLEUI.AnimaCount;
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
	area_jq.append(' \
		<div id="icon-' + card + '" class="icon myuse" style="height: ' + height + 'px; width: ' + width + 'px;"> \
			<span></span> \
			<img src="" alt="icon" class="" /> \
			<div class="cost param"></div> \
			<div class="def param"></div> \
			<div class="atk param"></div> \
			<div class="card-hp param"></div> \
		</div> \
	');
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " img").attr("src", MOEBATTLE.cards[card].photo).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.atk").html(MOEBATTLE.cards[card].atk || 0);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.def").html(MOEBATTLE.cards[card].def || 0);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.card-hp").html(MOEBATTLE.cards[card].hp || 0);
	$("#" + MOEPROJ.config.canvas + " #icon-" + card + " div.cost").html(MOEBATTLE.cards[card].cost || 0);
	var timer, timer2, degree = 0;
	// rotate when hovering
	var rotate = function (obj) {
		$(obj).css({ WebkitTransform: 'rotate(' + degree + 'deg)' });
		$(obj).css({ '-moz-transform': 'rotate(' + degree + 'deg)' });
		timer = setTimeout(function () {
			++ degree; rotate(obj);
		}, 5);
	}
	var icon_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + card);
	icon_jq.hover(function (obj) {
		MOEBATTLEUI.select.target = card;
		MOEBATTLEUI.select.type = "icon";
		MOEBATTLEUI.select.time = new Date();
		$(this).css("z-index", 1);
		var detail_jq = MOEBATTLEUI.showDetail(card, "icon");
		if (undefined === detail_jq) {
			console.warn("fail to drawCardAnima");
			return;
		}
		/*rotate(obj.currentTarget);
		if (! timer2) {
			// show detail after hovering
			timer2 = setTimeout(function () {
				timer2 = null;
				MOEBATTLEUI.showDetail(card, "icon");
			}, 1000);
		}*/
	}, function (obj) {
		MOEBATTLEUI.select.target = undefined;
		MOEBATTLEUI.select.type = undefined;
		$(this).css("z-index", 0);
		MOEBATTLEUI.hideDetail();
		/*clearTimeout(timer);
		// move back
		degree = 0;
		$(obj.currentTarget).css({ WebkitTransform: 'rotate(0deg)' });
		$(obj.currentTarget).css({ '-moz-transform': 'rotate(0deg)' });
		if (timer2) {
			clearTimeout(timer2);
			timer2 = null;
		}*/
	});
	icon_jq.on("click", function () {
		if (undefined === MOEBATTLEUI.select.target) {
			return;
		}
		//actions.push({type: "strike", from: card, to: MOEBATTLEUI.select.target});
		var arrow = new MOEBATTLEUI.Arrow(icon_jq, function (from, to) {
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
	$("#" + MOEPROJ.config.canvas + ' #icon-' + card).hide().css({visibility: "inherit"}).fadeIn("fast", function () {
		-- MOEBATTLEUI.AnimaCount;
	});
	return $("#" + MOEPROJ.config.canvas + ' #icon-' + card);
};

// skill

// animate for a skill
MOEBATTLEUI.skillAnimate = function (card, skill) {
	// invalid
	if (! (card in MOEBATTLE.cards) || undefined === MOEBATTLE.cards[card].anime || undefined === MOEBATTLE.cards[card].anime[skill]) {
		return;
	}
	++ MOEBATTLEUI.AnimaCount;
	var ani_list = MOEBATTLE.cards[card].anime[skill];
	// choose one by random
	var ran = Math.floor( (Math.random() * ani_list.length) );
	$("#" + MOEPROJ.config.canvas + ' #anime img').attr("src", ani_list[ran]);
	$("#" + MOEPROJ.config.canvas + ' #anime').addClass("active").fadeIn("fast").show();
	// disappear after a while
	setTimeout(function () {
		$("#" + MOEPROJ.config.canvas + ' #anime').fadeOut("slow", function () {
			$(this).removeClass("active");
			$("#" + MOEPROJ.config.canvas + ' #anime img').attr("src", "");
			-- MOEBATTLEUI.AnimaCount;
		});
	}, 30);
}

// status

// animation when creating an icon
MOEBATTLEUI.createStatus = function (player, status) {
	++ MOEBATTLEUI.AnimaCount;
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
	area_jq.append(' \
		<div id="status-' + status + '" class="status myuse"> \
			<img src="" alt="status" class="" /> \
		</div> \
	');
	$("#" + MOEPROJ.config.canvas + " #status-" + status + " img").attr("src", MOEBATTLE.battle.status[status].photo).error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	var status_jq = $("#" + MOEPROJ.config.canvas + " #status-" + status);
	status_jq.hover(function (obj) {
		MOEBATTLEUI.select.target = status;
		MOEBATTLEUI.select.type = "status";
		MOEBATTLEUI.select.time = new Date();
		$(this).css("z-index", 1);
		var detail_jq = MOEBATTLEUI.showDetail(status, "status");
		if (undefined === detail_jq) {
			console.warn("fail to drawCardAnima");
			return;
		}
	}, function (obj) {
		MOEBATTLEUI.select.target = undefined;
		MOEBATTLEUI.select.type = undefined;
		$(this).css("z-index", 0);
		MOEBATTLEUI.hideDetail();
	});
	$("#" + MOEPROJ.config.canvas + ' #status-' + status).hide().css({visibility: "inherit"}).fadeIn("fast", function () {
		-- MOEBATTLEUI.AnimaCount;
	});
	return $("#" + MOEPROJ.config.canvas + ' #status-' + status);
};














