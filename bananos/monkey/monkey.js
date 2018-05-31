const maxTime = 2000;
var time = maxTime;

var getUrlParameter = function getUrlParameter (sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)), sURLVariables = sPageURL.split('&'), sParameterName, i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

function submitForm () {
  var accountInput = document.getElementById('account');
  if (accountInput.value.length == 0) {
    accountInput.style['background-color'] = 'red';
    return false;
  }
  if (time > 0) {
    var timeDiv = document.getElementById('timer');
    timeDiv.style['background-color'] = 'red';
    return false;
  }
  return true;
}

function updateTime () {
  // console.log('updateTime', time);
  var timeDiv = document.getElementById('timer');
  if ((time % 1000) == 0) {
    timeDiv.innerHTML = Math.round(time / 1000);
  }
  time -= 100;

  var choices = document.getElementsByClassName('choiceLabel');
  var timeDiff = maxTime / choices.length;
  for (var ix = 0; ix < choices.length; ix++) {
    if (ix * timeDiff >= time) {
      choices[ix].style.display = 'inline-block';
    }
  }

  if (time < 0) {
    timeDiv.style['background-color'] = 'white';
    var expectations = document.getElementsByClassName('expected');
    for (var ix = 0; ix < expectations.length; ix++) {
      expectations[ix].style.display = 'block';
    }
    time = 0;
  }
}

function makeGame(options) {
  d3.select(options.gameSelector).html('');
  
  const numberOfGames = options.numberOfGames;
  d3.select(options.gameSelector).style('width',width*Math.sqrt(numberOfGames));

  $.ajaxSetup({
    beforeSend : function (xhr) {
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('application/json');
      }
    }
  });

  $.getJSON('game.json', function (gameJson) {
    makeMonkeySvg(gameJson.expected);
    
    for (let choiceIx = 0; choiceIx < gameJson.choices.length; choiceIx++) {
      makeMonkeySvg(gameJson.choices[choiceIx]);
    }
    
    const realIx = getRandomInt(numberOfGames);
    goodIx = realIx;

    for (let gameIx = 0; gameIx < numberOfGames; gameIx++) {
      const breakHamiltonianCycle = !(gameIx == realIx);
      const rotation = (2.0 * Math.PI) / ((gameIx * 1.0) / numberOfGames);
      makeGameSvg(gameIx, options, bananoJson, rotation, breakHamiltonianCycle);
    }
    setInterval(updateTime, 100);
    updateTime();
  });
}

function onLoad () {
  var account = getUrlParameter('account');
  document.getElementById('account').innerHTML = account;
}