// Todo
// 1.  When keyboard changes to green it should lock
// 4.  See if LogTries(nTries=0) && GetHistogramData() can be combined into one function?


var g_sGuess = "";
var nGuess = 1;
var g_aWordList = null;
var g_sTodaysWord = null;
var g_aCookieString = [];
var g_bNotFinished = false;
var g_nGameNumber;

onload = () => {
    InstructionsFrame();
    GetTodaysWord();
}

function GetTodaysWord() {
    postFileFromServer("TodaysWord.txt", "", TodaysWordCallback);
    function TodaysWordCallback(data) {
        g_sTodaysWord = data.trim();
        GetWordList();
    }
}

function InstructionsFrame() {
    document.getElementById('Main').innerHTML = "";

    let sTitle = "SIXLETTERS";
    let sPage = "";
    sPage += "<div id='instructions' class='endgameFrame' style='text-align: center; padding-top: 50px; padding-bottom: 10px; padding-right: 15px; padding-left: 15px;' >";
    //sPage += "<div class='xOutEndgame' style='font-size: 40px; left: 50%; transform: translate(-50%); width: auto; height: auto;' onClick='MainFrame()'>✖</div>";
    sPage += "<div class='wordOfTheDayContainer' style='margin-top: -5px;'>";
    for (let i=0; i<sTitle.length; i++) {
        sPage += "<div class='wordOfTheDay bouncy' style='font-size: 22px; width: 22px;animation-delay:"+(i/20)+"s'>"+sTitle.charAt(i)+"</div>";
    }
    sPage += "</div>";
    sPage += "<div style='font-size: 17px;'>";
    //sPage += "<span style='font-size: 25px;'><b>Six Letters</b></span>"
    sPage += "<br><br>Guess the word in up to ten tries.  Each guess must be an actual six-letter word.<br><br>After each guess, the squares will change colors.<div style='text-align: left;'><ul><li><span style='color: lightgreen; background: black;'><b>Green</b></span> is a letter in the word in the right place.  </li><li><span style='color: yellow; background: black;'><b>Yellow</b></span> is a letter in the word, but in the wrong place.  </li><li><span style='color: lightgray; background: black;'><b>Gray</span> is a letter that is not in the word.</li></ul></div></div>";
    sPage += "<br><button style='font-size: 17px; padding: 10px;' onClick='MainFrame()'>Begin</button>";
    sPage += "</div>";
    document.getElementById('Main').style.opacity = 0.1;
    document.getElementById('Body').innerHTML += sPage;
}

function MainFrame() {
    document.getElementById('Main').style.opacity = 1;
    document.body.removeChild(document.getElementById('instructions'));

    let sPage = "";

    sPage += "<div class='topBar'>";
    sPage += "<div id='instructions' style='position: absolute; left: 5px; width: auto; height: auto; cursor: pointer;' onClick='InstructionsFrame()'>&#9432;</div>";
    sPage += "<div>SIXLETTERS</div>"; // put messages icon on this bar
    sPage += "</div>";

    sPage += "<div id='scoreboard' class='scoreboard'>1/10</div>";

    sPage += "<div id='gameContainer' class='gameContainer'>";
    sPage += "<div class='guessContainer'>";

    for (let i=1; i<=6; i++) {
        sPage += "<div id='1guessSlot"+i+"' class='guessLetterContainer'></div>";
    }

    sPage += "</div>";
    sPage += "</div>";

    sPage += "<div class='keyboardContainer'>";
    let aLetters = [
        'Q','W','E','R','T','Y','U','I','O','P',
        'A','S','D','F','G','H','J','K','L',
        'Z','X','C','V','B','N','M'
    ];
    for (let i=0; i<10; i++) {
        sPage += "<div id='"+aLetters[i]+"' class='key' onClick='type(\""+aLetters[i]+"\")'>"+aLetters[i]+"</div>";
    }
    sPage += "<div id='"+aLetters[10]+"' class='key letterA' onClick='type(\""+aLetters[10]+"\")'>"+aLetters[10]+"</div>";
    for (let i=11; i<19; i++) {
        sPage += "<div id='"+aLetters[i]+"' class='key' onClick='type(\""+aLetters[i]+"\")'>"+aLetters[i]+"</div>";
    }
    sPage += "<div class='key specialKey' style='background-color: #fd5c63;' onClick='deleteKey()'>DEL</div>";
    for (let i=19; i<aLetters.length; i++) {
        sPage += "<div id='"+aLetters[i]+"' class='key' onClick='type(\""+aLetters[i]+"\")'>"+aLetters[i]+"</div>";
    }
    sPage += "<div class='key specialKey' style='background-color: #72a0c1;' onClick='guess()'>ENT</div>";
    sPage += "</div>";
    sPage += "<div id='Toast' class='Toast'></div>";
    document.getElementById('Main').innerHTML = sPage;
    document.getElementById('Body').addEventListener("keyup", function (event) {
        if ('Backspace' == event.key)
            deleteKey();
        else if ('Enter' == event.key)
            guess();
        else if ('Escape' == event.key)
            return;
        else
            type(event.key.toUpperCase());
    });
}

function type(sLetter) {
    g_bNotFinished = true;
    if (6 == g_sGuess.length)
        return;
    g_sGuess += sLetter;
    document.getElementById(nGuess + 'guessSlot' + g_sGuess.length).innerHTML = sLetter;
}

function deleteKey() {
    if (0 == g_sGuess.length)
        return;
    document.getElementById(nGuess + 'guessSlot' + g_sGuess.length).innerHTML = "";
    g_sGuess = g_sGuess.substring(0, g_sGuess.length - 1);
}

function guess() {
    if (6 != g_sGuess.length || !CheckIfEntryIsAWord(g_sGuess)) {
        Toast("Invalid Word");
        return;
    }

    let nPrevGuess = nGuess;
    nGuess++;

    if (10 < nGuess) {
        endGameFrame();
        LogTries(nPrevGuess);
        return;
    }

    if (!LoadTriesCookie.Loading)
        saveTriesCookie(g_sGuess, nPrevGuess);

    let sDiv = "";
    if (g_sTodaysWord == g_sGuess) { // you got it
        for (let i=1; i<=6; i++) {
            document.getElementById(g_sGuess.charAt(i-1)).style.backgroundColor = "#00a550";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#00a550";
        }
        endGameFrame();
        LogTries(nPrevGuess);
        return;
    }

    for (let i=1; i<=6; i++) {
        sDiv += "<div id='"+nGuess+"guessSlot"+i+"' class='guessLetterContainer'></div>";

        if (g_sGuess.charAt(i-1) == g_sTodaysWord.charAt(i-1)) {
            document.getElementById(g_sGuess.charAt(i-1)).style.backgroundColor = "#00a550";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#00a550";
        }
        else if (g_sTodaysWord.indexOf(g_sGuess.charAt(i-1)) != -1 && !alreadyLit(i)) {
            document.getElementById(g_sGuess.charAt(i-1)).style.backgroundColor = "#ffd800";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#ffd800";
        }
        else {
            document.getElementById(g_sGuess.charAt(i-1)).style.backgroundColor = "#383838";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#383838";
        }
    }

    let sContainer = "";
    sContainer += "<div class='guessContainer'>";
    sContainer += sDiv;
    sContainer += "</div>";
    document.getElementById('gameContainer').innerHTML += sContainer;
    document.getElementById('gameContainer').scroll(0, document.getElementById('gameContainer').scrollHeight);
    g_sGuess = "";

    document.getElementById('scoreboard').innerHTML = nGuess + "/10";
}

function alreadyLit(index) {
    if (1 == index) { // always would yellow the first let (might have to check for greens)
        return false;
    }
    let c = g_sGuess.charAt(index - 1);
    let nCount = 0;
    for (let i=0; i<6; i++) {
        if (c == g_sTodaysWord.charAt(i))
            nCount++;
    }
    let nCopy = nCount;
    for (let i=0; i<index-1; i++) {
        if (c == g_sGuess.charAt(i))
            nCopy--;
        if (0 == nCopy)
            return true;
    }
    nCopy = nCount;
    for (let i=index+1; i<6; i++) {
        if (c == g_sGuess.charAt(i))
            nCopy--;
        if (0 == nCopy)
            return true;
    }
    return false;
}

function endGameFrame() {
    document.getElementById('instructions').innerHTML = "";
    let sPage = "";
    sPage += "<div class='endgameFrame'>";
    sPage += "<div class='xOutEndgame' onClick='seeGame()'>✖</div>";
    sPage += "<div class='wordOfTheDayContainer'>";
    for (let i=0; i<6; i++) {
        sPage += "<div class='wordOfTheDay bouncy' style='animation-delay:"+(i/20)+"s'>"+g_sTodaysWord.charAt(i)+"</div>";
    }
    sPage += "</div>";
    sPage += "<div class='tooltip'>";
    sPage += "<button class='share' onClick='copyStats()'>";
    sPage += "<span class='tooltiptext' id='tooltip'>Copy</span>";
    sPage += "Share</button>";
    sPage += "</div>";

    //sPage += "<br><br>"; // adding some air

    sPage += "<div class='histogramFrame'>";
    sPage += "<div id='statDisplay' style='margin-left: auto; margin-right: auto; font-size: 17px;'></div>";
    for (let i=1; i<=10; i++) {
        sPage += "<div id='guessLabel"+i+"' class='histogramLabels'>"+i+"</div>";
    }
    sPage += "<div id='didntGuessRightLabel' class='histogramLabels'>✖</div>";
    for (let i=0; i<10; i++) {
        sPage += "<div id='guessNumber"+i+"' class='graphElement'></div>"; // 0 based
    }
    sPage += "<div id='didntGuessRight' class='graphElement'></div>";
    sPage += "</div>";

    sPage += "<div class='nextGame'>New Games 9AM & 9PM PST</div>"; // time til next word
    sPage += "</div>";
    document.getElementById('Main').style.opacity = 0.1;
    document.getElementById('Body').innerHTML += sPage;
    document.getElementById('gameContainer').scroll(0, document.getElementById('gameContainer').scrollHeight);

    GetHistogramData();
    setTimeout(GetHistogramData, 3000);
}

function GetHistogramData() {
    postFileFromServer("Tries.txt", "", GetHistogramDataCallback);
}

function seeGame() {
    document.getElementById('Main').style.opacity = 1.0;
    let sBackToShare = "";
    sBackToShare += "<button class='backToShare' onClick='endGameFrame()'>Share</button>";
    let sHTML = document.getElementById('Main').innerHTML;
    document.getElementById('Body').innerHTML = "<div id='Main'></div>";
    document.getElementById('Main').innerHTML = sHTML + sBackToShare;
    document.getElementById('gameContainer').scroll(0, document.getElementById('gameContainer').scrollHeight);
}

function copyStats() {
    let sClipboard = "";
    let sDate = new Date();
    sClipboard += "Six Letters\n";
    sClipboard += sDate.toString().substring(4, 15) + " (#" + g_nGameNumber + ")" + "\n";
    for (let i=1; i<nGuess; i++) {
        for (let j=1; j<=6; j++) {
            let bgColor = document.getElementById(i+'guessSlot'+j).style.backgroundColor;
            if ("rgb(0, 165, 80)" === bgColor) sClipboard += "🟩";
            else if ("rgb(255, 216, 0)" === bgColor) sClipboard += "🟨";
            else if ("rgb(56, 56, 56)" === bgColor) sClipboard += "⬛";
        }
        sClipboard += "\n";
    }
    sClipboard += "https://6lets.com/";

    let copyText = document.createElement("textarea");
    copyText.innerHTML = sClipboard;
    document.body.appendChild(copyText);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(copyText);
    document.getElementById('tooltip').innerHTML = "Text Copied To Clipboard";
}

function Toast(sMess) {
    if (document.getElementById('Toast')) {
        document.getElementById('Toast').innerHTML = "<div class='ToastMsg'>"+sMess+"</div>";
        setTimeout(function(){ document.getElementById('Toast').innerHTML = ''; }, 5000);
    }
}

function GetWordList() {
    postFileFromServer("WordList.txt", "", WordListCallback);
    function WordListCallback(data) {
        g_aWordList = data.split('\n');
        LoadTriesCookie();
    }
}

function CheckIfEntryIsAWord(sEntry) {
    for (let x=0; x<g_aWordList.length; x++) {
        if (sEntry == g_aWordList[x])
            return true;
    }
    return false;
}

function saveTriesCookie(sTry, nTry = 0) {
    g_aCookieString[0] = g_sTodaysWord;
    g_aCookieString[nTry] = sTry;
    let jsonCookieString = JSON.stringify(g_aCookieString);
    setCookie("Tries", jsonCookieString, 1);
}

function LoadTriesCookie() {
    let jsonTries = getCookie("Tries");
    if (!jsonTries)
        return false; // No cookie found
    MainFrame();
    let objTries = JSON.parse(jsonTries);
    if (objTries[0] != g_sTodaysWord)
        return false; // Cookie is for old word
    else {
        for (let x = 1; x < objTries.length; x++) {
            g_aCookieString[x] = objTries[x];
            nGuess = x;
            g_sGuess = objTries[x];
            for (let y = 0; y < objTries[x].length; y++)
                document.getElementById(nGuess + 'guessSlot' + (y+1)).innerHTML = objTries[x][y];

            LoadTriesCookie.Loading = true;
            guess();
            LoadTriesCookie.Loading = false;
        }
    }
    return true;
}

function LogTries(nTries=0) {
    if (!g_bNotFinished)
        return;
    postFileFromServer("Tries.php", "Tries=" + nTries, TriesCallback);
    function TriesCallback(data) {

    }
}

function GetHistogramDataCallback(data) {
    if (!document.getElementById('statDisplay'))
        return;
    let aData = data.split(',');
    g_nGameNumber = Number(aData[0]);
    let nTotal = 0; // users for this game
    let nMajority = 1;
    for (let i=1; i<aData.length-1; i++) {
        nTotal += Number(aData[i]);
        if (Number(aData[nMajority]) < Number(aData[i]))
            nMajority = i;
    }
    document.getElementById('statDisplay').innerHTML = nTotal.toString() + " plays on this puzzle";
    aPercentages = [];
    for (let i=1; i<12; i++) {
        aPercentages.push(Number(aData[i]) / nTotal);
    }
    for (let i=0; i<=9; i++) {
        let nPercentage = aPercentages[i] * 100;
        let nIndex = nPercentage.toString().indexOf('.') != -1 ? nPercentage.toString().indexOf('.') : 3;
        let pPercent = nPercentage.toString().substring(0,nIndex);
        document.getElementById('guessNumber' + i).style.height = 200 * aPercentages[i] > 5 ? (200 * aPercentages[i]) + 'px' : '5px';
        document.getElementById('guessNumber' + i).addEventListener("click", function() {
            document.getElementById('statDisplay').innerHTML = pPercent + "% of people got this word in " + (i+1) + " tries";
        });
        document.getElementById('guessLabel' + (i+1)).addEventListener("click", function() {
            document.getElementById('statDisplay').innerHTML = pPercent + "% of people got this word in " + (i+1) + " tries";
        });
    }
    let nDidntSolve = aPercentages[9] * 100;
    document.getElementById('didntGuessRight').style.height = 200 * aPercentages[9] > 5 ? (200 * aPercentages[10]) + 'px' : '5px';
    let didntSolveIndex = nDidntSolve.toString().indexOf('.') != -1 ? nDidntSolve.toString().indexOf('.') : 3;
    let pDidntSolve = nDidntSolve.toString().substring(0, didntSolveIndex);
    document.getElementById('didntGuessRight').addEventListener("click", function() {
        document.getElementById('statDisplay').innerHTML = pDidntSolve + "% of people could not get this word";
    });
    document.getElementById('didntGuessRightLabel').addEventListener("click", function() {
        document.getElementById('statDisplay').innerHTML = pDidntSolve + "% of people could not get this word";
    });
    if (nTotal)
        document.getElementById('guessNumber' + (nMajority-1)).click();
}

function setCookie(c_name, value, exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays===null) ? '' : '; expires='+exdate.toUTCString());
  document.cookie=c_name + '=' + c_value;
}

function getCookie(c_name) {
  var i,x,y,ARRcookies = document.cookie.split(';');
  for (i=0;i<ARRcookies.length;i++) {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf('='));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf('=')+1);
    x=x.replace(/^\s+|\s+$/g,'');
    if (x===c_name)
      return unescape(y);
  }
}

function postFileFromServer(url, sData, doneCallback) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(sData);
    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}
