
// moegirl battle

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
var MOEBATTLE = MOEPROJ.MOEBATTLE;

MOEBATTLE.ui;
MOEBATTLE.data = ['data/battle.json'];
MOEBATTLE.load = function (canvas) {
	// set ui
	MOEBATTLE.ui = MOEPROJ.MOEBATTLEUI;
	MOEBATTLE.ui.init(canvas);
	MOEPROJ.load({
		canvas: canvas,
		html: MOEBATTLE.ui.html,
		data: MOEBATTLE.data,
	}, MOEBATTLE.run, MOEBATTLE.loadData);
};
// callback for loading json data
MOEBATTLE.loadData = function (data) {
	MOEBATTLE.battle = data;
	MOEBATTLE.cards = MOEBATTLE.cards.concat(data.cards);
};
// run when loading completes
MOEBATTLE.run = function () {
	MOEBATTLE.ui.load();
	// execute based on action list
	MOEBATTLE.actions.push({ type: "gameStart" });
	// check next action periodically
	setInterval(function () {
		MOEBATTLE.nextAction();
	}, 100);
};

MOEBATTLE.game = {
	// orders for each player
	orders: [0, 1],
	// cards in deck
	deck: new Array(),
	// cards in discard deck
	discard: new Array(),
	round_count: 0,
	shuffle_count: 0,
	// current player
	current: -1,
};
MOEBATTLE.battle = new Array();
MOEBATTLE.cards = new Array();
MOEBATTLE.players = [
	{
		name: "me",
		order: 0,
		maxhp: 20,
		hp: 20,
		maxmp: 0,
		mp: 0,
		hands: [],
		area: [],
		status: [],
		equip: [],
	}, {
		name: "opponent",
		order: 1,
		maxhp: 20,
		hp: 20,
		maxmp: 0,
		mp: 0,
		hands: [],
		area: [],
		status: [],
		equip: [],
	}
];

MOEBATTLE.actions = new Array();
// execute the next action
MOEBATTLE.nextAction = function () {
	// no more actions or locked
	if (0 == MOEBATTLE.actions.length || MOEBATTLE.ui.AnimaCount > 0) {
		return;
	}
	var action = MOEBATTLE.actions.shift();
	// invalid action
	if (undefined === action.type) {
		return;
	}
	console.debug(action.type)
	if ("function" == typeof MOEBATTLE[action.type]) {
		MOEBATTLE[action.type] (action);
	}
}

// game

// game start
MOEBATTLE.gameStart = function (action) {
	// prepare players
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.ui.playerPrepare(i);
	}
	// prepare discard deck
	MOEBATTLE.game.discard = new Array();
	// init shuffle cards in deck
	MOEBATTLE.game.deck = new Array();
	for (var i in MOEBATTLE.cards) {
		MOEBATTLE.game.deck.push(i);
	}
	MOEBATTLE.shuffle(MOEBATTLE.game.deck);

	var new_actions = new Array();
	new_actions.push({
		type: "playersShuffle"
	});
	// deal initial cards
	for (var i in MOEBATTLE.game.orders) {
		new_actions.push({
			type: "cardsDraw",
			number: 1,
			target: MOEBATTLE.game.orders[i]
		});
	}
	MOEBATTLE.actions = new_actions.concat(MOEBATTLE.actions);
	// the first player
	MOEBATTLE.actions.push({
		type: "playerStart",
	});
};
// game over
MOEBATTLE.gameOver = function (action) {
	MOEBATTLE.ui.gameOver();
}
MOEBATTLE.gamePause = function (action) {
}
MOEBATTLE.gamePause = function (action) {
}
MOEBATTLE.gameWin = function (action) {
}
MOEBATTLE.gameLose = function (action) {
}
MOEBATTLE.gameDraw = function (action) {
}

// deck

MOEBATTLE.deckShuffle = function (action) {
	MOEBATTLE.shuffle(MOEBATTLE.game.deck);
	++ MOEBATTLE.game.shuffle_count;
}
// shuffle array
MOEBATTLE.shuffle = function (arr) {
	for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
	{}
};
// prepare deck
MOEBATTLE.deckPrepare = function (action) {
	MOEBATTLE.game.deck = MOEBATTLE.game.deck.concat(MOEBATTLE.game.discard);
	MOEBATTLE.game.discard = new Array();
	MOEBATTLE.actions.unshift({
		type: "deckShuffle"
	});
};

// player

MOEBATTLE.playersShuffle = function (action) {
	// shuffle player orders
	MOEBATTLE.game.orders = new Array();
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.game.orders.push(i);
	}
	MOEBATTLE.shuffle(MOEBATTLE.game.orders);
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.players[i].order = MOEBATTLE.game.orders[i];
	}
}
// player start
MOEBATTLE.playerStart = function (action) {
	// add current player number by one
	++ MOEBATTLE.game.current;
	if (MOEBATTLE.game.current >= MOEBATTLE.players.length) {
		MOEBATTLE.game.current %= MOEBATTLE.players.length;
		++ MOEBATTLE.game.round_count;
	}
	MOEBATTLE.ui.playerStart();
	if (MOEBATTLE.players[MOEBATTLE.game.current].maxmp < 10) {
		MOEBATTLE.actions.unshift({
			type: "playerGainMP",
			target: MOEBATTLE.game.current,
			number: 1,
		});
		MOEBATTLE.actions.unshift({
			type: "playerChangeMaxMP",
			target: MOEBATTLE.game.current,
			number: MOEBATTLE.players[MOEBATTLE.game.current].maxmp + 1,
		});
	}
	MOEBATTLE.actions.push({
		type: "cardsDraw",
		number: 1,
		target: MOEBATTLE.game.current
	});
}
// switch to next player
MOEBATTLE.playerEnd = function (action) {
	MOEBATTLE.ui.playerEnd();
	MOEBATTLE.actions.push({
		type: "playerStart",
	});
};
MOEBATTLE.playerChange = function (action) {
}
MOEBATTLE.playerDie = function (action) {
}
MOEBATTLE.playerRevive = function (action) {
}
MOEBATTLE.playerLoseHP = function (action) {
	MOEBATTLE.players[action.target].hp -= action.number;
	MOEBATTLE.ui.playerChangeHP(action.target, MOEBATTLE.players[action.target].hp);
}
MOEBATTLE.playerGainHP = function (action) {
	MOEBATTLE.players[action.target].hp += action.number;
	MOEBATTLE.ui.playerChangeHP(action.target, MOEBATTLE.players[action.target].hp);
}
MOEBATTLE.playerChangeMaxHP = function (action) {
	MOEBATTLE.players[action.target].maxhp = action.number;
	MOEBATTLE.ui.playerChangeMaxHP(action.target, action.number);
}
MOEBATTLE.playerLoseMP = function (action) {
	MOEBATTLE.players[action.target].mp -= action.number;
	MOEBATTLE.ui.playerChangeMP(action.target, MOEBATTLE.players[action.target].mp);
}
MOEBATTLE.playerGainMP = function (action) {
	MOEBATTLE.players[action.target].mp += action.number;
	MOEBATTLE.ui.playerChangeMP(action.target, MOEBATTLE.players[action.target].mp);
}
MOEBATTLE.playerChangeMaxMP = function (action) {
	MOEBATTLE.players[action.target].maxmp = action.number;
	MOEBATTLE.ui.playerChangeMaxMP(action.target, action.number);
}
MOEBATTLE.playerLoseStatus = function (action) {
	MOEBATTLE.players[action.target].status.splice(MOEBATTLE.players[action.target].status.indexOf(action.status), 1);
	MOEBATTLE.ui.playerLoseStatus(action.target, action.status);
}
MOEBATTLE.playerGainStatus = function (action) {
	// duplicate status
	if ( MOEBATTLE.players[action.target].status.indexOf(action.status) >= 0 ) {
		//return;
	}
	MOEBATTLE.players[action.target].status.push(action.status);
	MOEBATTLE.ui.playerGainStatus(action.target, action.status);
}
MOEBATTLE.playerGainEquip = function (action) {
}

// card

// draw cards
MOEBATTLE.cardsDraw = function (action) {
	// invalid
	if (action.number <= 0 || action.target < 0 || action.target >= MOEBATTLE.players.length) {
		return;
	}
	if (action.number > MOEBATTLE.game.deck.length) {
		// put discard deck back to deck
		MOEBATTLE.deckPrepare();
	}
	// still not enough
	if (action.number > MOEBATTLE.game.deck.length) {
		MOEBATTLE.actions.unshift({
			type: "gameOver",
		});
		return;
	}
	// for each card
	for (var i = 0; i < action.number; ++ i) {
		MOEBATTLE.actions.unshift({
			type: "cardDraw",
			target: action.target,
			from: action.from,
		});
	}
};
// draw a card
MOEBATTLE.cardDraw = function (action) {
	// get a card from deck
	var card = MOEBATTLE.game.deck.pop();
	// give to a player
	MOEBATTLE.players[action.target].hands.push(card);
	MOEBATTLE.ui.cardDraw(action.target, card, action.from);
}
MOEBATTLE.cardDiscard = function (action) {
}
// use a card
MOEBATTLE.cardUse = function (action) {
	// remove card from player
	MOEBATTLE.players[action.from].hands.splice(MOEBATTLE.players[action.from].hands.indexOf(action.card), 1);
	switch(MOEBATTLE.cards[action.card].type) {
	case "character": // put into player's area
		MOEBATTLE.actions.unshift({
			type: "cardAddToArea",
			card: action.card,
			from: action.from,
		});
		break;
	case "effect":
	default: // use immediately
		MOEBATTLE.actions.unshift({
			type: "cardUseWithoutTarget",
			from: action.from,
			card: action.card,
		});
		break;
	}
}
// add a card to player's area
MOEBATTLE.cardAddToArea = function (action) {
	MOEBATTLE.players[action.from].area.push(action.card);
	MOEBATTLE.ui.cardAddToArea(action.card, action.from);
};
// use a card without target
MOEBATTLE.cardUseWithoutTarget = function (action) {
	if ("skill" in MOEBATTLE.cards[action.card]) {
		var func = MOEPROJ.getFunctionFromString( MOEBATTLE.cards[action.card].skill );
		if ("function" == typeof func) {
			func(action);
		}
	}
	MOEBATTLE.game.discard.push(action.card);
	MOEBATTLE.ui.cardUseWithoutTarget(action.card);
}
MOEBATTLE.cardUseWithTarget = function (action) {
	if ("skill" in MOEBATTLE.cards[action.card]) {
		var func = MOEPROJ.getFunctionFromString( MOEBATTLE.cards[action.card].skill );
		if ("function" == typeof func) {
			func(action);
		}
	}
	MOEBATTLE.game.discard.push(action.card);
	MOEBATTLE.ui.cardUseWithoutTarget(action.card);
};

// character

MOEBATTLE.charLoseHP = function (action) {
	MOEBATTLE.players[action.target].hp -= action.number;
	MOEBATTLE.ui.playerChangeHP(action.target, MOEBATTLE.players[action.target].hp);
}
MOEBATTLE.charGainHP = function (action) {
	MOEBATTLE.players[action.target].hp += action.number;
	MOEBATTLE.ui.playerChangeHP(action.target, MOEBATTLE.players[action.target].hp);
}
MOEBATTLE.charLoseStatus = function (action) {
	MOEBATTLE.players[action.target].status.splice(MOEBATTLE.players[action.target].status.indexOf(action.status), 1);
	MOEBATTLE.ui.playerLoseStatus(action.target, action.status);
}
MOEBATTLE.charGainStatus = function (action) {
	// duplicate status
	if ( MOEBATTLE.players[action.target].status.indexOf(action.status) >= 0 ) {
		//return;
	}
	MOEBATTLE.players[action.target].status.push(action.status);
	MOEBATTLE.ui.playerGainStatus(action.target, action.status);
}

// moegirl battle skills

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
MOEPROJ.MOEBATTLE.SKILLS = MOEPROJ.MOEBATTLE.SKILLS || new Object();
var SKILLS = MOEPROJ.MOEBATTLE.SKILLS;

SKILLS.loseHP = function (action) {
	MOEBATTLE.actions.unshift({
		type: "playerLoseHP",
		target: action.from ? 0 : 1,
		number: 1,
	});
}
SKILLS.charLoseHP = function (action) {
	MOEBATTLE.actions.unshift({
		type: "charLoseHP",
		target: action.target,
		number: 1,
		card: action.card,
	});
}
SKILLS.drawCard = function (action) {
	MOEBATTLE.actions.unshift({
		type: "cardsDraw",
		target: action.from,
		number: 2,
	});
}
SKILLS.gainPositiveStatus = function (action) {
	MOEBATTLE.actions.unshift({
		type: "playerGainStatus",
		target: action.from,
		status: 0,
	});
}

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
MOEBATTLEUI.showDetail = function (card, type, dir) {
	// only one detail canvas can be displayed
	if (MOEBATTLEUI.detail_lock) {
		return;
	}
	MOEBATTLEUI.detail_lock = true;
	var card_jq;
	switch (type) {
	case "icon":
		card_jq = $("#" + MOEPROJ.config.canvas + " #icon-" + card);
		break;
	case "status":
		card_jq = $("#" + MOEPROJ.config.canvas + " #status-" + card);
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
	MOEBATTLEUI.addDetailContent(card, type);
	var detail_jq = $("#" + MOEPROJ.config.canvas + " #detail");
	detail_jq.show().css("visibility", "inherit");
	// hover to prevent hiding
	// start animation
	++ MOEBATTLEUI.AnimaCount;
	MOEBATTLEUI.chooseDetailDir(detail_jq, dir, card_jq);
	return $("#" + MOEPROJ.config.canvas + " #detail");
}
// add content to detail canvas
MOEBATTLEUI.addDetailContent = function (card, type) {
	switch (type) {
	case "status":
		$("#" + MOEPROJ.config.canvas + " #detail .name").html(MOEBATTLE.battle.status[status].name);
		$("#" + MOEPROJ.config.canvas + " #detail img").attr("src", MOEBATTLE.battle.status[status].photo || "");
		$("#" + MOEPROJ.config.canvas + " #detail .card-detail").html(MOEBATTLE.battle.status[status].detail || "detaildetaildetaildetaildetaildetaildet aildetaildetaildetaildetaildetaildetaildetaildetaild etaildetaildetaildetaildetaildetaildetaildetaildeta ildetaildetail");
		break;
	case "card":
	case "icon":
	default:
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
		MOEBATTLEUI.selectedIcon = undefined;
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

// status

MOEBATTLEUI.selectedStatus = undefined;
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
		MOEBATTLEUI.selectedStatus = status;
		$(this).css("z-index", 1);
		var detail_jq = MOEBATTLEUI.showDetail(status, "status");
		if (undefined === detail_jq) {
			console.warn("fail to drawCardAnima");
			return;
		}
	}, function (obj) {
		MOEBATTLEUI.selectedStatus = undefined;
		$(this).css("z-index", 0);
		MOEBATTLEUI.hideDetail();
	});
	$("#" + MOEPROJ.config.canvas + ' #status-' + status).hide().css({visibility: "inherit"}).fadeIn("fast", function () {
		-- MOEBATTLEUI.AnimaCount;
	});
	return $("#" + MOEPROJ.config.canvas + ' #status-' + status);
};














