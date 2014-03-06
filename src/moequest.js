var MOEQUEST = MOEQUEST || new Object();
MOEQUEST.config = {
	files: ['data/test.json'],
	canvas: undefined,
	ans_canvas: undefined,
	current_quest: 0,
	results: new Array(),
};
MOEQUEST.init = function () {
	function loadJson(file) {
		$.getJSON(file, function(data, textStatus, jqXHR) {
			console.log("loaded", file);
			MOEQUEST.loadQuest(data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.error("data load error", textStatus, errorThrown);
		})
		.always(function(data, textStatus, jqXHR) {
		});
	}
	for (var i in MOEQUEST.config.files) {
		loadJson(MOEQUEST.config.files[i]);
	}
};
$(function() {
	MOEQUEST.init();
});
MOEQUEST.run = function (canvas, ans) {
	if (undefined === canvas || $("#" + canvas).length == 0) {
		console.error("undefined canvas", canvas);
		return;
	}
	MOEQUEST.config.canvas = canvas;
	MOEQUEST.config.ans_canvas = ans;
	MOEQUEST.showFrame();
	MOEQUEST.waitLoad();
};
MOEQUEST.waitLoad = function () {
	if ((typeof MOEQUEST.questions != "array" && typeof MOEQUEST.questions != "object") || MOEQUEST.questions.length == 0) {
		console.log("loading");
		setTimeout(MOEQUEST.waitLoad, 300);
		return;
	}
	MOEQUEST.config.current_quest = 0;
	MOEQUEST.showQuest(MOEQUEST.questions[MOEQUEST.config.current_quest]);
};
MOEQUEST.questions = new Array();
MOEQUEST.loadQuest = function (data) {
	for (var i in data) {
		if (undefined === data[i].quest) {
			console.warn("data format error", data[i]);
			continue;
		}
		MOEQUEST.questions.push(data[i]);
	}
};
MOEQUEST.showFrame = function () {
	var canvas = $("#" + MOEQUEST.config.canvas);
	canvas.empty();
	canvas.append($('<div class="id-question question"><span></span></div>'));
	canvas.append($('<img border="0" src="resources/correct.ico" alt="result" width="10%" class="id-lastresult lastresult" />'));
	canvas.append($('<button type="button" class="id-submitbutton button submitbutton">Answer</button>'));
	$("#" + MOEQUEST.config.canvas + " .id-submitbutton").click(MOEQUEST.submitQuest);
	canvas.append($('<button type="button" class="id-clearbutton button clearbutton">Clear</button>'));
	$("#" + MOEQUEST.config.canvas + " .id-clearbutton").click(MOEQUEST.clearChecked);

	canvas.append($('<div class="id-optionsection optionsection" />'));
	html = $("#" + MOEQUEST.config.canvas + " .id-optionsection");
	for (var i = 0; i < 4; ++ i) {
		html.append($('<div class="id-option' + i + ' option" />'));
		var html2 = $("#" + MOEQUEST.config.canvas + " .id-option" + i);
		html2.append('<input type="checkbox" name="check' + i + '" value="' + i + '" class="id-check' + i + ' check" />').append('<span></span>');
		$("#" + MOEQUEST.config.canvas + " .id-option" + i + " span").click(function () {
			var check = $(this).prev();
			check.trigger('click'); 
		});
	}

	canvas = $("#" + MOEQUEST.config.ans_canvas);
	canvas.empty();
	canvas.append($('<div class="id-question question"><span></span></div>'));
	canvas.append($('<div class="id-optionsection optionsection" />'));
	html = $("#" + MOEQUEST.config.ans_canvas + " .id-optionsection");
	for (var i = 0; i < 4; ++ i) {
		html.append($('<div class="id-option' + i + ' option" />'));
		var html2 = $("#" + MOEQUEST.config.ans_canvas + " .id-option" + i);
		html2.append('<span></span>');
	}
};
MOEQUEST.showQuest = function (quest) {
	$("#" + MOEQUEST.config.canvas + " .id-question span").text(quest.quest);
	for (var i = 0; i < quest.options.length; ++ i) {
		var option = $("#" + MOEQUEST.config.canvas + " .id-option" + i + " span");
		if (option.length == 0) {
			console.warn("option canvas not enough", i, quest.options);
			break;
		}
		option.text(quest.options[i]);
	}
	$("#" + MOEQUEST.config.canvas + " .id-question").hide().css({visibility: "inherit"}).fadeIn("slow");
	$("#" + MOEQUEST.config.canvas + " .option").hide().css({visibility: "inherit"}).fadeIn("slow");
};
MOEQUEST.showAnswer = function (quest) {
	if (undefined === MOEQUEST.config.ans_canvas || $("#" + MOEQUEST.config.ans_canvas).length == 0) {
		return;
	}
	$("#" + MOEQUEST.config.ans_canvas + " .id-question span").text(quest.quest);
	for (var i = 0; i < quest.options.length; ++ i) {
		var option = $("#" + MOEQUEST.config.ans_canvas + " .id-option" + i + " span");
		if (option.length == 0) {
			console.warn("option canvas not enough", i, quest.options);
			break;
		}
		option.text(quest.options[i]);
		$("#" + MOEQUEST.config.ans_canvas + " .id-option" + i).removeClass( "correct" );
	}
	for (var i in quest.correct) {
		 var correct = $("#" + MOEQUEST.config.ans_canvas + " .id-option" + quest.correct[i]);
		if (correct.length == 0) {
			console.warn("correct answer does not exist", i);
			continue;
		}
		correct.addClass( "correct" );
	}
	var clone = $("#" + MOEQUEST.config.canvas).clone().appendTo($("#" + MOEQUEST.config.canvas).parent());
	clone.html("")/*.css('z-index', -10)*/;
	var ans = $("#" + MOEQUEST.config.ans_canvas);
	clone.animate({
		width: ans.width(),
		height: ans.height(),
		top: ans.position().top,
		left: ans.position().left,
	}, "slow", function () {
		$(this).remove();
		$("#" + MOEQUEST.config.ans_canvas).hide().css({visibility: "inherit"}).fadeIn("slow");
	});
};
MOEQUEST.submitQuest = function () {
	MOEQUEST.checkAnswer();
	if (MOEQUEST.config.current_quest + 1 == MOEQUEST.questions.length) {
		console.debug("game over");
		return;
	}
	MOEQUEST.clearChecked();
	MOEQUEST.showQuest(MOEQUEST.questions[++ MOEQUEST.config.current_quest]);
};
MOEQUEST.checkAnswer = function () {
	var quest = MOEQUEST.questions[MOEQUEST.config.current_quest];
	var ans = new Array();
	$("#" + MOEQUEST.config.canvas + " .id-optionsection .check").each(function (index, value) {
		var check = $(value)[0];
		var val = parseInt($(value).attr('value'));
		if (! (val in quest.options)) {
			console.warn("invalid answer", val);
			return;
		}
		if (check.checked) {
			ans.push(val);
		}
	});
	var wrong_flag = false;
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
	MOEQUEST.config.results.push(! wrong_flag);
	$("#" + MOEQUEST.config.canvas + " .id-lastresult").attr("src",'resources/' + (wrong_flag ? "incorrect" : "correct") + '.ico').hide().css({visibility: "inherit"}).fadeIn("slow");
	MOEQUEST.showAnswer(quest);
};
MOEQUEST.clearChecked = function () {
	$("#" + MOEQUEST.config.canvas + " .id-optionsection .check").each(function (index, value) {
		$(value).attr('checked', false); 
	});
};









