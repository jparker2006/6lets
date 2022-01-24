var sGuess = "";
var nGuess = 1;
var g_aWordList = null;
var g_sTodaysWord = null;

onload = () => {
    MainFrame();
    GetTodaysWord();
    GetWordList();
}

function GetTodaysWord() {
    postFileFromServer("TodaysWord.php", "", TodaysWordCallback);
    function TodaysWordCallback(data) {
        g_sTodaysWord = data;
    }
}

function MainFrame() {
    let sPage = "";
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
    sPage += "<div class='key specialKey' onClick='deleteKey()'>DEL</div>";
    for (let i=19; i<aLetters.length; i++) {
        sPage += "<div id='"+aLetters[i]+"' class='key' onClick='type(\""+aLetters[i]+"\")'>"+aLetters[i]+"</div>";
    }
    sPage += "<div class='key specialKey' onClick='guess()'>ENT</div>";
    sPage += "</div>";
    sPage += "<div id='Toast' class='Toast'></div>";
    document.getElementById('Main').innerHTML = sPage;
}

function type(sLetter) {
    if (6 == sGuess.length)
        return;
    sGuess += sLetter;
    document.getElementById(nGuess + 'guessSlot' + sGuess.length).innerHTML = sLetter;
}

function deleteKey() {
    if (0 == sGuess.length)
        return;
    document.getElementById(nGuess + 'guessSlot' + sGuess.length).innerHTML = "";
    sGuess = sGuess.substring(0, sGuess.length - 1);
}

function guess() {
    if (6 != sGuess.length || !CheckIfEntryIsAWord(sGuess)) {
        Toast("Invalid Word");
        return;
    }

    let nPrevGuess = nGuess;
    nGuess++;

    if (10 < nGuess) {
        endGameFrame();
        return;
    }

    let sDiv = "";
    if (g_sTodaysWord == sGuess) { // you got it
        for (let i=1; i<=6; i++) {
            document.getElementById(sGuess.charAt(i-1)).style.backgroundColor = "#00a550";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#00a550";
        }
        endGameFrame();
        return;
    }

    for (let i=1; i<=6; i++) {
        sDiv += "<div id='"+nGuess+"guessSlot"+i+"' class='guessLetterContainer'></div>";

        if (sGuess.charAt(i-1) == g_sTodaysWord.charAt(i-1)) {
            document.getElementById(sGuess.charAt(i-1)).style.backgroundColor = "#00a550";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#00a550";
        }
        else if (g_sTodaysWord.indexOf(sGuess.charAt(i-1)) != -1) {
            document.getElementById(sGuess.charAt(i-1)).style.backgroundColor = "#ffd800";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#ffd800";
        }
        else {
            document.getElementById(sGuess.charAt(i-1)).style.backgroundColor = "#383838";
            document.getElementById(nPrevGuess + 'guessSlot' + i).style.backgroundColor = "#383838";
        }
    }

    let sContainer = "";
    sContainer += "<div class='guessContainer'>";
    sContainer += sDiv;
    sContainer += "</div>";
    document.getElementById('gameContainer').innerHTML += sContainer;
    document.getElementById('gameContainer').scroll(0, document.getElementById('gameContainer').scrollHeight);
    sGuess = "";

    document.getElementById('scoreboard').innerHTML = nGuess + "/10";
}

function endGameFrame() {
    let sPage = "";
    sPage += "<div class='endgameFrame'>";
    sPage += "<div class='xOutEndgame' onClick='seeGame()'>✖</div>";
    sPage += "<div class='wordOfTheDay'>"+g_sTodaysWord+"</div>";

    sPage += "<div class='tooltip'>";
    sPage += "<button class='share' onClick='copyStats()'>";
    sPage += "<span class='tooltiptext' id='tooltip'>Copy</span>";
    sPage += "Share</button>";
    sPage += "</div>";


    sPage += "<div class='nextGame'>Next Game:<br>10:30:41</div>"; // time til next word

    sPage += "</div>";
    document.getElementById('Main').style.opacity = 0.1;
    document.getElementById('Body').innerHTML += sPage;
}

function seeGame() {
    document.getElementById('Main').style.opacity = 1.0;
    let sBackToShare = "";
    sBackToShare += "<button class='backToShare' onClick='endGameFrame()'>Share</button>";
    let sHTML = document.getElementById('Main').innerHTML;
    document.getElementById('Body').innerHTML = "<div id='Main'></div>";
    document.getElementById('Main').innerHTML = sHTML + sBackToShare;
}

function copyStats() {
    let sClipboard = "";
    let sDate = new Date();
    sClipboard += "Son Of Wordle\n";
    sClipboard += sDate.toString().substring(4, 15) + "\n";
    for (let i=1; i<nGuess; i++) {
        for (let j=1; j<=6; j++) {
            let bgColor = document.getElementById(i+'guessSlot'+j).style.backgroundColor;
            if ("rgb(0, 165, 80)" === bgColor) sClipboard += "🟩";
            else if ("rgb(255, 216, 0)" === bgColor) sClipboard += "🟨";
            else if ("rgb(56, 56, 56)" === bgColor) sClipboard += "⬛";
        }
        sClipboard += "\n";
    }
    sClipboard += "http://jakehenryparker.com:56112/SonOfWordle/";

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
    }
}

function CheckIfEntryIsAWord(sEntry) {
    for (let x=0; x<g_aWordList.length; x++) {
        if (sEntry == g_aWordList[x])
            return true;
    }
    return false;
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
