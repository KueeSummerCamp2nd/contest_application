var teamNameList = ["TA", "チームhoge", "team_fuga", "noname"];
var runnerNameList = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"], ["j", "k", "l"]];

var teamNumber = teamNameList.length; //チーム数
var runnerNumber = runnerNameList[0].length; //1チームの人数

var nowRacing; // 今レースしてるか否か
var racingTeamIndex; //　今レースしてるチームのインデックス
var racingRunnerIndex; // 今レースしてる人が何番目かのインデックス

var batonPassTimeList = []; // 各選手のバトンパス時の時間を保存する
for (var i = 0; i < teamNumber; i++) {
  batonPassTimeList.push(new Array(runnerNumber + 1));
}

var timerId; // タイマー（用途不明）

// タブの切り替え
// レース中以外のみ切替可能
function switchTab(teamIndex) {
  if (!this.nowRacing) {
    this.racingRunnerIndex = this.runnerNumber;
    for (var i = 0; i < this.runnerNumber + 1; i++){
      if (this.batonPassTimeList[teamIndex][i] == void 0) {
        this.racingRunnerIndex = i;
        break;
      }
    }
    this.racingTeamIndex = teamIndex;
    document.getElementById("team_name").innerText = this.teamNameList[teamIndex];
    this.switchRunner();
    drawTime();
  } else {
    document.getElementById("tab" + String(this.racingTeamIndex + 1)).checked = true;
  }
}

// 走者の表示切り替え
// ゴール後はracingRunnerIndexがrunnerNumberと一致するので，displayedRacingRunnerIndexに補正
function switchRunner() {
  var displayedRacingRunnerIndex;
  if (this.racingRunnerIndex > this.runnerNumber - 1) {
    displayedRacingRunnerIndex = this.runnerNumber - 1;
  } else {
    displayedRacingRunnerIndex = this.racingRunnerIndex;
  }
  document.getElementById("runner_index").innerText = String(displayedRacingRunnerIndex + 1);
  document.getElementById("runner_name").innerText = this.runnerNameList[this.racingTeamIndex][displayedRacingRunnerIndex];
}

// バトンパスの処理
// 実装上，最後のゴールもバトンパスしたとみなす
function batonPass() {
  this.racingRunnerIndex += 1;
  this.batonPassTimeList[this.racingTeamIndex][this.racingRunnerIndex] = new Date().getTime();
  this.switchRunner();
}

// タイマー関連
// よくわからない
function startStopWatch() {
  this.nowRacing = true;
  timerId = setTimeout(runStopWatch, 10);
}
function stopStopWatch() {
  clearTimeout(timerId);
  drawTime();
  this.nowRacing = false;
}
function runStopWatch() {
	drawTime();
	timerId = setTimeout(runStopWatch, 10);
}

// 時間関係をすべて描写する関数
function drawTime() {
  var nowTime;
  var totalTime;

  if (this.batonPassTimeList[this.racingTeamIndex][this.runnerNumber] != void 0) {
    nowTime = this.batonPassTimeList[this.racingTeamIndex][this.runnerNumber];
  } else {
    nowTime = new Date().getTime();
  }

  if (this.batonPassTimeList[this.racingTeamIndex][0] != void 0) {
    // レース開始以降
    totalTime= new Date(nowTime - this.batonPassTimeList[this.racingTeamIndex][0]);
  } else {
    totalTime = new Date(0);
  }

  document.getElementById("total_score_value").innerText = convertStrTime(totalTime);
  document.getElementById("total_time_value").innerText = convertStrTime(totalTime);

  for (var i = 0; i < this.runnerNumber; i++) {
    var strSectionTime;
    if ((this.batonPassTimeList[this.racingTeamIndex][i] != void 0) && (this.batonPassTimeList[this.racingTeamIndex][i + 1] != void 0)) {
      strSectionTime = convertStrTime(new Date(this.batonPassTimeList[this.racingTeamIndex][i + 1] - this.batonPassTimeList[this.racingTeamIndex][i]));
    } else if ((this.batonPassTimeList[this.racingTeamIndex][i] != void 0)){
      strSectionTime = convertStrTime(new Date(nowTime - this.batonPassTimeList[this.racingTeamIndex][i]));
    } else {
      strSectionTime = ""; 
    }
    document.getElementById("section" + String(i + 1) + "_time_value").innerText = strSectionTime;
  }
  
  document.getElementById("new_record").innerText = ""
  if (this.racingRunnerIndex > this.runnerNumber - 1) {
    document.getElementById("total_score_value").style.color = "red"; 
    document.getElementById("total_time_value").style.fontWeight = "bold";
    
    var bestScore = new Date(3599990);
    var bestScoreTeamIndex = this.teamNumber;

    for (var i = 0; i < this.teamNumber; i++) {
      if ((this.batonPassTimeList[i][0] != void 0) && (this.batonPassTimeList[i][this.runnerNumber] != void 0)) {
        if (bestScore > new Date(this.batonPassTimeList[i][this.runnerNumber] - this.batonPassTimeList[i][0])) {
          bestScore = new Date(this.batonPassTimeList[i][this.runnerNumber] - this.batonPassTimeList[i][0]);
          bestScoreTeamIndex = i;
        }
      }
    }
    document.getElementById("best_score_value").innerText = convertStrTime(bestScore); 
    if (bestScoreTeamIndex == this.racingTeamIndex) {
      document.getElementById("new_record").innerText ="New Record !" 
    }   
  } else {
    document.getElementById("total_score_value").style.color = "black";
    document.getElementById("total_time_value").style.fontWeight = "normal";
  }  
  function convertStrTime(dateTime) {
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
}


function handleKeydown(event) {
  var keyCode = event.keyCode;
  if (keyCode == 32) {
    // スペースキー．正常にバトンパスしたとき
    if (!this.nowRacing) {
      if (this.racingRunnerIndex == 0) {
        // スタート時の処理
        this.batonPassTimeList[this.racingTeamIndex][0] = new Date().getTime();
        this.startStopWatch();
      } else if (this.racingRunnerIndex < this.runnerNumber - 1) {
        // 中断-再開の処理．未実装
      }
    }
    else {
      if (this.racingRunnerIndex < this.runnerNumber - 1) {
        //バトンパスの処理
        this.batonPass();
      }
      else if (this.racingRunnerIndex == this.runnerNumber - 1) {
        //ゴール時の処理
        this.batonPass();
        this.stopStopWatch();
      }
    }
  } else if (keyCode == 13) {
    // エンターキー．リタイアしたとき
    if (this.nowRacing) {
      var nowTime = new Date().getTime();
      var oneMinute = new Date(60000);
      if (nowTime - this.batonPassTimeList[this.racingTeamIndex][this.racingRunnerIndex] < oneMinute) {
        var penaltyTime = new Date(oneMinute - nowTime + this.batonPassTimeList[this.racingTeamIndex][this.racingRunnerIndex]);
        for (var i = 0; i < this.runnerNumber; i++) {
          if (this.batonPassTimeList[this.racingTeamIndex][i] != void 0) {
            this.batonPassTimeList[this.racingTeamIndex][i] = new Date(this.batonPassTimeList[this.racingTeamIndex][i] - penaltyTime);
          }
        }
      }
      if (this.racingRunnerIndex < this.runnerNumber - 1) {
        //バトンパスの処理
        this.batonPass();
      }
      else if (this.racingRunnerIndex == this.runnerNumber - 1) {
        //ゴール時の処理
        this.batonPass();
        this.stopStopWatch();
      } 
    }
  }
}

window.addEventListener("keydown", handleKeydown);

window.onload = function () {
  this.switchTab(0);
  this.nowRacing = false;
  this.drawTime();
}
