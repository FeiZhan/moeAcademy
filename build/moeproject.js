
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
	case "card":
	default:
		card_jq = $("#" + MOEPROJ.config.canvas + " #card-" + card);
		break;
	}
	// invalid parent card
	if (0 == card_jq.length) {
		return $("#" + MOEPROJ.config.canvas + " #detail");
	}
	// start animation
	++ MOEBATTLEUI.AnimaCount;
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
// hide detail canvas
MOEBATTLEUI.hideDetail = function () {
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
		$("#" + MOEPROJ.config.canvas + " #detail")
		.animate({
			//left: '+=240px',
			width: '0px'
		}, "fast", function () {
			$(this).hide();
			MOEBATTLEUI.detail_lock = false;
		});
	});
	$("#" + MOEPROJ.config.canvas + ' #status-' + status).hide().css({visibility: "inherit"}).fadeIn("fast", function () {
		-- MOEBATTLEUI.AnimaCount;
	});
	return $("#" + MOEPROJ.config.canvas + ' #status-' + status);
};















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

// moegirl craft

MOEPROJ.MOECRAFT = MOEPROJ.MOECRAFT || new Object();
var MOECRAFT = MOEPROJ.MOECRAFT;

MOECRAFT.ui;
MOECRAFT.data = ['data/craft.json'];
MOECRAFT.load = function (canvas) {
	// set ui
	MOECRAFT.ui = MOEPROJ.MOECRAFTUI;
	MOECRAFT.ui.init(canvas);
	MOEPROJ.load({
		canvas: canvas,
		html: MOECRAFT.ui.html,
		data: MOECRAFT.data,
	}, MOECRAFT.run, MOECRAFT.loadData);
};
// callback for loading json data
MOECRAFT.loadData = function (data) {
	MOECRAFT.craft = MOECRAFT.craft.concat(data.formula);
	// extract card list from inputs and outputs of formulas
	for (var j in data.formula)
	{
		for (var k in data.formula[j])
		{
			if ("input" == k)
			{
				MOECRAFT.cards = MOECRAFT.cards.concat(data.formula[j][k]);
			}
			else if ("output" == k)
			{
				MOECRAFT.cards = MOECRAFT.cards.concat(data.formula[j][k]);
			}
		}
	}
};
// run when loading completes
MOECRAFT.run = function () {
	// sort formulas
	for (var i in MOECRAFT.craft) {
		if ("input" in MOECRAFT.craft[i]) {
			MOECRAFT.craft[i].input.sort();
		}
		if ("output" in MOECRAFT.craft[i]) {
			MOECRAFT.craft[i].output.sort();
		}
	}
	// prepare ui
	MOECRAFT.ui.load();
	// game starts
	for (var i = 0; i < 5; ++ i)
	{
		MOECRAFT.drawRandom();
	}
};
// craft formulas
MOECRAFT.craft = new Array();
// all cards
MOECRAFT.cards = new Array();
// cards on the table
MOECRAFT.table = new Array();
// the last of card id
MOECRAFT.lastId = 0;
// cards on the hand
MOECRAFT.myCards = new Object();
// draw a random card
MOECRAFT.drawRandom = function () {
	var r = Math.random();
	var num = Math.floor(r * MOECRAFT.cards.length);
	var card = {
		id: ++ MOECRAFT.lastId,
		num: num,
		name: MOECRAFT.cards[num],
		status: "hand",
	};
	MOECRAFT.myCards[card.id] = card;
	MOECRAFT.ui.drawCard(card);
	return card;
}
MOECRAFT.putCardOnTable = function (card_id) {
	card_id = parseInt(card_id.substr(5));
	MOECRAFT.myCards[card_id].status = "table";
	MOECRAFT.table.push(card_id);
}
MOECRAFT.takeCardBack = function (card_id) {
	card_id = parseInt(card_id.substr(5));
	var index = MOECRAFT.table.indexOf(card_id);
	MOECRAFT.table.splice(index, 1);
	MOECRAFT.myCards[card_id].status = "hand";
}
// do the crafting
MOECRAFT.doCraft = function () {
	// sort the input cards
	var inputs = new Array();
	for (var i in MOECRAFT.table) {
		inputs.push(MOECRAFT.myCards[ MOECRAFT.table[i] ].name);
	}
	inputs.sort();
	// find a suitable formula
	for (var i in MOECRAFT.craft)
	{
		if (MOECRAFT.craft[i].input.length != inputs.length) {
			continue;
		}
		var flag = true;
		for (var j in MOECRAFT.craft[i].input) {
			if (MOECRAFT.craft[i].input[j] != inputs[j]) {
				flag = false;
				break;
			}
		}
		// find
		if (flag) {
			var input = $.extend(true, [], MOECRAFT.table);
			MOECRAFT.table = new Array();
			// the cards on the table become the output cards
			for (var j in MOECRAFT.craft[i].output) {
				var card = {
					id: ++ MOECRAFT.lastId,
					num: -1,
					name: MOECRAFT.craft[i].output[j],
					status: "table",
				};
				MOECRAFT.myCards[card.id] = card;
				MOECRAFT.table.push(card.id);
			}
			MOECRAFT.ui.doCraft(input, MOECRAFT.table);
			break;
		}
	}
};

// moegirl craft ui

MOEPROJ.MOECRAFTUI = MOEPROJ.MOECRAFTUI || new Object();
var MOECRAFTUI = MOEPROJ.MOECRAFTUI;

MOECRAFTUI.html = ' \
	<div id="table"></div> \
	<div id="hand"></div> \
	<a href="#" id="craftbutton">craft</a> \
	<a href="#" id="drawbutton">drawCards</a> \
	<a href="#" id="peek">peek</a> \
	<span id="formula"></span> \
';
MOECRAFTUI.init = function (canvas) {
	document.title = "萌娘合成";
	$("#" + canvas).addClass("moecraft");
};
MOECRAFTUI.load = function () {
	// drop callback for table
	$("#" + MOEPROJ.config.canvas + ' #table').droppable({
		drop: function( event, ui ) {
			MOECRAFT.putCardOnTable(ui.draggable[0].id);
			// move card to table
			var element = $(ui.draggable[0]).detach();
			$("#" + MOEPROJ.config.canvas + ' #table').append(element);
		},
		out: function(event, ui) {
			MOECRAFT.takeCardBack(ui.draggable[0].id);
		},
    });
    // craft button callback
	$("#craftbutton").click(function () {
		MOECRAFT.doCraft();
	});
    // draw button callback
	$("#drawbutton").click(function () {
		MOECRAFT.drawRandom();
	});
    // draw button callback
	$("#peek").click(MOECRAFTUI.peekFormula);
};
MOECRAFTUI.drawCard = function (card) {
	$("#" + MOEPROJ.config.canvas + ' #hand').append('<div id="card-' + card.id + '" class="card">' + card.name + '</div>');
	var card_jq = $("#" + MOEPROJ.config.canvas + ' #card-' + card.id);
	card_jq.draggable({
		stop: function (evt, ui) {
			card_id = evt.target.id.substr(5);
			if ("hand" == MOECRAFT.myCards[card_id].status) {
				// move card to hand
				var element = $(evt.target).detach();
				$("#" + MOEPROJ.config.canvas + ' #hand').append(element);
			}
			// move back, no matter where it belongs
			$(evt.target).css({
				top: '0px',
				left: '0px',
			});
		}
	});
	return card_jq;
};
MOECRAFTUI.doCraft = function (input, output) {
	// remove inputs
	$('.moecraft #table .card').remove();
	// generate output cards
	for (var j in output) {
		var jq = MOECRAFTUI.drawCard( MOECRAFT.myCards[output[j]] );
		// move card to table
		var element = jq.detach();
		$("#" + MOEPROJ.config.canvas + ' #table').append(element);
	}
};
MOECRAFTUI.peekFormula = function () {
	var r = Math.floor( (Math.random() * MOECRAFT.craft.length) );
	var formula = "";
	for (var i in MOECRAFT.craft[r].input) {
		if (i > 0) {
			formula += " + ";
		}
		formula += MOECRAFT.craft[r].input[i];
	}
	$("#formula").html(formula);
};

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
	files: new Object(),
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
		MOECASC.load("cascade");
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
	else { // already done, don't load again
		// special case: filenames
		if ("filenames.json" == file.slice(-14)) {
			var data = MOEPROJ.config.files[file];
			for (var i = 0; i < data.length; ++ i) {
				var file1 = file.substring(0, file.length - 14) + "raw/" + data[i];
				if (file1 in MOEPROJ.config.files) {
					// run it again
					func(MOEPROJ.config.files[file1]);
				}
			}
		}
		else {
			func(MOEPROJ.config.files[file]);
		}
		return;
	}
	if (".js" == file.substr(file.length - 3)) {
		// load a js script
		$.getScript(file)
			.done(function( script, textStatus ) {
				MOEPROJ.config.files[file] = script;
				// set file as ready
				MOEPROJ.config.ready[file] = true;
				console.log("load", file);
				// call callback
				return func(script, textStatus);
			})
			.fail(function( jqxhr, settings, exception ) {
				// fail also ready
				MOEPROJ.config.ready[file] = true;
				console.error(exception);
			});
	}
	else if (".css" == file.substr(file.length - 4)) {
		// load a css
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', file) );
		MOEPROJ.config.files[file] = "css";
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
	// define a new file index
	if (! (file in MOEPROJ.config.ready)) {
		MOEPROJ.config.ready[file] = false;
	}
	$.getJSON(file, function(data, textStatus, jqXHR) {
		MOEPROJ.config.files[file] = data;
		// set file as ready
		MOEPROJ.config.ready[file] = true;
		// don't show moegirls' name
		if ("data/raw" != file.substr(0, 8)) {
			console.log("load", file);
		}
		// special case: filenames
		if ("filenames.json" == file.slice(-14)) {
			for (var i = 0; i < data.length && i < 700; ++ i) {
				// load again
				MOEPROJ.loadJson(file.substring(0, file.length - 14) + "raw/" + data[i], func);
			}
		}
		// call callback func
		else if (typeof func == "function") {
			func(data);
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		// fail also ready
		MOEPROJ.config.ready[file] = true;
		//console.error("data load error", textStatus, errorThrown);
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

// moegirl quest

MOEPROJ.MOEQUEST = MOEPROJ.MOEQUEST || new Object();
var MOEQUEST = MOEPROJ.MOEQUEST;

MOEQUEST.config = {
	quest_num: 1,
	// 4 options for a question
	option_num: 4,
	quest: new Object(),
	results: new Array(),
};
MOEQUEST.ui;
MOEQUEST.data = ['data/filenames.json'];
// moegirl list
MOEQUEST.moegirls = new Array();
MOEQUEST.load = function (canvas) {
	// set ui
	MOEQUEST.ui = MOEPROJ.MOEQUESTUI;
	MOEQUEST.ui.init(canvas);
	MOEPROJ.load({
		canvas: canvas,
		html: MOEQUEST.ui.html,
		data: MOEQUEST.data,
	}, MOEQUEST.run, MOEQUEST.loadData);
};
// callback for loading json data
MOEQUEST.loadData = function (data) {
	// just keep moegirls
	if ("发色" in data) {
		// add to moegirl list
		MOEQUEST.moegirls.push(data);
	}
};
// run when loading completes
MOEQUEST.run = function (canvas) {
	MOEQUEST.ui.load();
	for (var i = 0; i < MOEQUEST.config.quest_num; ++ i) {
		// create a quest
		MOEQUEST.createQuest();
	}
};
// create a quest
MOEQUEST.createQuest = function () {
	var q = undefined;
	var count = 0;
	while (undefined === q && count < 50) {
		++ count;
		q = MOEQUEST.createMoegirlQuest();
	}
	if (undefined !== q) {
		MOEQUEST.config.quest = q;
		MOEQUEST.ui.showQuest(MOEQUEST.config.quest);
		return MOEQUEST.config.quest;
	}
}
// create a quest based on moegirl list
MOEQUEST.createMoegirlQuest = function () {
	var quest = {
		question: "",
		question_img: undefined,
		options: [],
		option_img: [],
		option_link: [],
		correct: []
	};
	// choose some moegirls as options
	var choices = new Array();
	// if too few moegirls
	if (MOEQUEST.moegirls.length < MOEQUEST.config.option_num) {
		// add all
		for (var i in MOEQUEST.moegirls) {
			choices.push(i);
		}
	} else {
		// choose by random
		while (choices.length < MOEQUEST.config.option_num) {
			var ran = Math.floor( (Math.random() * MOEQUEST.moegirls.length) );
			// check if duplicate
			if (choices.indexOf(ran) == -1) {
				choices.push(ran);
			}
		}
	}
	// attributes for question
	var QUEST_ATTR = ["photo", '发色', '瞳色', '声优', '生日', '年龄', '身高', '体重'];
	// choose an attribute by random
	var ran = Math.floor( (Math.random() * QUEST_ATTR.length) );
	// a list of moegirls with valid attribute
	var good_choices = new Array();
	for (var i in choices) {
		if (undefined !== MOEQUEST.moegirls[choices[i]][QUEST_ATTR[ran]]) {
			good_choices.push(choices[i]);
			break;
		}
	}
	// no one has selected attribute
	if (0 == good_choices.length) {
		console.warn("question attr fails to find a good choice", QUEST_ATTR[ran]);
		return;
	}
	// choose one as answer by random
	var answer = Math.floor( (Math.random() * good_choices.length) );
	if (choices.indexOf(good_choices[answer]) <= -1) {
		console.warn("invalid answer", MOEQUEST.moegirls[good_choices[answer]].name);
		return;
	}
	// shuffle choices
	for (var j, x, i = choices.length; i; j = Math.floor(Math.random() * i), x = choices[--i], choices[i] = choices[j], choices[j] = x)
	{}
	// find correct ones
    for (var i in choices) {
		if (MOEQUEST.moegirls[good_choices[answer]][QUEST_ATTR[ran]] == MOEQUEST.moegirls[choices[i]][QUEST_ATTR[ran]]) {
			quest.correct.push(i);
		}
	}
	// assign names to options
	for (var i in choices) {
		quest.options.push(MOEQUEST.moegirls[choices[i]].name);
		if ("photo" != QUEST_ATTR[ran]) {
			quest.option_img.push(MOEQUEST.moegirls[choices[i]].photo || "");
		}
		quest.option_link.push(MOEQUEST.moegirls[choices[i]].link || "");
	}
	// assign question sentence
	switch (QUEST_ATTR[ran]) {
	case "photo":
		quest.question = "该图片是哪位萌娘？";
		quest.question_img = MOEQUEST.moegirls[good_choices[answer]].photo;
		break;
	// '发色', '瞳色', '声优', '生日', '年龄', '身高', '体重'
	case '发色':
	case '瞳色':
	case '声优':
	case '生日':
	case '年龄':
	case '身高':
	case '体重':
		quest.question = '哪位萌娘的<em>' + QUEST_ATTR[ran] + '</em>是<strong>' + MOEQUEST.moegirls[good_choices[answer]][QUEST_ATTR[ran]] + "</strong>？";
		break;
	default:
		quest.question = "答案是哪位萌娘？";
		return;
		break;
	}
	return quest;
};

// moegirl quest ui

MOEPROJ.MOEQUESTUI = MOEPROJ.MOEQUESTUI || new Object();
var MOEQUESTUI = MOEPROJ.MOEQUESTUI;

MOEQUESTUI.html = ' \
<div id="question"> \
	<span></span> \
	<img src="" alt="question" class="" /> \
</div> \
<img border="0" src="resources/correct.ico" alt="result" width="10%" id="result" /> \
<a href="#" id="submitbutton">Answer</a> \
<div class="optionsection" /> \
';
MOEQUESTUI.init = function (canvas) {
	document.title = "萌娘问答";
	$("#" + canvas).addClass("moequest");
};
MOEQUESTUI.load = function () {
	// when image loading in error
	$("#" + MOEPROJ.config.canvas + " #question img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});

	var html = $("#" + MOEPROJ.config.canvas + " .optionsection");
	// for each option
	for (var i = 0; i < MOEQUEST.config.option_num; ++ i) {
		html.append($('<div id="option' + i + '" class="option" ><a href="#" class="inactive" target="_blank"><span></span><img src="" alt="option' + i + '" class="" /></a></div>'));
		$("#" + MOEPROJ.config.canvas + " #option" + i + " img").error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		// append hover event for div
		$("#" + MOEPROJ.config.canvas + " #option" + i).hover(function () {
			if (! $(this).hasClass("checked")) {
				$( this ).addClass( "hover" );
			}
		}, function() {
			$( this ).removeClass( "hover" );
		});
		// append click event for div
		$("#" + MOEPROJ.config.canvas + " #option" + i).click(function () {
			$(this).toggleClass("checked");
		});
	}
};
// show the quest
MOEQUESTUI.showQuest = function (quest) {
	// wanna peek the answer?
	window["peek"] = MOEQUEST.config.quest.correct;
	MOEQUEST.clearChecked();
	// hide result image
	$("#" + MOEPROJ.config.canvas + " #result").hide();
	// change button callback
	$("#" + MOEPROJ.config.canvas + " #submitbutton").off('click').on('click', function () {
		MOEQUEST.checkAnswer();
		// if the max number has reached
		if (false) {
			console.log("game over");
			return;
		}
	}).html('Answer');
	// show question
	$("#" + MOEPROJ.config.canvas + " #question span").html(quest.question);
	// show question image
	if (undefined !== quest.question_img) {
		$("#" + MOEPROJ.config.canvas + " #question img").attr("src", quest.question_img);
		$("#" + MOEPROJ.config.canvas + " #question img").addClass("show");
		$("#" + MOEPROJ.config.canvas + " .option").addClass("bottom");
	} else { // hide image
		$("#" + MOEPROJ.config.canvas + " #question img").attr("src", "");
		$("#" + MOEPROJ.config.canvas + " #question img").removeClass("show");
		$("#" + MOEPROJ.config.canvas + " .option").removeClass("bottom");
	}
	$("#" + MOEPROJ.config.canvas + " .option").removeClass("correct");
	$("#" + MOEPROJ.config.canvas + " .option a").addClass("inactive");
	// for each option
	for (var i = 0; i < quest.options.length; ++ i) {
		var option = $("#" + MOEPROJ.config.canvas + " #option" + i + " span");
		// invalid option element
		if (option.length == 0) {
			console.warn("option canvas not enough", i, quest.options);
			break;
		}
		// show option
		option.html(quest.options[i]);
		// show option image
		if (undefined !== quest.option_img && undefined !== quest.option_img[i]) {
			$("#" + MOEPROJ.config.canvas + " #option" + i + " img").attr("src",quest.option_img[i]);
			$("#" + MOEPROJ.config.canvas + " #option" + i + " img").addClass("show");
		} else { // hide image
			$("#" + MOEPROJ.config.canvas + " #option" + i + " img").attr("src","");
			$("#" + MOEPROJ.config.canvas + " #option" + i + " img").removeClass("show");
		}
	}
	// fade in
	$("#" + MOEPROJ.config.canvas + " #question").hide().css({visibility: "inherit"}).fadeIn("slow");
	$("#" + MOEPROJ.config.canvas + " .option").hide().css({visibility: "inherit"}).fadeIn("slow");
};
// show the answer
MOEQUEST.showAnswer = function (quest) {
	MOEQUEST.clearChecked();
	for (var i in quest.correct) {
		var correct = $("#" + MOEPROJ.config.canvas + " #option" + quest.correct[i]);
		if (correct.length == 0) {
			console.warn("correct answer does not exist", i);
			continue;
		}
		correct.addClass( "correct" );
	}
	$("#" + MOEPROJ.config.canvas + " #submitbutton").off('click').on('click', function () {
		// show the next one
		MOEQUEST.createQuest();
	}).html('Next');
	$("#" + MOEPROJ.config.canvas + ' .option a').each(function (index, value) {
		$(this).attr("href", quest.option_link[index]);
		$(this).removeClass("inactive");
	})
};
// check if the answer is correct
MOEQUEST.checkAnswer = function () {
	var quest = MOEQUEST.config.quest;
	var ans = new Array();
	// get user's answer
	$("#" + MOEPROJ.config.canvas + " .optionsection .option").each(function (index, value) {
		if ($(value).hasClass("checked")) {
			ans.push(index);
		}
	});
	var wrong_flag = false;
	// answer number is wrong
	if (ans.length != quest.correct.length) {
		wrong_flag = true;
	} else {
		ans.sort();
		quest.correct.sort();
		for (var i in ans) {
			if (! (i in quest.correct) || ans[i] != quest.correct[i]) {
				wrong_flag = true;
				break;
			}
		}
	}
	// append to result list
	MOEQUEST.config.results.push(! wrong_flag);
	// show result image
	$("#" + MOEPROJ.config.canvas + " #result").attr("src",'resources/' + (wrong_flag ? "incorrect" : "correct") + '.ico').hide().css({visibility: "inherit"}).fadeIn("slow");
	MOEQUEST.showAnswer(quest);
};
// clear checked options
MOEQUEST.clearChecked = function () {
	$("#" + MOEPROJ.config.canvas + " .optionsection .checked").each(function (index, value) {
		$(value).removeClass("checked");
	});
};

// moeproject parser

var MOEPROJ = MOEPROJ || new Object();
var MOEPARSER = MOEPROJ.MOEPARSER || new Object();

var fs = require('fs');
var jsdom = require("jsdom");
MOEPARSER.PROJ_ROOT = '../';
MOEPARSER.ENTRY_URL = [
// english
//"http://en.moegirl.org/Amakase_Miharu",
// random
//"http://zh.moegirl.org/Special:%E9%9A%8F%E6%9C%BA%E9%A1%B5%E9%9D%A2",
// my version
"http://feizhan.github.io/moeproject/resources/%E5%8D%83%E7%9F%B3%E6%8A%9A%E5%AD%90%20-%20%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91_%E4%B8%87%E7%89%A9%E7%9A%86%E5%8F%AF%E8%90%8C%E7%9A%84%E7%99%BE%E7%A7%91%E5%85%A8%E4%B9%A6.html",
// mainpage
//"http://zh.moegirl.org/Mainpage",
// example
//"http://zh.moegirl.org/%E5%8D%83%E7%9F%B3%E6%8A%9A%E5%AD%90",
];
MOEPARSER.contents = new Object();
// parse all specified pages
MOEPARSER.parse = function () {
	for (var i in MOEPARSER.ENTRY_URL) {
		MOEPARSER.parsePage(MOEPARSER.ENTRY_URL[i]);
	}
};
// parse one page, save to json format
MOEPARSER.parsePage = function (url) {
	if (url in MOEPARSER.contents) {
		return;
	}
	jsdom.env(url,
		["http://code.jquery.com/jquery.js"],
		function (errors, window) {
			if (errors) {
				console.error("error parsing url", errors);
				return;
			}
			// create a key for the new url
			if (undefined === MOEPARSER.contents[url]) {
				MOEPARSER.contents[url] = new Object();
			}
			// moegirl's name
			MOEPARSER.contents[url].name = MOEPARSER.parseDom(window, "#firstHeading > span");
			// get error from the webpage
			if (undefined === MOEPARSER.contents[url].name) {
				console.warn(window.$("p").html());
				return;
			}
			// first line
			MOEPARSER.contents[url].first = MOEPARSER.parseDom(window, "#mw-content-text > p:nth-child(4)");
			// all the links in the content
			MOEPARSER.contents[url].links = new Array();
			window.$("#mw-content-text a").each(function () {
				MOEPARSER.contents[url].links.push(window.$(this).attr("href"));
			});
			// photo
			//#mw-content-text > div.infotemplatebox > table > tbody > tr:nth-child(1) > td > a > img
			MOEPARSER.contents[url].photo = window.$("#mw-content-text > div.infotemplatebox > table > tr:nth-child(1) > td > a > img").attr('src');
			// info table
			MOEPARSER.contents[url].info = new Object();
			var info = window.$("#mw-content-text > div.infotemplatebox > table > tr");
			info.each(function (index, value) {
				// key on the left
				var key = window.$('#mw-content-text > div.infotemplatebox > table > tr:nth-child(' + index + ') > th').text();
				// remove invalid symbols
				key = key.replace(/\s/g, '');
				if (undefined !== key && "" != key && " " != key) {
					// content on the right
					var content = window.$('#mw-content-text > div.infotemplatebox > table > tr:nth-child(' + index + ') > td').text();
					// remove invalid symbols
					content = content.replace(/^\s+|\s+$/g,'').replace(/(\r\n|\n|\r)/gm,"");
					MOEPARSER.contents[url].info[key] = content;
				}
			});
			// category
			MOEPARSER.contents[url].categories = new Array();
			var category = window.$("#mw-normal-catlinks > ul > li");
			category.each(function (index, value) {
				var text = window.$(this).text();
				// remove invalid symbols
				text = text.replace(/^\s+|\s+$/g,'').replace(/(\r\n|\n|\r)/gm,"");
				MOEPARSER.contents[url].categories.push(text);
			});
			// filename based on moegirl's name
			var filename = MOEPARSER.contents[url].name; //.replace(/[^a-z0-9]/gi, '_').toLowerCase();
			filename = 'data/raw/' + filename + '.json';
			// write json to file
			fs.writeFile(filename, JSON.stringify(MOEPARSER.contents[url], null, 4), function (err) {
				if (err) {
					console.error("file error", err);
				} else {
					console.log("JSON saved to " + filename);
				}
			}); 
			//console.info(MOEPARSER.contents[url].name, MOEPARSER.contents[url].info);
		}
	);
};
// parse an element in the DOM
MOEPARSER.parseDom = function (window, selector) {
	return window.$(selector).html();
};
// return all the elements for the selector in the DOM
MOEPARSER.parseDomAll = function (window, selector) {
	var ret = new Array();
	window.$(selector).each(function () {
		ret.push(window.$(this).html());
	});
	return ret;
}
// separate the raw data into each moegirl
MOEPARSER.separate = function () {
	// open json file
	var json = require('../data/raw.json');
	var count = 0;
	for (var i in json) {
		++ count;
		if ("object" == typeof json[i] && ("name" in json[i])) {
			// new file name
			var filename = json[i].name;
			filename = 'data/raw/' + filename + '.json';
			// write json to file
			fs.writeFile(filename, JSON.stringify(json[i], null, 4), function (err) {
				if (err) {
					console.error("file error", err);
				} else {
					console.log("JSON saved to " + filename);
				}
			}); 
		}
	}
	console.info(count);
}
// change photo path to the current one
MOEPARSER.changePhoto = function () {
	// get file name list
	MOEPARSER.eachFile("data/raw/", function (err, files) {
		// for each moegirl file
		for (var i in files) {
			// try to load the json file
			try {
				var json = require("../" + files[i]);
			}
			catch (err) {
				//@bug usually error
				//console.error("require error:", err);
				continue;
			}
			// if no photo
			if (! ("photo" in json)) {
				continue;
			}
			// if no old photo, copy current one to old. if have old photo, don't do twice
			if (! ("old_photo" in json)) {
				json.old_photo = json.photo;
			}
			// modify the photo file path
			json.photo = json.old_photo.replace("1-ps.googleusercontent.com/x/zh.moegirl.org/", "").replace("static.mengniang.org/thumb", "static.mengniang.org/common/thumb");
			var end = json.photo.indexOf(".pagespeed");
			if (end >= 0) {
				json.photo = json.photo.substr(0, end);
			}
			var name0 = json.photo.indexOf(".jpg/");
			var name1 = json.photo.indexOf("250px-");
			var remove = json.photo.substring(name0 + 5, name1);
			json.photo = json.photo.replace(remove, "");
			//console.info(json.photo, " === ", json.old_photo);
			// write it back
			fs.writeFile(files[i], JSON.stringify(json, null, 4), function (err) {
				if (err) {
					//console.error("file error", err);
				} else {
					//console.log("JSON saved to " + files[i]);
				}
			}); 
		}
	});
};
// put moegirl file paths into filenames.json
MOEPARSER.saveFileNames = function () {
	var path = MOEPARSER.PROJ_ROOT + "data/raw/";
	MOEPARSER.eachFile(path, function (err, files) {
		for (var i in files) {
			files[i] = files[i].substr(path.length);
		}
		// write them back
		fs.writeFile(MOEPARSER.PROJ_ROOT + "data/filenames.json", JSON.stringify(files, null, 4), function (err) {
			if (err) {
				console.error("file error", err);
			} else {
				console.log("JSON saved to ", MOEPARSER.PROJ_ROOT + "data/filenames.json");
			}
		});
	});
};
// return a list of file names
MOEPARSER.eachFile = function (path, callback) {
 // the callback gets ( err, files) where files is an array of file names
 if( typeof callback !== 'function' ) return
 var
  result = []
  , files = [ path.replace( /\/\s*$/, '' ) ]
 function traverseFiles (){
  if( files.length ) {
   var name = files.shift()
   fs.stat(name, function( err, stats){
	if( err ){
	 if( err.errno == 34 ) traverseFiles()
// in case there's broken symbolic links or a bad path
// skip file instead of sending error
	 else callback(err)
	}
	else if ( stats.isDirectory() ) fs.readdir( name, function( err, files2 ){
	 if( err ) callback(err)
	 else {
	  files = files2
	   .map( function( file ){ return name + '/' + file } )
	   .concat( files )
	  traverseFiles()
	 }
	})
	else{
	 result.push(name)
	 traverseFiles()
	}
   })
  }
  else callback( null, result )
 }
 traverseFiles()
}


//MOEPARSER.parse();
//MOEPARSER.changePhoto();
MOEPARSER.saveFileNames();

// server side
// to start the server:
// goto project root directory (moeAcademy);
// $ node src/server.js

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8080;
// create a server
http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };
  // if file exists
  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }
    // default file name
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
    // read and display it
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at => http://localhost:" + port + "/ CTRL + C to shutdown");
