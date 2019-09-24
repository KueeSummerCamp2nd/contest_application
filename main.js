var teamNameList = [];
var runnerNameList = [];

var teamNumber; //チーム数
var runnerNumber; //1チームの人数

var nowRacing; // 今レースしてるか否か
var racingTeamIndex; //　今レースしてるチームのインデックス
var racingRunnerIndex; // 今レースしてる人が何番目かのインデックス

var bonus = [0, 0, 0, 0];
var bonus_episode = [
  [],
  [],
  [],
  []
]

var batonPassTimeList = []; // 各選手のレース開始時間+バトンパス時の時間を保存する
var bonusSecondList = [];

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
  print_initial_bonus_episode()
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
  document.getElementById("total_score_value").innerText = convertStrTime(new Date(totalTimeLength - this.bonusSecondList[this.racingTeamIndex] * 1000));
  document.getElementById("total_time_value").innerText = convertStrTime(totalTimeLength);

  document.getElementById("sum_score").innerText = convert_sec_to_min(Math.floor(totalTimeLength / 1000) + bonus[this.racingTeamIndex]);

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

  document.getElementById("new_record").innerText = "";
  var bestScore = Infinity;
  var bestScoreTeamIndex = this.teamNumber;

  for (var i = 0; i < this.teamNumber; i++) {
    if ((this.batonPassTimeList[i][0] != void 0) && (this.batonPassTimeList[i][this.runnerNumber] != void 0)) {
      if (bestScore > new Date(this.batonPassTimeList[i][this.runnerNumber] - this.batonPassTimeList[i][0])) {
        bestScore = new Date(this.batonPassTimeList[i][this.runnerNumber] - this.batonPassTimeList[i][0]);
        bestScoreTeamIndex = i;
      }
    }
  }
  if (bestScore != Infinity) {
    document.getElementById("best_score_value").innerText = convertStrTime(bestScore);
  } else {
    document.getElementById("best_score_value").innerText = "59:59.59";
  }
  if (this.racingRunnerIndex > this.runnerNumber - 1) {
    document.getElementById("total_score_value").style.color = "red";
    document.getElementById("total_time_value").style.fontWeight = "bold";

    if (bestScoreTeamIndex == this.racingTeamIndex) {
      document.getElementById("new_record").innerText = "New Record !"
    }
  } else {
    document.getElementById("total_score_value").style.color = "black";
    document.getElementById("total_time_value").style.fontWeight = "normal";
  }

  function convertStrTime(dateTime) {
    var strSign;
    if (dateTime >= 0) {
      strSign = "+";
    } else {
      dateTime = new Date(0 - dateTime);
      strSign = "-";
    }
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
    strTime = strSign + strMin + ":" + strSec + "." + strSec100;
    return strTime;
  }
}


function reset_bonus() {
  bonus[racingTeamIndex] = 0;
  bonus_to_show = convert_sec_to_min(0);
  bonus_episode[racingTeamIndex] = []
  str_to_show = bonus_to_show;
  document.getElementById("bonus_episode").innerHTML = "";
  var myp = document.getElementById("bonus_number");
  myp.innerHTML = str_to_show;
  document.getElementById("sum_score").innerText = convert_sec_to_min(Math.floor(0) + bonus[racingTeamIndex]);
}

function convert_sec_to_min(time) {
  //秒単位の入力を分に直す 180 -> 3 : 00
  if (time < 0) {
    sign = "-";
    time = -time;
  } else {
    sign = "+";
  }
  min = Math.floor(time / 60);
  if (min < 10) {
    min_padding = "0";
  } else {
    min_padding = "";
  }
  sec = time % 60;
  if (sec < 10) {
    sec_padding = "0";
  } else {
    sec_padding = "";
  }
  return sign + min_padding + String(min) + "." + sec_padding + String(sec)
}

function print_bonus_episode(addition) {
  bonus_episode[racingTeamIndex].splice(bonus_episode[racingTeamIndex].length, 0, addition);
  episode = "";
  for (var i = 0; i < bonus_episode[racingTeamIndex].length; i++) {
    episode = episode + bonus_episode[racingTeamIndex][i] + '<br>';
  }
  document.getElementById("bonus_episode").innerHTML = episode;
}

function print_initial_bonus_episode() {
  document.getElementById("bonus_episode").innerHTML = "";
}

function alert_bonus(addition_score, addition_episode) {
  print_bonus_episode(addition_episode)

  var nowTime;
  var totalTime;

  if (this.batonPassTimeList[this.racingTeamIndex][this.runnerNumber] != void 0) {
    nowTime = this.batonPassTimeList[this.racingTeamIndex][this.runnerNumber];
  } else {
    nowTime = new Date().getTime();
  }

  if (this.batonPassTimeList[this.racingTeamIndex][0] != void 0) {
    // レース開始以降
    totalTime = new Date(nowTime - this.batonPassTimeList[this.racingTeamIndex][0]);
  } else {
    totalTime = new Date(0);
  }

  bonus[racingTeamIndex] = bonus[racingTeamIndex] + addition_score;
  bonus_to_show = convert_sec_to_min(bonus[racingTeamIndex]);
  str_to_show = bonus_to_show;
  var myp = document.getElementById("bonus_number");
  myp.innerHTML = str_to_show;

  document.getElementById("sum_score").innerText = convert_sec_to_min(Math.floor(totalTime / 1000) + bonus[racingTeamIndex]);
}

function drawInitialBonus() {
  bonus_to_show = convert_sec_to_min(bonus[racingTeamIndex]);
  var myp = document.getElementById("bonus_number");
  myp.innerHTML = bonus_to_show;
}


function initialSetUp() {
  importNameLists();
  this.teamNumber = this.teamNameList.length; //チーム数
  this.runnerNumber = this.runnerNameList[0].length; //1チームの人数
  var data = this.csvToArray("data/result.csv");
  if (data.length) {
    for (var i = 0; i < this.teamNumber; i++) {
      this.bonusSecondList.push(0);
      var batonPassTimeTeamI = [];
      for (var j = 0; j < this.runnerNumber + 1; j++) {
        if (data[i][j] == "") {
          this.batonPassTimeList.push(new Array(this.runnerNumber + 1));
          break
        }
        batonPassTimeTeamI.push(data[i][j]);
        if (j == this.runnerNumber) {
          this.batonPassTimeList.push(batonPassTimeTeamI);
        }
      }
    }
  } else {
    for (var i = 0; i < this.teamNumber; i++) {
      this.bonusSecondList.push(0);
      this.batonPassTimeList.push(new Array(this.runnerNumber + 1));

    }
  }
  makeTabs();
  makeSections();

  function importNameLists() {
    var nameData = this.csvToArray("data/name_register.csv");
    for (var i = 0; i < nameData.length; i++) {
      this.teamNameList.push(nameData[i][0]);
      var runnerNameTeamI = [];
      for (var j = 1; j < nameData[i].length; j++) {
        runnerNameTeamI.push(nameData[i][j]);
      }
      this.runnerNameList.push(runnerNameTeamI);
    }
  }

  function makeSections() {
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
}

// CSVファイル読み込み
function csvToArray(path) {
  var csvData = new Array();
  var data = new XMLHttpRequest();
  data.open("GET", path, false);
  data.send(null);
  var LF = String.fromCharCode(10);
  var lines = data.responseText.split(LF);
  for (var i = 0; i < lines.length; ++i) {
    var cells = lines[i].split(",");
    if (cells.length != 1) {
      csvData.push(cells);
    }
  }
  return csvData;
}
//CSVファイルダウンロード
function downloadArrayToCSV(content, filename) {
  var formatCSV = '';
  for (var i = 0; i < content.length; i++) {
    var value = content[i];
    var result_i = "";
    for (var j = 0; j < value.length; j++) {
      if (value[j] == void 0) {
        result_i = "";
        for (var k = 0; k < value.length; k++) {
          result_i += ","
        }
        break;
      } else {
        result_i += String(value[j]) + ",";
      }
    }
    formatCSV += result_i;
    formatCSV += '\n';
  }

  const anchor = document.createElement('a');
  if (window.URL && anchor.download !== undefined) {
    // utf8
    const bom = '\uFEFF';
    const blob = new Blob([bom, formatCSV], {
      type: 'text/csv'
    });
    anchor.download = filename;

    // window.URL.createObjectURLを利用
    // https://developer.mozilla.org/ja/docs/Web/API/URL/createObjectURL
    anchor.href = window.URL.createObjectURL(blob);

    // これでも可
    // anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(bom + data);

    // firefoxでは一度addしないと動かない
    document.body.appendChild(anchor);
    anchor.click();
    anchor.parentNode.removeChild(anchor);
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
      var sectionLimit = 60 * 1000;
      if (nowTime - this.batonPassTimeList[this.racingTeamIndex][this.racingRunnerIndex] < sectionLimit) {
        var penalty = sectionLimit - (nowTime - this.batonPassTimeList[this.racingTeamIndex][this.racingRunnerIndex]);
        for (var i = 0; i < this.runnerNumber; i++) {
          if (this.batonPassTimeList[this.racingTeamIndex][i] != void 0) {
            this.batonPassTimeList[this.racingTeamIndex][i] -= penalty;
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
  } else if (keyCode == 67) {
    // cキー．結果保存
    if (!this.nowRacing) {
      this.downloadArrayToCSV(batonPassTimeList, "result.csv");
    }
  } else if (keyCode == 86) {
    // vキー．当画面の結果削除
    if (!this.nowRacing) {
      this.batonPassTimeList[this.racingTeamIndex] = new Array(this.runnerNumber + 1);
      this.racingRunnerIndex = 0;
      this.drawTime();
    }
  }
}

window.addEventListener("keydown", handleKeydown);

window.onload = function () {
  this.initialSetUp();

  this.switchTab(0);
  this.nowRacing = false;

  this.drawInitialBonus();
}
