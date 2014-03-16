// moegirl quest

var MOEQUEST = MOEQUEST || new Object();
MOEQUEST.config = {
	files: ['data/moegirls.json'],
	canvas: undefined,
	// 4 options for a question
	option_num: 4,
	quest: new Object(),
	results: new Array(),
};
// initialize by loading json files
MOEQUEST.init = function () {
	function loadJson(file, func) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			console.log("loaded", file);
			if (typeof func == "function") {
				func(data);
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.error("data load error", textStatus, errorThrown);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	// load json files
	for (var i in MOEQUEST.config.files) {
		loadJson(MOEQUEST.config.files[i], function (data) {
			// add to moegirl list
			MOEQUEST.moegirls = MOEQUEST.moegirls.concat(data);
		});
	}
};
// init when page loaded
$(function() {
	MOEQUEST.init();
});
// main function
MOEQUEST.run = function (canvas, ans) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	// save canvas id
	MOEQUEST.config.canvas = canvas;
	MOEQUEST.showFrame();
	MOEQUEST.waitLoad();
};
// wait for loading files
MOEQUEST.waitLoad = function () {
	if ((typeof MOEQUEST.moegirls != "array" && typeof MOEQUEST.moegirls != "object") || MOEQUEST.moegirls.length == 0) {
		console.log("loading");
		setTimeout(MOEQUEST.waitLoad, 300);
		return;
	}
	MOEQUEST.showQuest();
};
// show the framework
MOEQUEST.showFrame = function () {
	var canvas = $("#" + MOEQUEST.config.canvas);
	// clear the canvas
	canvas.empty();
	// append the question
	canvas.append($('<div class="id-question question"><span></span><img src="" alt="question" class="" /></div>'));
	$("#" + MOEQUEST.config.canvas + " .id-question img").error(function () {
		$(this).attr("src", "resources/nophoto.jpg");
	});
	// append the last result
	canvas.append($('<img border="0" src="resources/correct.ico" alt="result" width="10%" class="id-lastresult lastresult" />'));
	// append submit button
	canvas.append($('<a href="#" class="id-submitbutton submitbutton">Answer</a>'));

	// append options
	canvas.append($('<div class="id-optionsection optionsection" />'));
	html = $("#" + MOEQUEST.config.canvas + " .id-optionsection");
	// for each option
	for (var i = 0; i < MOEQUEST.config.option_num; ++ i) {
		html.append($('<div class="id-option' + i + ' option" />'));
		var html2 = $("#" + MOEQUEST.config.canvas + " .id-option" + i);
		// append a span and img for question
		html2.append('<span></span><img src="" alt="option' + i + '" class="" />');
		$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").error(function () {
			$(this).attr("src", "resources/nophoto.jpg");
		});
		// append click event for div
		$("#" + MOEQUEST.config.canvas + " .id-option" + i).hover(function () {
			if (! $(this).hasClass("checked")) {
				$( this ).find("span").addClass( "hover" );
			}
		}, function() {
			$( this ).find("span").removeClass( "hover" );
		});
		// append click event for span
		$("#" + MOEQUEST.config.canvas + " .id-option" + i + "").click(function () {
			//$(this).find("input").trigger('click');
			$(this).find("span").toggleClass("checked");
		});
	}
};
// show the quest
MOEQUEST.showQuest = function () {
	// create a quest
	quest = MOEQUEST.createQuest();
	MOEQUEST.clearChecked();
	// hide last result image
	$("#" + MOEQUEST.config.canvas + " .id-lastresult").hide();
	// change button callback
	$("#" + MOEQUEST.config.canvas + " .id-submitbutton").off('click').on('click', function () {
		MOEQUEST.checkAnswer();
		// if the max number has reached
		if (false) {
			console.log("game over");
			return;
		}
	}).html('Answer');
	// show question
	$("#" + MOEQUEST.config.canvas + " .id-question span").html(quest.question);
	// show question image
	if (undefined !== quest.question_img) {
		$("#" + MOEQUEST.config.canvas + " .id-question img").attr("src", quest.question_img);
		$("#" + MOEQUEST.config.canvas + " .id-question img").addClass("show");
	} else { // hide image
		$("#" + MOEQUEST.config.canvas + " .id-question img").attr("src", "");
		$("#" + MOEQUEST.config.canvas + " .id-question img").removeClass("show");
	}
	// for each option
	for (var i = 0; i < quest.options.length; ++ i) {
		$("#" + MOEQUEST.config.canvas + " .id-option" + i).removeClass("correct");
		var option = $("#" + MOEQUEST.config.canvas + " .id-option" + i + " span");
		if (option.length == 0) {
			console.warn("option canvas not enough", i, quest.options);
			break;
		}
		// show option
		option.html(quest.options[i]);
		// show option image
		if (undefined !== quest.option_img && undefined !== quest.option_img[i]) {
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").attr("src",quest.option_img[i]);
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").addClass("show");
		} else { // hide image
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").attr("src","");
			$("#" + MOEQUEST.config.canvas + " .id-option" + i + " img").removeClass("show");
		}
	}
	// fade in
	$("#" + MOEQUEST.config.canvas + " .id-question").hide().css({visibility: "inherit"}).fadeIn("slow");
	$("#" + MOEQUEST.config.canvas + " .option").hide().css({visibility: "inherit"}).fadeIn("slow");
};
// show the answer
MOEQUEST.showAnswer = function (quest) {
	for (var i in quest.correct) {
		var correct = $("#" + MOEQUEST.config.canvas + " .id-option" + quest.correct[i]);
		if (correct.length == 0) {
			console.warn("correct answer does not exist", i);
			continue;
		}
		correct.addClass( "correct" );
	}
	$("#" + MOEQUEST.config.canvas + " .id-submitbutton").off('click').on('click', function () {
		// show the next one
		MOEQUEST.showQuest();
	}).html('Next');
};
// check if the answer is correct
MOEQUEST.checkAnswer = function () {
	var quest = MOEQUEST.config.quest;
	var ans = new Array();
	// get user's answer
	$("#" + MOEQUEST.config.canvas + " .id-optionsection .option").each(function (index, value) {
		if ($(value).find("span").hasClass("checked")) {
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
	// show last result image
	$("#" + MOEQUEST.config.canvas + " .id-lastresult").attr("src",'resources/' + (wrong_flag ? "incorrect" : "correct") + '.ico').hide().css({visibility: "inherit"}).fadeIn("slow");
	MOEQUEST.showAnswer(quest);
};
// clear checked options
MOEQUEST.clearChecked = function () {
	$("#" + MOEQUEST.config.canvas + " .id-optionsection .checked").each(function (index, value) {
		$(value).removeClass("checked");
	});
};
// create a quest
MOEQUEST.createQuest = function () {
	var q = undefined;
	while (undefined == q) {
		q = MOEQUEST.createMoegirlQuest();
	}
	MOEQUEST.config.quest = q;
	window["peek"] = MOEQUEST.config.quest.correct;
	return MOEQUEST.config.quest;
}
// moegirl list
MOEQUEST.moegirls = new Array();
// create a quest based on moegirl list
MOEQUEST.createMoegirlQuest = function () {
	var quest = {
		question: "",
		question_img: undefined,
		options: [],
		option_img: [],
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
	var QUEST_ATTR = ["photo", '发色', '瞳色', '声优', '年龄', '身高'];
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
			quest.option_img.push(MOEQUEST.moegirls[choices[i]].photo);
		}
	}
	// assign question sentence
	switch (QUEST_ATTR[ran]) {
	case "photo":
		quest.question = "该图片是哪位萌娘？";
		quest.question_img = MOEQUEST.moegirls[good_choices[answer]].photo;
		break;
	case '发色':
	case '瞳色':
	case '声优':
	case '年龄':
	case '身高':
		quest.question = '哪位萌娘的<em>' + QUEST_ATTR[ran] + '</em>是<strong>' + MOEQUEST.moegirls[good_choices[answer]][QUEST_ATTR[ran]] + "</strong>？";
		break;
	default:
		quest.question = "答案是哪位萌娘？";
		return;
		break;
	}
	return quest;
};

















