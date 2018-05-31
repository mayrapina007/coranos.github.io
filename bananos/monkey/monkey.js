const expectedValueImageSize = 600;
const choiceValueImageSize = 150;

const maxTime = 2000;
var time = maxTime;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getUrlParameter (sParam) {
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
  newGame();
  return false;
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

function makeMonkeySvg (gameSelector, images, svgSize, choiceIx) {
  let svgParent = d3.select(gameSelector);
  if (choiceIx !== undefined) {
    const label = d3.select(gameSelector).append('label').attr('class', 'choiceLabel')
    label.append('input').attr('class', 'image').attr('type', 'submit').attr('name', 'choice').attr('value', choiceIx);

    svgParent = label;
  }

  const svg = svgParent.append('svg').attr('width', svgSize).attr('height', svgSize);

  if (choiceIx === undefined) {
    svg.attr('class', 'expected');
  } else {
    svg.attr('class', 'choice');
  }

  svg.append('rect').attr('x', 1).attr('y', 1).attr('height', svgSize - 1).attr('width', svgSize - 1).style('stroke', 'black').style('fill', 'none').style(
      'stroke-width', 1);

  svg.append('image').attr('xlink:href', images.prefix + images.left).attr('x', 0).attr('y', 0).attr('height', svgSize / 2).attr('width', svgSize / 2);

  svg.append('image').attr('xlink:href', images.prefix + images.right).attr('x', svgSize / 2).attr('y', svgSize / 2).attr('height', svgSize / 2).attr('width',
      svgSize / 2);

  svg.append('rect').attr('x', 1).attr('y', 1).attr('height', svgSize - 1).attr('width', svgSize - 1).attr('pointer-events', 'visible').style('stroke', 'red')
      .style('fill', 'none').style('stroke-width', 1);

}

let newGame;

function makeGame (options) {
  newGame = function() {
    makeGame (options);
  };
  
  d3.select('.choiceLabel').style('display','none');
  
  d3.select(options.gameSelector).html('');

  const numberOfGames = options.numberOfGames;
  d3.select(options.gameSelector).style('width', expectedValueImageSize);

  $.ajaxSetup({
    beforeSend : function (xhr) {
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('application/json');
      }
    }
  });

  $.getJSON('game.json', function (gameJson) {
    if(gameJson.slowDownFlag === false) {
      d3.select('#slowDownFlag').style('display','none');
    }
    
    gameJson.expected.prefix = gameJson.prefix;
    makeMonkeySvg(options.gameSelector, gameJson.expected, expectedValueImageSize, undefined);

    shuffle(gameJson.choices);
    for (let choiceIx = 0; choiceIx < gameJson.choices.length; choiceIx++) {
      gameJson.choices[choiceIx].prefix = gameJson.prefix;
      makeMonkeySvg(options.gameSelector, gameJson.choices[choiceIx], choiceValueImageSize, choiceIx);
    }

    time = maxTime
    setInterval(updateTime, 100);
    updateTime();
  });
}

function synchAccountDisplay () {
  var account = getUrlParameter('account');
  d3.select('#account-text').html(account);  
  if(account === undefined) {
    d3.select('#hasAccountFlagYes').style('display','none');
  } else {
    d3.select('#hasAccountFlagNo').style('display','none');
  }
  
}