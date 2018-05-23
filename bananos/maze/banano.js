const width = 200;

const height = 200;

const scale = 2;

const max_interpolate_step = 5;

let goodScore = 0;
let badScore = 0;
let goodIx = undefined;

function updateScore(ix, options) {
  if(goodIx == undefined) {
    return;
  }
  if(ix == goodIx) {
    goodScore++;
  } else {
    badScore++;
  }
  d3.select(options.goodScoreSelector).html(goodScore);
  d3.select(options.badScoreSelector).html(badScore);
  makeGame(options);
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * 
 * Returns a random integer between 0 and max, including 0 and excluding max.
 */
function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function makeGameSvg(gameIx, options, bananoJson, rotation, breakHamiltonianCycle) {
  const rootSelector = options.gameSelector;
  
  const svg = d3.select(rootSelector)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

    svg.append('rect')
    .attr('x', 1)
    .attr('y', 1)
    .attr('height', height-1)
    .attr('width', width-1)
    .style('stroke', 'black')
    .style('fill', 'none')
    .style('stroke-width', '1');
  
  const lineFunction = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
  
  const breakIx = 1+ getRandomInt(bananoJson.length-1);
  
  for(let bananoJsonIx = 1; bananoJsonIx < bananoJson.length; bananoJsonIx++) {
    const bananoJsonIx0 = bananoJsonIx-1;
    const bananoJsonIx1 = bananoJsonIx+1;
    const bananoSlice = bananoJson.slice(bananoJsonIx0,bananoJsonIx1);
    const bx0 = bananoSlice[0].x;
    const by0 = bananoSlice[0].y;
    const bx1 = bananoSlice[1].x;
    const by1 = bananoSlice[1].y;
    
    const dx = (bx1-bx0);
    const dy = (by1-by0);
    
    const x0 = bx0 * scale;
    const y0 = by0 * scale;
    

    const x1 = bx1 * scale;
    const y1 = by1 * scale;
    
    let dx1 = x0;
    let dy1 = y0;
    
    function check() {
      return ((dx1*dx < x1*dx) || dx == 0) && ((dy1*dy < y1*dy) || dy == 0);
    }
    
    while(check()){
      const slice = [];
      slice.push({'x':dx1,'y':dy1});
      
      const interpolate_step = max_interpolate_step-1+ getRandomInt(1);
      
      if(dx < 0) {
        dx1 -= interpolate_step;
      }
      if(dx > 0) {
        dx1 += interpolate_step;
      }
      if(dy < 0) {
        dy1 -= interpolate_step;
      }
      if(dy > 0) {
        dy1 += interpolate_step;
      }

      let append = true;
      if((!check()) && breakHamiltonianCycle) {
        if(bananoJsonIx == breakIx) {
          append = false;          
        }
      }
      
      if(append) {
        slice.push({'x':dx1,'y':dy1});
      } else {
        let dx2 = dx1;
        let dy2 = dy1;
        if(dx < 0) {
          dx2 += (interpolate_step/2);
        }
        if(dx > 0) {
          dx2 -= (interpolate_step/2);
        }
        if(dy < 0) {
          dy2 += (interpolate_step/2);
        }
        if(dy > 0) {
          dy2 -= (interpolate_step/2);
        }
        slice.push({'x':dx2,'y':dy2});
      }
      
        
      svg.append('path')
      .attr('d', lineFunction(slice))
      .attr('stroke', "brown")
      .attr('stroke-width', 2);
    }
  }
  
  // add clickable


  svg.append('rect')
  .attr('x', 1)
  .attr('y', 1)
  .attr('height', height-1)
  .attr('width', width-1)
  .attr('pointer-events', "visible")
  .style('stroke', 'red')
  .style('fill', 'none')
  .style('stroke-width', '1')
  .on("click", function(){
    updateScore(gameIx, options);
    d3.event.stopPropagation();
  });
}

function makeGame(options) {
  d3.select(options.gameSelector).html('');
  
  const numberOfGames = options.numberOfGames;
  $.ajaxSetup({
    beforeSend : function (xhr) {
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('application/json');
      }
    }
  });

  $.getJSON('banano.json', function (bananoJson) {
    const realIx = getRandomInt(numberOfGames);
    goodIx = realIx;

    for (let gameIx = 0; gameIx < numberOfGames; gameIx++) {
      const breakHamiltonianCycle = !(gameIx == realIx);
      const rotation = (2.0 * Math.PI) / ((gameIx * 1.0) / numberOfGames);
      makeGameSvg(gameIx, options, bananoJson, rotation, breakHamiltonianCycle);
    }
  });
}