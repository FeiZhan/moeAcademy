// moegirl battle

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
var MOEBATTLE = MOEPROJ.MOEBATTLE;

MOEBATTLE.ui;
MOEBATTLE.data = ['data/cards.json'];
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
	MOEBATTLE.cards = MOEBATTLE.cards.concat(data);
};
// run when loading completes
MOEBATTLE.run = function () {
	MOEBATTLE.ACTION_CALLBACK = {
		// game
		"gameStart" : MOEBATTLE.gameStart,
		"GamePause" : undefined,
		"GameOver" : undefined,
		"GameWin" : undefined,
		"GameLose" : undefined,
		"GameDraw" : undefined,
		// deck
		"deckShuffle" : MOEBATTLE.deckShuffle,
		"DeckPrepare" : "MOEBATTLE.deckPrepare",
		// player
		"PlayersShuffle" : "MOEBATTLE.playersShuffle",
		"playerStart" : MOEBATTLE.playerStart,
		"playerEnd" : MOEBATTLE.playerEnd,
		"PlayerChange" : undefined,
		"PlayerDie" : undefined,
		"PlayerRevive" : undefined,
		"PlayerLoseHP" : undefined,
		"PlayerGainHP" : undefined,
		"PlayerLoseMP" : undefined,
		"PlayerGainMP" : undefined,
		"PlayerLoseStatus" : undefined,
		"PlayerGainStatus" : undefined,
		"PlayerLoseEquip" : undefined,
		"PlayerGainEquip" : undefined,
		// card
		"cardsDraw" : function (action) {
			MOEBATTLE.cardsDraw(action.number, action.target);
		},
		"cardDraw" : function (action) {
			MOEBATTLE.cardDraw(action.player, action.from);
		},
		"cardUse" : function (action) {
			MOEBATTLE.cardUse(action.from, action.card);
		},
		"CardDiscard" : undefined,
		"CardUseWithTarget" : undefined,
		"cardUseWithoutTarget" : function (action) {
			MOEBATTLE.cardUseWithoutTarget(action.card);
		},
		"cardAddToArea" : function (action) {
			MOEBATTLE.cardAddToArea(action.card, action.from);
		},
		// character
		"CharCreate" : undefined,
		"CharDie" : undefined,
		"CharAct" : undefined,
		"CharLoseHP" : undefined,
		"CharGainHP" : undefined,
		"CharLoseStatus" : undefined,
		"CharGainStatus" : undefined,
	};
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
	}, {
		name: "opponent",
		order: 1,
		maxhp: 20,
		hp: 20,
		maxmp: 0,
		mp: 0,
		hands: [],
		area: [],
	}
];

MOEBATTLE.ACTION_CALLBACK = new Object();
MOEBATTLE.actions = new Array();
// execute the next action
MOEBATTLE.nextAction = function () {
	// no more actions
	if (0 == MOEBATTLE.actions.length || MOEBATTLEUI.AnimaCount > 0) {
		return;
	}
	// invalid action
	if (undefined === MOEBATTLE.actions[0].type) {
		MOEBATTLE.actions.shift();
		return;
	}
	console.debug(MOEBATTLE.actions[0].type)
	if ("function" == typeof MOEBATTLE[MOEBATTLE.actions[0].type]) {
		MOEBATTLE[MOEBATTLE.actions[0].type] (MOEBATTLE.actions[0]);
	}
	else if ("function" == typeof MOEBATTLE.ACTION_CALLBACK[MOEBATTLE.actions[0].type]) {
		MOEBATTLE.ACTION_CALLBACK[MOEBATTLE.actions[0].type](MOEBATTLE.actions[0]);
	}
	MOEBATTLE.actions.shift();
}

// game

// game start
MOEBATTLE.gameStart = function (action) {
	// prepare players
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.playerPrepare(i);
	}
	// prepare discard deck
	MOEBATTLE.game.discard = new Array();
	// init shuffle cards in deck
	MOEBATTLE.game.deck = new Array();
	for (var i in MOEBATTLE.cards) {
		MOEBATTLE.game.deck.push(i);
	}
	MOEBATTLE.shuffle(MOEBATTLE.game.deck);

	MOEBATTLE.actions.push({type: "PlayersShuffle"});
	// deal initial cards
	for (var i in MOEBATTLE.game.orders) {
		MOEBATTLE.actions.push({
			type: "cardsDraw",
			number: 1,
			target: MOEBATTLE.game.orders[i]
		});
	}
	setTimeout(function () {
		// the first player
		MOEBATTLE.actions.push({
			type: "playerStart",
		});
	}, 500);
};
// game over
MOEBATTLE.gameOver = function (action) {
	MOEBATTLE.ui.gameOver();
}

// deck

MOEBATTLE.deckShuffle = function (action) {
	MOEBATTLE.shuffle(MOEBATTLE.game.deck);
	++ MOEBATTLE.game.shuffle_count;
}
// shuffle array
MOEBATTLE.shuffle = function (arr) {
	//console.log(arr);
	for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
	{}
	//console.log(arr);
};
// prepare deck
MOEBATTLE.deckPrepare = function (action) {
	MOEBATTLE.game.deck = MOEBATTLE.game.deck.concat(MOEBATTLE.game.discard);
	MOEBATTLE.game.discard = new Array();
	MOEBATTLE.actions.push({ type: "deckShuffle" });
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
		MOEBATTLE.actions.push({
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
// use a card
MOEBATTLE.cardUse = function (action) {
	// remove card from player
	MOEBATTLE.players[action.from].hands.splice(MOEBATTLE.players[action.from].hands.indexOf(action.card), 1);
	switch(MOEBATTLE.cards[action.card].type) {
	case "character": // put into player's area
		MOEBATTLE.actions.push({
			type: "cardAddToArea",
			card: action.card,
			from: action.from,
		});
		break;
	default: // use immediately
		MOEBATTLE.actions.push({
			type: "cardUseWithoutTarget",
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
	MOEBATTLE.game.discard.push(action.card);
	MOEBATTLE.ui.cardUseWithoutTarget(action.card);
}









