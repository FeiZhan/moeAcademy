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
MOEQUEST.data = ['data/moegirls.json'];
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
	// add to moegirl list
	MOEQUEST.moegirls = MOEQUEST.moegirls.concat(data);
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
	while (undefined === q) {
		q = MOEQUEST.createMoegirlQuest();
	}
	MOEQUEST.config.quest = q;
	MOEQUEST.ui.showQuest(MOEQUEST.config.quest);
	return MOEQUEST.config.quest;
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














