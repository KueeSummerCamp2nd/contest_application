var teamNameList = ["TA", "チームhoge", "team_fuga", "noname", "hohge"];
var runnerNameList = [
  ["a", "b", "c"],
  ["d", "e", "f"],
  ["g", "h", "i"],
  ["j", "k", "l"],
  ["j", "k", "l"]
];

var teamNumber = teamNameList.length; //チーム数
var runnerNumber = runnerNameList[0].length; //1チームの人数

var nowRacing; // 今レースしてるか否か
var racingTeamIndex; //　今レースしてるチームのインデックス
var racingRunnerIndex; // 今レースしてる人が何番目かのインデックス

var bonus = [0, 0, 0, 0];

var batonPassTimeList = []; // 各選手のレース開始時間+バトンパス時の時間を保存する
for (var i = 0; i < teamNumber; i++) {
  batonPassTimeList.push(new Array(runnerNumber + 1));
}

var timerId; // タイマー（用途不明）

// タブの切り替え
// レース中以外のみ切替可能
function switchTab(teamIndex) {
  if (!this.nowRacing) {
    this.racingRunnerIndex = this.runnerNumber;
    for (var i = 0; i < this.runnerNumber + 1; i++) {
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
  drawInitialBonus()
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
  this.drawTime();
  this.nowRacing = false;
}

function runStopWatch() {
  this.drawTime();
  timerId = setTimeout(runStopWatch, 10);
}

// 時間関係をすべて描写する関数
function drawTime() {
  var nowTime; // いまの時間
  var totalTimeLength; //レースが開始してからの時間の長さ

  if (this.batonPassTimeList[this.racingTeamIndex][this.runnerNumber] != void 0) {
    nowTime = this.batonPassTimeList[this.racingTeamIndex][this.runnerNumber];
  } else {
    nowTime = new Date().getTime();
  }

  if (this.batonPassTimeList[this.racingTeamIndex][0] != void 0) {
    // レース開始以降
    totalTimeLength = new Date(nowTime - this.batonPassTimeList[this.racingTeamIndex][0]);
  } else {
    totalTimeLength = new Date(0);
  }

  document.getElementById("total_score_value").innerText = convertStrTime(totalTimeLength);
  document.getElementById("total_time_value").innerText = convertStrTime(totalTimeLength);

  for (var i = 0; i < this.runnerNumber; i++) {
    var strSectionTime;
    if ((this.batonPassTimeList[this.racingTeamIndex][i] != void 0) && (this.batonPassTimeList[this.racingTeamIndex][i + 1] != void 0)) {
      strSectionTime = convertStrTime(new Date(this.batonPassTimeList[this.racingTeamIndex][i + 1] - this.batonPassTimeList[this.racingTeamIndex][i]));
    } else if ((this.batonPassTimeList[this.racingTeamIndex][i] != void 0)) {
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
      document.getElementById("new_record").innerText = "New Record !"
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
    if (strSec100.length < 2) {
      strSec100 = "0" + strSec100;
    }
    strSec = "" + sec;
    if (strSec.length < 2) {
      strSec = "0" + strSec;
    }
    strMin = "" + min;
    if (strMin.length < 2) {
      strMin = "0" + strMin;
    }
    strTime = strMin + ":" + strSec + "." + strSec100;
    return strTime;
  }
}


function handleKeydown(event) {
  var keyCode = event.keyCode;
  if (keyCode == 90) {
    // zキー．正常にバトンパスしたとき
    if (!this.nowRacing) {
      if (this.racingRunnerIndex == 0) {
        // スタート時の処理
        this.batonPassTimeList[this.racingTeamIndex][0] = new Date().getTime();
        this.startStopWatch();
      } else if (this.racingRunnerIndex < this.runnerNumber - 1) {
        // 中断-再開の処理．未実装
      }
    } else {
      if (this.racingRunnerIndex < this.runnerNumber - 1) {
        //バトンパスの処理
        this.batonPass();
      } else if (this.racingRunnerIndex == this.runnerNumber - 1) {
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
      } else if (this.racingRunnerIndex == this.runnerNumber - 1) {
        //ゴール時の処理
        this.batonPass();
        this.stopStopWatch();
      }
    }
  } else if (keyCode == 88) {
    // xキー．入力を取り消すとき
  }
}

window.addEventListener("keydown", handleKeydown);

function reset_bonus() {
  bonus[displayed_team_index] = 0
  bonus_to_show = convert_sec_to_min(0)
  str_to_show = bonus_to_show;
  var myp = document.getElementById("bonus");
  myp.innerHTML = str_to_show;
}

function convert_sec_to_min(time) {
  //秒単位の入力を分に直す 180 -> 3 : 00
  if (time < 0) {
    sign = "-";
    time = -time;
  } else {
    sign = "+"
  }
  min = Math.floor(time / 60);
  if (min < 10) {
    min_padding = "0"
  } else {
    min_padding = ""
  }
  sec = time % 60;
  if (sec < 10) {
    sec_padding = "0"
  } else {
    sec_padding = ""
  }
  return sign + min_padding + String(min) + "." + sec_padding + String(sec)
}

function alert_bonus(addition) {

  bonus[displayed_team_index] = bonus[displayed_team_index] + addition
  bonus_to_show = convert_sec_to_min(bonus[displayed_team_index])
  str_to_show = bonus_to_show;
  var myp = document.getElementById("bonus");
  myp.innerHTML = str_to_show;
}

function drawInitialBonus() {
  bonus_to_show = convert_sec_to_min(bonus[displayed_team_index])
  var myp = document.getElementById("bonus");
  myp.innerHTML = bonus_to_show;
}

function makeTabs() {
  var objCpTab = document.getElementById("cp_tab_block");
  for (var i = 0; i < this.teamNumber; i++) {
    var inpTabI = document.createElement('input');
    inpTabI.setAttribute("type", "radio");
    inpTabI.setAttribute("name", "cp_tab");
    inpTabI.setAttribute("id", "tab" + String(i + 1));
    inpTabI.setAttribute("onclick", "switchTab(" + String(i) + ")");
    if (i == 0) {
      inpTabI.setAttribute("checked", true);
    }
    var labelTabI = document.createElement('label');
    labelTabI.htmlFor = "tab" + String(i + 1);
    labelTabI.innerText = this.teamNameList[i];

    objCpTab.appendChild(inpTabI);
    objCpTab.appendChild(labelTabI);
  }
  var objCpTabPanels = document.createElement('div');
  objCpTabPanels.setAttribute("class", "cp_tabpanels");
  for (var i = 0; i < this.teamNumber; i++) {
    var objCpTabI = document.createElement('div');
    objCpTabI.setAttribute("class", "cp_tabpanel");
    objCpTabPanels.appendChild(objCpTabI);
  }
  objCpTab.appendChild(objCpTabPanels);
}

window.onload = function () {
  var objSection = document.getElementById("section_block");

  for (var i = 0; i < this.runnerNumber; i++) {
    var objSectionI = document.createElement('div');
    objSectionI.style.display = "flex";

    var objSectionITitle = document.createElement('div');
    objSectionITitle.innerHTML = "・Section " + String(i + 1) + "：";

    var objSectionITime = document.createElement('div');
    objSectionITime.id = "section" + String(i + 1) + "_time_value";

    objSectionI.appendChild(objSectionITitle);
    objSectionI.appendChild(objSectionITime);
    objSection.appendChild(objSectionI);

  }
  this.makeTabs();

  this.switchTab(0);
  this.nowRacing = false;
  this.drawTime();
  this.drawInitialBonus();
}
