// moegirl battle

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
var MOEBATTLE = MOEPROJ.MOEBATTLE;

MOEBATTLE.ui;
MOEBATTLE.data = ['data/battle.json', 'data/filenames.json'];
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
MOEBATTLE.loadData = function (data, file) {
	switch (file) {
	case 'data/filenames.json':
		break;
	case 'data/battle.json':
		MOEBATTLE.battle = data;
		MOEBATTLE.cards = MOEBATTLE.cards.concat(data.cards);
		break;
	default:
		MOEBATTLE.moegirls = MOEBATTLE.moegirls.concat(data);
		break;
	}
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
MOEBATTLE.moegirls = new Array();
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
		MOEBATTLE.ui.playerCreate(i);
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
