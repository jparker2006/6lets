// To do
// 1.  Duplicate copy code needs to be made not duplicate.
// 2.  Endscreen calls server three times.

var g_sGuess = "";
var nGuess = 1;
var g_a6Dictionary = null;
var g_sTodaysWord = null;
var g_aCookieString = [];
var g_bNotFinished = false;
var g_nGameNumber;
var g_nInstructionsVisited = 0;
var g_6LetTries = null;
LoadTriesCookie.Loading = false;

onload = () => {
    InstructionsFrame();
    GetTodaysWord();
}

function InstructionsFrame() {
    document.getElementById('Main').innerHTML = "";
    g_nInstructionsVisited++;

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
    sPage += "<br><br>Guess the word in up to ten tries.  Each guess must be an actual six-letter word.<br><br>After each guess, the squares will change colors.<div style='text-align: left;'><ul><li><span style='color: lightgreen; background: black;'><b>Green</b></span> is a letter in the word in the right place.  </li><li><span style='color: yellow; background: black;'><b>Yellow</b></span> is a letter in the word, but in the wrong place.  </li><li><span style='color: lightgray; background: black;'><b>Gray</b></span> is a letter that is not in the word.</li></ul></div></div>";
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
    sPage += "<div>SIXLETTERS</div>";
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
    sPage += "<div id='A' class='key letterA' onClick='type(\""+aLetters[10]+"\")'>A</div>";
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

    for (let x=1; x<g_aCookieString.length; x++) {
        nGuess = x;
        g_sGuess = g_aCookieString[x];
        for (let y=0; y<g_aCookieString[x].length; y++)
            document.getElementById(nGuess + 'guessSlot' + (y+1)).innerHTML = g_aCookieString[x][y];
        guess();
    }

    g_sGuess = "";

    if (g_nInstructionsVisited < 2) {
        document.getElementById('Body').addEventListener("keyup", function (event) {
            if ('Backspace' == event.key)
                deleteKey();
            else if ('Enter' == event.key)
                guess();
            else {
                let nKey = event.keyCode;
                if (nKey >= 65 && nKey <= 90)
                    type(event.key.toUpperCase());
            }
        });
    }
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
        Log6LetTries(11);
        return;
    }

    if (!LoadTriesCookie.Loading)
        saveTriesCookie(g_sGuess, nPrevGuess);

    colorTiles(nPrevGuess, g_sGuess);
}

var colorTiles = (nGuess, sTry) => {
    let aColors = [];
    let sTry_Copy = sTry.slice();
    let sTodaysWord = g_sTodaysWord.slice();
    if (sTodaysWord == sTry_Copy) { // you got it
        for (let i=1; i<=6; i++) {
            document.getElementById(sTry_Copy.charAt(i-1)).style.backgroundColor = "#00a550";
            document.getElementById(nGuess + 'guessSlot' + i).style.backgroundColor = "#00a550";
        }
        Log6LetTries(nGuess);
        endGameFrame();
        return;
    }

    // Color the greens (#00a550) first...
    for (let g=0; g<sTry_Copy.length; g++) {
        if (sTry_Copy[g] == g_sTodaysWord[g]) {
            document.getElementById(sTry_Copy.charAt(g)).style.backgroundColor = "#00a550"; // keys
            document.getElementById(nGuess + 'guessSlot' + (g+1)).style.backgroundColor = "#00a550";
            // color the tile
            sTry_Copy = sTry_Copy.substr(0, g) + " " + sTry_Copy.substr(g+1); // remove the letter
            sTodaysWord = sTodaysWord.substr(0, g) + " " + sTodaysWord.substr(g+1); // remove the letter
            aColors[g] = 'g';
        }
    }

    // Then color the yellows (#ffd800)...
    for (let y=0; y<sTry_Copy.length; y++) {
        if (" " == sTry_Copy[y])
            continue;
        else {
            let nPos = sTodaysWord.search(sTry_Copy[y])
            if (-1 == nPos) {
                document.getElementById(sTry_Copy.charAt(y)).style.backgroundColor = "#383838";
                document.getElementById(nGuess + 'guessSlot' + (y+1)).style.backgroundColor = "#383838";
                aColors[y] = 'w';
            }
            else {
                document.getElementById(sTry_Copy.charAt(y)).style.backgroundColor = "#ffd800"; // keys
                document.getElementById(nGuess + 'guessSlot' + (y+1)).style.backgroundColor = "#ffd800";
                sTodaysWord = sTodaysWord.substr(0, nPos) + " " + sTodaysWord.substr(nPos+1); // remove the letter
                aColors[y] = 'y';
            }
        }
    }

    // Color the keyboard, first yellow, then green...
    for (let k = 0; k < 6; k++) {
        if ('y' == aColors[k])
            document.getElementById(sTry.charAt(k)).style.backgroundColor = "#ffd800"; // keys
        else if ('g' == aColors[k])
            document.getElementById(sTry.charAt(k)).style.backgroundColor = "#00a550"; // keys
    }

    // Make the next row
    let sDiv = "";
    for (let r = 1; r < 7; r++) {
        sDiv += "<div id='"+(nGuess+1)+"guessSlot"+r+"' class='guessLetterContainer'></div>";
    }

    let sContainer = "";
    sContainer += "<div class='guessContainer'>";
    sContainer += sDiv;
    sContainer += "</div>";
    document.getElementById('gameContainer').innerHTML += sContainer;
    document.getElementById('gameContainer').scroll(0, document.getElementById('gameContainer').scrollHeight);
    g_sGuess = "";

    document.getElementById('scoreboard').innerHTML = nGuess+1 + "/10";
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
    if (navigator.share)
        sPage += "<button class='share' onClick='copyStats()'>";
    else
        sPage += "<button class='share' style='width: 284px;' onClick='copyStats()'>";
    sPage += "<span class='tooltiptext' id='tooltip'>Copy</span>";
    sPage += "Copy</button>";
    sPage += "</div>";

    if (navigator.share)
        sPage += "<button class='share' onClick='shareToApps()'>Share</button>";

    sPage += "<div class='histogramFrame'>";
    sPage += "<div id='statDisplay' style='margin-left: auto; margin-right: auto; font-size: 17px;'></div>";
    for (let i=1; i<11; i++) {
        sPage += "<div id='guessLabel"+i+"' class='histogramLabels'>"+i+"</div>";
    }
    sPage += "<div id='didntGuessRightLabel' class='histogramLabels'>✖</div>";
    for (let i=0; i<10; i++) {
        sPage += "<div id='guessNumber"+i+"' class='graphElement'></div>"; // 0 based
    }
    sPage += "<div id='didntGuessRight' class='graphElement'></div>";
    sPage += "</div>";

    sPage += "<div class='nextGame' onClick='GetHistogramData()'>New Games 12AM & 12PM PST</div>"; // time til next word
    sPage += "</div>";
    document.getElementById('Main').style.opacity = 0.1;
    document.getElementById('Body').innerHTML += sPage;
    document.getElementById('gameContainer').scroll(0, document.getElementById('gameContainer').scrollHeight);

    if (g_6LetTries)
        GetHistogramDataCallback(g_6LetTries);
    else
        GetHistogramData();

    setTimeout(GetHistogramData, 2000);
}

function GetHistogramData() {
    postFileFromServer("6LetTries.txt", "", GetHistogramDataCallback);
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

function makeShareableEmojiBlock() {
    let sBlock = "";
    let sDate = new Date();
    sBlock += "Six Letters\n";
    sBlock += sDate.toString().substring(4, 15) + " (#" + g_nGameNumber + ")" + "\n";
    for (let i=1; i<nGuess; i++) {
        for (let j=1; j<=6; j++) {
            let bgColor = document.getElementById(i+'guessSlot'+j).style.backgroundColor;
            if ("rgb(0, 165, 80)" === bgColor) sBlock += "🟩";
            else if ("rgb(255, 216, 0)" === bgColor) sBlock += "🟨";
            else if ("rgb(56, 56, 56)" === bgColor) sBlock += "⬛";
        }
        sBlock += "\n";
    }
    sBlock += "https://6lets.com/";
    return sBlock;
}

function shareToApps() {
    let sClipboard = makeShareableEmojiBlock();

    if (navigator.share) {
        navigator.share({
            title: document.title + "\n",
            text: sClipboard,
            url: window.location.href
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }
    else {
        let copyText = document.createElement("textarea");
        copyText.innerHTML = sClipboard;
        document.body.appendChild(copyText);
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(copyText);
        document.getElementById('tooltip').innerHTML = "Text Copied To Clipboard";
    }
}

function copyStats() {
    let sClipboard = makeShareableEmojiBlock();
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
    postFileFromServer("6LetWordList.txt", "", WordListCallback);
    function WordListCallback(data) {
        g_a6Dictionary = data.split('\n');
        LoadTriesCookie();
    }
}

function CheckIfEntryIsAWord(sEntry) {
    for (let x=0; x<g_a6Dictionary.length; x++) {
        if (sEntry == g_a6Dictionary[x])
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

    let objTries = JSON.parse(jsonTries);
    if (objTries[0] != g_sTodaysWord)
        return false; // Cookie is for old word
    else {
        MainFrame();
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

function Log6LetTries(nTries=0) {
    if (!g_bNotFinished)
        return;
    postFileFromServer("6LetTries.php", "Tries=" + nTries, TriesCallback);
    function TriesCallback(data) {
        g_6LetTries = data.trim();
        //endGameFrame();
    }
}

function GetHistogramDataCallback(data) {
    g_6LetTries = data.trim();
    if (!document.getElementById('statDisplay'))
        return;
    let aData = data.split(',');
    g_nGameNumber = Number(aData[0]);
    let nTotal = 0; // users for this game
    let nMajority = 1;
    for (let i=1; i<12; i++) {
        nTotal += Number(aData[i]);
        if (Number(aData[nMajority]) < Number(aData[i]))
            nMajority = i;
    }
    let aPercentages = [];
    for (let i=1; i<12; i++) {
        aPercentages.push((Number(aData[i]) / nTotal).toFixed(2));
    }

    let nMultiple = 100;
    if (0 != aPercentages[nMajority-1]) {
        nMultiple = 100 / aPercentages[nMajority-1];
        nMultiple = Math.round(nMultiple);
    }

    for (let i=0; i<10; i++) {

        // this is for text?
        let nPercentage = aPercentages[i] * 100;
        let nIndex = nPercentage.toString().indexOf('.') != -1 ? nPercentage.toString().indexOf('.') : 3;
        let pPercent = nPercentage.toString().substring(0,nIndex);

        document.getElementById('guessNumber' + i).style.height = nMultiple * aPercentages[i] > 5 ? (nMultiple * aPercentages[i]) + 'px' : '2px';

        document.getElementById('guessNumber' + i).addEventListener("click", function() {
            document.getElementById('statDisplay').innerHTML = pPercent + "% of people got this word in " + (i+1) + " tries";
        });
        document.getElementById('guessLabel' + (i+1)).addEventListener("click", function() {
            document.getElementById('statDisplay').innerHTML = pPercent + "% of people got this word in " + (i+1) + " tries";
        });
    }
    let nDidntSolve = aPercentages[10] * 100;
    document.getElementById('didntGuessRight').style.height = nMultiple * aPercentages[10] > 5 ? (nMultiple * aPercentages[10]) + 'px' : '2px';
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

function GetTodaysWord() {
    postFileFromServer("Todays6LetWord.txt", "", TodaysWordCallback);
    function TodaysWordCallback(data) {
        g_sTodaysWord = data.trim();
        GetWordList();
    }
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
