var team_list = ["TA", "チームhoge", "team_fuga", "noname"];
var student_name_list = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"], ["j", "k", "l"]];

var team_number = team_list.length;
var runner_number = team_list[0].length;
var runner_index_list = new Array(team_number); 

var displayed_team_index;
var running_tracer;

var totalTimeList = new Array(team_number);
var sectionTimeList = [];
for (var i = 0; i < team_number; i++) {
  sectionTimeList.push(new Array(runner_number));
}

//タイマー関連
var startTime;
var batonPassTime;
var timerId;					// タイマー

function switch_tab(team_index) {
  if (!running_tracer) {
    displayed_team_index = team_index;
    document.getElementById("team_name").innerText = this.team_list[team_index];
    display_runner();
    drawBestScore();
    drawTime();
  } else {
    document.getElementById("tab" + String(displayed_team_index + 1)).checked = true;
  }
}

function display_runner() {
  var displayed_number_index = this.runner_index_list[displayed_team_index];
  if (displayed_number_index <= runner_number) {
    document.getElementById("runner_index").innerText = String(displayed_number_index + 1);
    document.getElementById("runner_name").innerText = student_name_list[displayed_team_index][displayed_number_index];
  } else {
    document.getElementById("runner_index").innerText = String(runner_number + 1);
    document.getElementById("runner_name").innerText = student_name_list[displayed_team_index][runner_number];
  }
}

function baton_pass() {
  this.runner_index_list[displayed_team_index] += 1;
  batonPassTime = new Date().getTime();
  display_runner();
}

function startStopWatch() {
  timerId = setTimeout(runStopWatch, 10);
}

function stopStopWatch() {
  clearTimeout(timerId);
}

function runStopWatch() {
  var nowTime = new Date().getTime();
  var diffTotal = new Date(nowTime - startTime);
  var diffSection = new Date(nowTime - batonPassTime);
  
  totalTimeList[displayed_team_index] = diffTotal;
  sectionTimeList[displayed_team_index][runner_index_list[displayed_team_index]] = diffSection;
	drawTime();
	timerId = setTimeout(runStopWatch, 10);
}

function drawTime() {
  var diffTotalRestricted = totalTimeList[displayed_team_index];
  var diffTotalMax = new Date(3599990);
  if (diffTotalRestricted >= diffTotalMax) {
    diffTotalRestricted = new Date(0);
  }
  document.getElementById("total_score_value").innerText = convertstrTime(diffTotalRestricted);
  document.getElementById("total_time_value").innerText = convertstrTime(diffTotalRestricted);
  for (var i = 0; i < runner_number + 1; i++){
    if (i < this.runner_index_list[displayed_team_index]) {
      document.getElementById("section" + String(i + 1) + "_time_value").innerText = convertstrTime(this.sectionTimeList[displayed_team_index][i]);
    } else {
      document.getElementById("section" + String(i + 1) + "_time_value").innerText = "";
    }
  }
  document.getElementById("new_record").innerText =" "
  if (this.runner_index_list[displayed_team_index] > runner_number) {
    document.getElementById("total_score_value").style.color = "red"; 
    document.getElementById("total_time_value").style.fontWeight = "bold";
    
    var best_score = new Date(3599990);
    for (var i = 0; i < team_number; i++){
      if (best_score > this.totalTimeList[i]) {
        best_score = this.totalTimeList[i]
      }
    }
    if (best_score == this.totalTimeList[displayed_team_index]) {
      document.getElementById("new_record").innerText ="New Record !" 
    }
  } else {
    document.getElementById("total_score_value").style.color = "black";
    document.getElementById("total_time_value").style.fontWeight = "normal";
  }  
}

function drawBestScore() {
  var best_score = new Date(3599990);
  for (var i = 0; i < team_number; i++){
    if (best_score > this.totalTimeList[i]) {
      best_score = this.totalTimeList[i]
    }
  }
  document.getElementById("best_score_value").innerText = convertstrTime(best_score); 
}

function convertstrTime(dateTime) {
  var millisec = dateTime.getMilliseconds();
	var sec100 = Math.floor(millisec / 10);
	var sec = dateTime.getSeconds();
  var min = dateTime.getMinutes();

	var strTime = "";
	var strSec100, strSec, strMin;

	// 数値を文字に変換及び2桁表示設定
	strSec100 = "" + sec100;
	if ( strSec100.length < 2){
		strSec100 = "0" + strSec100;
	}
	strSec = "" + sec;
	if ( strSec.length < 2){
		strSec = "0" + strSec;
	}
	strMin = "" + min;
	if ( strMin.length < 2){
		strMin = "0" + strMin;
	}
  strTime = strMin + ":" + strSec + "." + strSec100;
  return strTime;
}

function handleKeydown(event) {
  var keyCode = event.keyCode;
  if (keyCode == 32) {
    if (!running_tracer) {
      if (this.runner_index_list[displayed_team_index] == 0) {
        // スタート時の処理
        running_tracer = true;
        startTime = new Date().getTime();
        batonPassTime = startTime;
        startStopWatch();
      } else if (this.runner_index_list[displayed_team_index] < runner_number) {
        // 中断-再開の処理．未実装
      }
    }
    else {
      if (this.runner_index_list[displayed_team_index] < runner_number) {
        //バトンパスの処理
        baton_pass();
      }
      else if (this.runner_index_list[displayed_team_index] == runner_number) {
        //ゴール時の処理
        baton_pass();
        running_tracer = false;
        stopStopWatch();
        drawBestScore();
        drawTime();
      }
    }
  }
}


window.addEventListener("keydown", handleKeydown);

window.onload = function () {
  for (var i = 0; i < this.team_number; i++){
    this.runner_index_list[i] = 0;
    this.totalTimeList[i] = new Date(3599990);
  };
  switch_tab(0);
  running_tracer = false;
  drawBestScore();
}
