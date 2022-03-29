var teamNameList = [];
var runnerNameList = [];

var teamNumber; //チーム数
var runnerNumber; //1チームの人数

var nowRacing; // 今レースしてるか否か
var racingTeamIndex; //　今レースしてるチームのインデックス
var racingRunnerIndex; // 今レースしてる人が何番目かのインデックス

// 各プレイヤーがスタートした（=二番目以降のプレイヤーはバトンパスした）時間を記録
var batonPassTimeList = [];

var bonusElementsList = [];

// ストップウォッチ関連は次のHPを参考にコピペしました．
// https://qiita.com/ryomaDsakamoto/items/c49a9d4cd2017405af1b
// よく分かってない部分もありながら実装したのでご了承ください．
var timerId;


class BonusElements {
  constructor() {
    this.coneTouchValue = 0; //int
    this.coneOverValue = 0;
    this.batonPass1 = ""; // stringで"Failed", "Success"
    this.stop1 = ""; // stringで"Failed", "Success"
    this.batonPass2 = "";
    this.stop2 = "";
    this.noRestart = "";
    this.gap1 = "";
    this.gap2 = "";
    this.bonusSecond = 0;
  }
  initialize() {
    this.coneTouchValue = 0;
    this.coneOverValue = 0;
    this.batonPass1 = "";
    this.stop1 = "";
    this.batonPass2 = "";
    this.stop2 = "";
    this.noRestart = "";
    this.gap1 = "";
    this.gap2 = "";
    this.bonusSecond = 0;
    this.updateBonusSecond();
  }
  returnElementsToArray() {
    return [this.coneTouchValue, this.coneOverValue, this.batonPass1, this.stop1, this.batonPass2, this.stop2, this.noRestart, this.gap1, this.gap2];
  }

  updateBonusSecond() {
    var bonusSecond = 0;
    // 区画ごとのパネル変更のボーナス．
    if (this.section1Option == "Nothing") {} else if (this.section1Option == "RightReverse") {
      bonusSecond -= 5;
    } else if (this.section1Option == "RightNormal") {
      bonusSecond -= 3;
    } else if (this.section1Option == "CurveReverse") {
      bonusSecond -= 10;
    } else if (this.section1Option == "CurveNormal") {
      bonusSecond -= 5;
    }
    if (this.section2Option == "Nothing") {} else if (this.section2Option == "RightReverse") {
      bonusSecond -= 5;
    } else if (this.section2Option == "RightNormal") {
      bonusSecond -= 3;
    } else if (this.section2Option == "CurveReverse") {
      bonusSecond -= 10;
    } else if (this.section2Option == "CurveNormal") {
      bonusSecond -= 5;
    }
    if (this.section3Option == "Nothing") {} else if (this.section3Option == "RightReverse") {
      bonusSecond -= 5;
    } else if (this.section3Option == "RightNormal") {
      bonusSecond -= 3;
    } else if (this.section3Option == "CurveReverse") {
      bonusSecond -= 10;
    } else if (this.section3Option == "CurveNormal") {
      bonusSecond -= 5;
    }

    // コーンに触れた回数・倒した回数のペナルティ
    bonusSecond += 3 * this.coneTouchValue;
    bonusSecond += 5 * this.coneOverValue;

    // 1回目のバトンパスボーナス
    if (this.batonPass1 == "Failed") {} else if (this.batonPass1 == "SmallSuccess") {
      bonusSecond -= 5;
    } else if (this.batonPass1 == "BigSuccess") {
      bonusSecond -= 25;
    }
    if (this.stop1 == "Failed") {} else if (this.stop1 == "Success") {
      bonusSecond -= 10;
    }

    // 2回目のバトンパスボーナス
    if (this.batonPass2 == "Failed") {} else if (this.batonPass2 == "Success") {
      bonusSecond -= 10;
    } 
    if (this.stop2 == "Failed") {} else if (this.stop2 == "Success") {
      bonusSecond -= 10;
    }

    // 3回目のバトンパスボーナス
    if (this.stop3 == "Failed") {} else if (this.stop3 == "Success") {
      bonusSecond -= 10;
    }

    this.bonusSecond = bonusSecond;

    // コーン触れた回数とかをhtmlに反映．
    // なんでこの処理をここでやってるのかは...忘れました
    document.getElementById("cone_touch_value").innerText = String(this.coneTouchValue);
    document.getElementById("cone_over_value").innerText = String(this.coneOverValue);
    document.getElementById("response_light_value").innerText = String(this.responseLightValue);
    document.getElementById("response_music_value").innerText = String(this.responseMusicValue);

    // ボーナス点を加算して時刻を表示
    drawTime();
  }
}

// ここから地獄のように関数を定義
// というのも各セクションに1つずつ関数を割り当ててるため．
// 改善求む
function pressSection1Option(optionValue) {
  bonusElementsList[racingTeamIndex].section1Option = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressSection2Option(optionValue) {
  bonusElementsList[racingTeamIndex].section2Option = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressSection3Option(optionValue) {
  bonusElementsList[racingTeamIndex].section3Option = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressConeTouchMinus() {
  if (bonusElementsList[racingTeamIndex].coneTouchValue > 0) {
    bonusElementsList[racingTeamIndex].coneTouchValue -= 1;
    bonusElementsList[racingTeamIndex].updateBonusSecond();
  }
}

function pressConeTouchPlus() {
  bonusElementsList[racingTeamIndex].coneTouchValue += 1;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressConeOverMinus() {
  if (bonusElementsList[racingTeamIndex].coneOverValue > 0) {
    bonusElementsList[racingTeamIndex].coneOverValue -= 1;
    bonusElementsList[racingTeamIndex].updateBonusSecond();
  }
}

function pressConeOverPlus() {
  bonusElementsList[racingTeamIndex].coneOverValue += 1;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressBatonpass1(optionValue) {
  bonusElementsList[racingTeamIndex].batonPass1 = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressStop1(optionValue) {
  bonusElementsList[racingTeamIndex].stop1 = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}


function pressStop2(optionValue) {
  bonusElementsList[racingTeamIndex].stop2 = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressRestart(optionValue) {
  bonusElementsList[racingTeamIndex].noRestart = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressGap1(optionValue) {
  bonusElementsList[racingTeamIndex].gap2 = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}

function pressGap2(optionValue) {
  bonusElementsList[racingTeamIndex].gap2 = optionValue;
  bonusElementsList[racingTeamIndex].updateBonusSecond();
}
// 地獄の関数定義ここまで

// タブの切り替え
// レース中にチームが切り替わることはないので，レース中以外のみ切替可能とする
function switchTab(teamIndex) {
  if (!nowRacing) {
    racingRunnerIndex = runnerNumber;
    for (var i = 0; i < runnerNumber + 1; i++) {
      if (batonPassTimeList[teamIndex][i] == void 0) {
        racingRunnerIndex = i;
        break;
      }
    }
    racingTeamIndex = teamIndex;
    document.getElementById("team_name").innerText = teamNameList[teamIndex];
    switchRunner();
    drawTime();
  } else {
    document.getElementById("tab" + String(racingTeamIndex + 1)).checked = true;
  }
  bonusElementsList[teamIndex].updateBonusSecond();
}

// バトンパスの処理
// 実装上，最後のゴールもバトンパスしたとみなす
function batonPass() {
  racingRunnerIndex += 1;
  batonPassTimeList[racingTeamIndex][racingRunnerIndex] = new Date().getTime();
  switchRunner();
}

// 走者の表示切り替え
function switchRunner() {
  var displayedRacingRunnerIndex;
  if (racingRunnerIndex > runnerNumber - 1) {
    displayedRacingRunnerIndex = runnerNumber - 1;
  } else {
    // バトンパスした結果，走者の順目が走者数より多い => 最後の走者がゴールした
    displayedRacingRunnerIndex = racingRunnerIndex;
  }
  document.getElementById("runner_index").innerText = String(displayedRacingRunnerIndex + 1);
  document.getElementById("runner_name").innerText = runnerNameList[racingTeamIndex][displayedRacingRunnerIndex];
}

// タイマー関連のコピペ
function startStopWatch() {
  nowRacing = true;
  timerId = setTimeout(runStopWatch, 10);
}

function stopStopWatch() {
  clearTimeout(timerId);
  drawTime();
  nowRacing = false;
}

function runStopWatch() {
  drawTime();
  timerId = setTimeout(runStopWatch, 10);
}

// 時間関係を描写する関数
function drawTime() {
  var nowTime; // いまの時間
  var totalTimeLength; //レースが開始してからの時間の長さ

  if (batonPassTimeList[racingTeamIndex][runnerNumber] != void 0) {
    // batonPassTimeList[racingTeamIndex][runnerNumber]は，runnerNumber + 1番目のセクションが終了すると埋まる
    // 埋まってれば，時刻を測る必要ない
    nowTime = batonPassTimeList[racingTeamIndex][runnerNumber];
  } else {
    nowTime = new Date().getTime();
  }

  if (batonPassTimeList[racingTeamIndex][0] != void 0) {
    // batonPassTimeList[racingTeamIndex][0]は，レースを開始した時刻
    // 現在の時刻からbatonPassTimeList[racingTeamIndex][0]を引いた長さが，レースを開始してからの長さ
    totalTimeLength = new Date(nowTime - batonPassTimeList[racingTeamIndex][0]);
  } else {
    totalTimeLength = new Date(0);
  }
  document.getElementById("total_score_value").innerText = convertStrTime(new Date(totalTimeLength - new Date(-bonusElementsList[racingTeamIndex].bonusSecond * 1000)));
  document.getElementById("total_time_value").innerText = convertStrTime(totalTimeLength);

  // 各セクションでの時間の長さを計算して描写
  for (var i = 0; i < runnerNumber; i++) {
    var strSectionTime;
    if ((batonPassTimeList[racingTeamIndex][i] != void 0) && (batonPassTimeList[racingTeamIndex][i + 1] != void 0)) {
      strSectionTime = convertStrTime(new Date(batonPassTimeList[racingTeamIndex][i + 1] - batonPassTimeList[racingTeamIndex][i]));
    } else if ((batonPassTimeList[racingTeamIndex][i] != void 0)) {
      strSectionTime = convertStrTime(new Date(nowTime - batonPassTimeList[racingTeamIndex][i]));
    } else {
      strSectionTime = "";
    }
    document.getElementById("section" + String(i + 1) + "_time_value").innerText = strSectionTime;
  }

  // Best Record!と表示するか
  document.getElementById("new_record").innerText = "";
  var bestScore = Infinity;
  var bestScoreTeamIndex = teamNumber;

  for (var i = 0; i < teamNumber; i++) {
    if ((batonPassTimeList[i][0] != void 0) && (batonPassTimeList[i][runnerNumber] != void 0)) {
      if (bestScore > new Date(batonPassTimeList[i][runnerNumber] - batonPassTimeList[i][0] - new Date(-bonusElementsList[i].bonusSecond * 1000))) {
        bestScore = new Date(batonPassTimeList[i][runnerNumber] - batonPassTimeList[i][0] - new Date(-bonusElementsList[i].bonusSecond * 1000));
        bestScoreTeamIndex = i;
      }
    }
  }
  if (bestScore != Infinity) {
    document.getElementById("best_score_value").innerText = convertStrTime(bestScore);
  } else {
    document.getElementById("best_score_value").innerText = "+99:99.99";
  }
  if (racingRunnerIndex > runnerNumber - 1) {
    document.getElementById("total_score_value").style.color = "red";
    document.getElementById("total_time_value").style.fontWeight = "bold";

    if (bestScoreTeamIndex == racingTeamIndex) {
      document.getElementById("new_record").innerText = "Best Record !"
    }
  } else {
    document.getElementById("total_score_value").style.color = "black";
    document.getElementById("total_time_value").style.fontWeight = "normal";
  }

  // 時刻をStringに変換
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

// 初期セットアップ
function initialSetUp() {
  // チーム名と参加者の名前を読み取り
  importNameLists();
  teamNumber = teamNameList.length; //チーム数
  runnerNumber = runnerNameList[0].length; //1チームの人数 
  // この2つは変わっても大丈夫（とはいえ，UI的に1チーム3人だろうが...）

  // 各プレイヤーのスタート時間読み取り
  // この目的は，ファイルを保存した後であれば，ブラウザを閉じても，同じ画面を表示させるため
  // ダウンロードしたcsvファイルは./dataフォルダ内に入れておくこと
  var timeData = csvToArray("data/result_time.csv");

  if (timeData.length) {
    // csvファイルが存在したなら，そのcsvファイルからbatonPassTimeListを復旧
    for (var i = 0; i < teamNumber; i++) {
      var batonPassTimeTeamI = [];
      for (var j = 0; j < runnerNumber + 1; j++) {
        if (timeData[i][j] == "") {
          batonPassTimeList.push(new Array(runnerNumber + 1));
          break
        }
        batonPassTimeTeamI.push(timeData[i][j]);
        if (j == runnerNumber) {
          batonPassTimeList.push(batonPassTimeTeamI);
        }
      }
    }
  } else {
    // なかったなら，batonPassTimeListを初期化
    for (var i = 0; i < teamNumber; i++) {
      batonPassTimeList.push(new Array(runnerNumber + 1));
    }
  }

  makeTabs();
  makeSections();

  // ボーナス情報も読み取り
  // !!注意!! 読み取って内部変数は変更しているのだが，htmlの見た目には反映されてない
  // 反映処理を書けばいいのだろうが，分からなかった...
  var stateData = csvToArray("data/result_state.csv");
  for (var i = 0; i < teamNumber; i++) {
    var bonusElementsTeamI = new BonusElements();
    if (stateData.length) {
      bonusElementsTeamI.section1Option = stateData[i][0];
      bonusElementsTeamI.section2Option = stateData[i][1];
      bonusElementsTeamI.section3Option = stateData[i][2];
      bonusElementsTeamI.coneTouchValue = Number(stateData[i][3]);
      bonusElementsTeamI.coneOverValue = Number(stateData[i][4]);
      bonusElementsTeamI.batonPass1 = stateData[i][5];
      bonusElementsTeamI.stop1 = stateData[i][6];
      bonusElementsTeamI.responseLightValue = Number(stateData[i][7]);
      bonusElementsTeamI.responseMusicValue = Number(stateData[i][8]);
      bonusElementsTeamI.batonPass2 = stateData[i][9];
      bonusElementsTeamI.stop2 = stateData[i][10];
      bonusElementsTeamI.stop3 = stateData[i][11];
    }
    bonusElementsList.push(bonusElementsTeamI);
  }

  function importNameLists() {
    var nameData = csvToArray("data/name_register.csv");
    for (var i = 0; i < nameData.length; i++) {
      teamNameList.push(nameData[i][0]);
      var runnerNameTeamI = [];
      for (var j = 1; j < nameData[i].length; j++) {
        runnerNameTeamI.push(nameData[i][j]);
      }
      runnerNameList.push(runnerNameTeamI);
    }
  }

  // htmlの・Section: Xを書き換え
  function makeSections() {
    var objSection = document.getElementById("section_block");

    for (var i = 0; i < runnerNumber; i++) {
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

  // htmlのタブ部分
  // どっかのページをコピペしたんですが忘れました！
  function makeTabs() {
    var objCpTab = document.getElementById("cp_tab_block");
    for (var i = 0; i < teamNumber; i++) {
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
      labelTabI.innerText = teamNameList[i];

      objCpTab.appendChild(inpTabI);
      objCpTab.appendChild(labelTabI);
    }
    var objCpTabPanels = document.createElement('div');
    objCpTabPanels.setAttribute("class", "cp_tabpanels");
    for (var i = 0; i < teamNumber; i++) {
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

// CSVファイルダウンロード(Chromeのみ)
// https://ryotah.hatenablog.com/entry/2017/03/22/211227 のコピペ
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

// キーを押したときのイベントを登録
function handleKeydown(event) {
  var keyCode = event.keyCode;
  if (keyCode == 90) {
    // zキー．これはバトンパスしたときに押す
    if (!nowRacing) {
      if (racingRunnerIndex == 0) {
        // スタート時の処理
        batonPassTimeList[racingTeamIndex][0] = new Date().getTime();
        startStopWatch();
      } else if (racingRunnerIndex < runnerNumber - 1) {
        // 中断状態を再開する処理となるべきだが，未実装
      }
    } else {
      if (racingRunnerIndex < runnerNumber - 1) {
        //バトンパスの処理
        batonPass();
      } else if (racingRunnerIndex == runnerNumber - 1) {
        //ゴール時の処理
        batonPass();
        stopStopWatch();
      }
    }
  } else if (keyCode == 65) {
    // aキー．これはリタイアしたときに押す
    if (nowRacing) {
      var nowTime = new Date().getTime();
      // 1セクションあたりの最大時間は90秒とする
      // 90秒以内にリタイアしたなら，その差分をペナルティとする
      // 実装としては，これまでのプレイヤーのスタート時間からペナルティ分を引く
      var sectionLimit = 90 * 1000;
      if (nowTime - batonPassTimeList[racingTeamIndex][racingRunnerIndex] < sectionLimit) {
        var penalty = sectionLimit - (nowTime - batonPassTimeList[racingTeamIndex][racingRunnerIndex]);
        for (var i = 0; i < runnerNumber; i++) {
          if (batonPassTimeList[racingTeamIndex][i] != void 0) {
            batonPassTimeList[racingTeamIndex][i] -= penalty;
          }
        }
      }
      if (racingRunnerIndex < runnerNumber - 1) {
        //バトンパスの処理
        batonPass();
      } else if (racingRunnerIndex == runnerNumber - 1) {
        //ゴール時の処理
        batonPass();
        stopStopWatch();
      }
    }
  } else if (keyCode == 67) {
    // cキー．これは結果を保存したいときに押す
    // ボーナスと各プレイヤーのスタート時間がcsv形式でダウンロードされる
    // ダウンロードしたcsvファイルは./dataフォルダ内に入れておくこと
    if (!nowRacing) {
      var arr = [];
      for (var i = 0; i < teamNumber; i++) {
        arr.push(bonusElementsList[i].returnElementsToArray());
      }
      downloadArrayToCSV(arr, "result_state.csv");
      downloadArrayToCSV(batonPassTimeList, "result_time.csv");
    }
  } else if (keyCode == 27) {
    // escキー．当画面の結果を削除したいときに押す
    if (!nowRacing) {
      batonPassTimeList[racingTeamIndex] = new Array(runnerNumber + 1);
      racingRunnerIndex = 0;
      bonusElementsList[racingTeamIndex].initialize();
      switchTab(racingTeamIndex);
    }
  } else if (keyCode == 88) {
    // xキー．これはzキーの動作をやり直したいときに押す
    // ただし，間違ってリタイアした，あるいはゴールした場合は復旧不可の実装となっております
    if ((racingRunnerIndex > 0) && (nowRacing)) {
      batonPassTimeList[racingTeamIndex][racingRunnerIndex] = undefined;
      racingRunnerIndex -= 1;
      switchRunner();
    }
  }
}

// キーを押すイベントを登録
window.addEventListener("keydown", handleKeydown);

// htmlを読み込むと実行
window.onload = function () {
  initialSetUp();

  switchTab(0);
  nowRacing = false;
}
