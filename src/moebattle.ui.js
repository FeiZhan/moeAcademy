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
<div id="arrow"> \
	<canvas /> \
</div> \
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
	// arrow canvas
	var arrow = $("#" + MOEPROJ.config.canvas + " #arrow canvas")[0].getContext('2d');
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
};

MOEBATTLEUI.AnimaCount = 0;
MOEBATTLEUI.detail_lock = false;
// show detail canvas
MOEBATTLEUI.showDetail = function (card, dir) {
	if (MOEBATTLEUI.detail_lock) {
		return;
	}
	MOEBATTLEUI.detail_lock = true;
	$("#" + MOEPROJ.config.canvas + " #detail .name").html(MOEBATTLE.cards[card].name);
	$("#" + MOEPROJ.config.canvas + " #detail .cost").html("cost: " + (MOEBATTLE.cards[card].cost || 0));
	$("#" + MOEPROJ.config.canvas + " #detail .atk").html("moe point: " + (MOEBATTLE.cards[card].atk || 0));
	$("#" + MOEPROJ.config.canvas + " #detail .card-hp").html("hp: " + (MOEBATTLE.cards[card].hp || 0));
	$("#" + MOEPROJ.config.canvas + " #detail img").attr("src", MOEBATTLE.cards[card].photo || "");
	$("#" + MOEPROJ.config.canvas + " #detail .card-detail").html(MOEBATTLE.cards[card].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
	var detail_jq = $("#" + MOEPROJ.config.canvas + " #detail")
	detail_jq.show().css("visibility", "inherit");
	var card_jq = $("#" + MOEPROJ.config.canvas + " #card-" + card);
	if (0 == card_jq.length) {
		card_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + card);
	}
	if (0 == card_jq.length) {
		return $("#" + MOEPROJ.config.canvas + " #detail");
	}
	++ MOEBATTLEUI.AnimaCount;
	if (undefined === dir || "auto" == dir) {
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
	case "up":
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
	case "down":
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
	case "left":
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
	case "right":
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
	return $("#" + MOEPROJ.config.canvas + " #detail");
}
MOEBATTLEUI.arrow = {
	status: "idle",
};
MOEBATTLEUI.arrowFollow = function (card, func) {
	if ("follow" == MOEBATTLEUI.arrow.status) {
		return;
	}
	// card center position
	var card_jq = $("#" + MOEPROJ.config.canvas + " #card-" + card);
	if (0 == card_jq.length) {
		card_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + card);
	}
	if (0 == card_jq.length) {
		return;
	}
	++ MOEBATTLEUI.AnimaCount;
	MOEBATTLEUI.arrow.status = "follow";
	var y = card_jq.position().top + card_jq.height() / 2;
	var x = card_jq.position().left + card_jq.width() / 2;
	var parent = card_jq.parent();
	while (undefined !== parent && parent.attr('id') != MOEPROJ.config.canvas) {
		x += parent.position().left;
		y += parent.position().top;
		parent = parent.parent();
	}
	// draw an arrow following mouse
	var arrow_follow = function (event) {
		var pagex = event.pageX - $("#" + MOEPROJ.config.canvas).offset().left;
		var pagey = event.pageY - $("#" + MOEPROJ.config.canvas).offset().top;
		var dist = Math.sqrt((pagex - x) * (pagex - x) + (pagey - y) * (pagey - y));
		var newx = (pagex + x) / 2 - 25;
		var newy = (pagey + y) / 2 - dist / 2;
		// the length is the dist
		$("#" + MOEPROJ.config.canvas + " #arrow").height(dist);
		var angle = Math.atan2(pagey - y, pagex - x) * 180 / Math.PI + 90;
		$("#" + MOEPROJ.config.canvas + " #arrow").css({
			top: newy,
			left: newx
		})
		// rotate
		.css({ WebkitTransform: 'rotate(' + angle + 'deg)' }).css({ '-moz-transform': 'rotate(' + angle + 'deg)' })
		.css({visibility: "inherit"}).show();
	};
	var page_click_use_card = function () {
		if (card == MOEBATTLEUI.selectedIcon) {
			return;
		}
		if (undefined === MOEBATTLEUI.selectedIcon) {
		}
		// remove arrow
		$("html").off('mousemove', arrow_follow).off("click", page_click_use_card);
		$("#" + MOEPROJ.config.canvas + " #arrow").hide();
		MOEBATTLEUI.arrow.status = "idle";
		if (typeof func == "function") {
			func(card, MOEBATTLEUI.selectedIcon);
		}
		-- MOEBATTLEUI.AnimaCount;
	};
	// set arrow to follow mouse
	$("html").on("mousemove", arrow_follow)
	// click anywhere to stop the arrow
	.on("click", page_click_use_card);
}

// game

MOEBATTLEUI.gameOver = function () {
	console.log("game over");
};

// player

// prepare player layout
MOEBATTLEUI.playerPrepare = function (player) {
	++ MOEBATTLEUI.AnimaCount;
	if (0 == player) {
		var span = $("#" + MOEPROJ.config.canvas + ' #myhead .hp span');
		$(span[0]).html(MOEBATTLE.players[player].hp);
		$(span[1]).html(MOEBATTLE.players[player].maxhp);
		span = $("#" + MOEPROJ.config.canvas + ' #myhead .mp span');
		$(span[0]).html(MOEBATTLE.players[player].mp);
		$(span[1]).html(MOEBATTLE.players[player].maxmp);
	}
	else if (1 == player) {
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
	if (0 == target) {
		$("#" + MOEPROJ.config.canvas + ' #mystatusarea').append('<div id="status-' + status + '" class="status" />');
	}
	else {
		$("#" + MOEPROJ.config.canvas + ' #yourstatusarea').append('<div id="status-' + status + '" class="status" />');
	}
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
		var detail_jq = MOEBATTLEUI.showDetail(card);
		if (undefined === detail_jq) {
			console.warn("fail to drawCardAnima");
			return;
		}
	}, function () {
		// move back
		$(this).css("z-index", 0);
		//$(this).animate({ height: "-=20px", width: "-=20px", left: "+=10px", top: "+=10px" }, "fast");
		$("#" + MOEPROJ.config.canvas + " #detail")
		.animate({
			top: '+=400px',
			height: '0px',
		}, "fast", function () {
			$(this).hide();
		MOEBATTLEUI.detail_lock = false;
			
		});
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
		MOEBATTLEUI.arrowFollow(card, function () {
			// if no target, put it back
			if (undefined === MOEBATTLEUI.selectedIcon) {
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
				target: MOEBATTLEUI.selectedIcon,
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
	var detail_jq = MOEBATTLEUI.showDetail(card);
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

MOEBATTLEUI.selectedIcon = undefined;
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
			<div class="cost"></div> \
			<div class="def"></div> \
			<div class="atk"></div> \
			<div class="card-hp"></div> \
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
		MOEBATTLEUI.selectedIcon = card;
		$(this).css("z-index", 1);
		var detail_jq = MOEBATTLEUI.showDetail(card);
		if (undefined === detail_jq) {
			console.warn("fail to drawCardAnima");
			return;
		}
		/*rotate(obj.currentTarget);
		if (! timer2) {
			// show detail after hovering
			timer2 = setTimeout(function () {
				timer2 = null;
				MOEBATTLEUI.showDetail(card);
			}, 1000);
		}*/
	}, function (obj) {
		MOEBATTLEUI.selectedIcon = undefined;
		$(this).css("z-index", 0);
		$("#" + MOEPROJ.config.canvas + " #detail")
		.animate({
			//left: '+=240px',
			width: '0px'
		}, "fast", function () {
			$(this).hide();
			MOEBATTLEUI.detail_lock = false;
		});
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
		if (undefined === MOEBATTLEUI.selectedIcon) {
			return;
		}
		//actions.push({type: "strike", from: card, to: MOEBATTLEUI.selectedIcon});
		MOEBATTLEUI.arrowFollow(card, function (from, to) {
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
