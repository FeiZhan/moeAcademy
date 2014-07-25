// moegirl battle actions

MOEPROJ.MOEBATTLE = MOEPROJ.MOEBATTLE || new Object();
MOEPROJ.MOEBATTLE.ACTIONS = MOEPROJ.MOEBATTLE.ACTIONS || new Object();
//var ACTIONS = MOEPROJ.MOEBATTLE.ACTIONS;
var MOEBATTLE = MOEPROJ.MOEBATTLE;

// game

// game start
MOEBATTLE.gameStart = function (action) {
	// prepare players
	MOEBATTLE.players[0] = new MOEBATTLE.Player({name : "me", order : 0});
	MOEBATTLE.players[1] = new MOEBATTLE.Player({name : "opponent", order : 1});
	for (var i in MOEBATTLE.players) {
		MOEBATTLE.players[i].show();
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
	if (MOEBATTLE.game.current >= Object.keys(MOEBATTLE.players).length) {
		MOEBATTLE.game.current %= Object.keys(MOEBATTLE.players).length;
		++ MOEBATTLE.game.round_count;
	}
	MOEBATTLE.ui.Player.start();
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
	MOEBATTLE.ui.Player.end();
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
	MOEBATTLE.ui.Player.changeHP(action.target, - action.number);
}
MOEBATTLE.playerGainHP = function (action) {
	MOEBATTLE.players[action.target].hp += action.number;
	MOEBATTLE.ui.Player.changeHP(action.target, action.number);
}
MOEBATTLE.playerChangeMaxHP = function (action) {
	MOEBATTLE.players[action.target].maxhp = action.number;
	MOEBATTLE.ui.Player.changeMaxHP(action.target, action.number);
}
MOEBATTLE.playerLoseMP = function (action) {
	MOEBATTLE.players[action.target].mp -= action.number;
	MOEBATTLE.ui.Player.changeMP(action.target, MOEBATTLE.players[action.target].mp);
}
MOEBATTLE.playerGainMP = function (action) {
	MOEBATTLE.players[action.target].mp += action.number;
	MOEBATTLE.ui.Player.changeMP(action.target, MOEBATTLE.players[action.target].mp);
}
MOEBATTLE.playerChangeMaxMP = function (action) {
	MOEBATTLE.players[action.target].maxmp = action.number;
	MOEBATTLE.ui.Player.changeMaxMP(action.target, action.number);
}
MOEBATTLE.playerLoseStatus = function (action) {
	MOEBATTLE.players[action.target].statuses.splice(MOEBATTLE.players[action.target].statuses.indexOf(action.status), 1);
	MOEBATTLE.ui.Player.loseStatus(action.target, action.status);
}
MOEBATTLE.playerGainStatus = function (action) {
	// duplicate status
	if ( MOEBATTLE.players[action.target].statuses.indexOf(action.status) >= 0 ) {
		//return;
	}
	MOEBATTLE.players[action.target].statuses.push(action.status);
	MOEBATTLE.ui.Player.gainStatus(action.target, action.status);
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
	MOEBATTLE.ui.Card.draw(action.target, card, action.from);
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
	MOEBATTLE.players[action.from].chars[action.card] = $.extend(true, {}, MOEBATTLE.cards[action.card]);
	MOEBATTLE.ui.Card.addToArea(action.card, action.from);
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
	MOEBATTLE.ui.Card.useWithoutTarget(action.card);
}
MOEBATTLE.cardUseWithTarget = function (action) {
	if ("skill" in MOEBATTLE.cards[action.card]) {
		var func = MOEPROJ.getFunctionFromString( MOEBATTLE.cards[action.card].skill );
		if ("function" == typeof func) {
			func(action);
		}
	}
	MOEBATTLE.game.discard.push(action.card);
	MOEBATTLE.ui.Card.useWithTarget(action.card);
};

// character

MOEBATTLE.charLoseHP = function (action) {
	if (! (action.targetPlayer in MOEBATTLE.players)) {
		console.warn("charLoseHP error");
		return;
	}
	MOEBATTLE.players[action.targetPlayer].chars[action.target].hp -= action.number;
	MOEBATTLE.ui.Char.changeHP(action.targetPlayer, action.target, - action.number);
}
MOEBATTLE.charGainHP = function (action) {
	MOEBATTLE.players[action.target].hp += action.number;
	MOEBATTLE.ui.Char.changeHP(action.targetPlayer, action.target, action.number);
}
MOEBATTLE.charLoseStatus = function (action) {
	MOEBATTLE.players[action.target].statuses.splice(MOEBATTLE.players[action.target].statuses.indexOf(action.status), 1);
	MOEBATTLE.ui.Player.loseStatus(action.target, action.status);
}
MOEBATTLE.charGainStatus = function (action) {
	// duplicate status
	if ( MOEBATTLE.players[action.target].statuses.indexOf(action.status) >= 0 ) {
		//return;
	}
	MOEBATTLE.players[action.target].statuses.push(action.status);
	MOEBATTLE.ui.Player.gainStatus(action.target, action.status);
}
