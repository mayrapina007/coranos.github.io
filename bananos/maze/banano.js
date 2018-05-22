const width = 200;

const height = 200;

const scale = 2;

const interpolate_step = 5;

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * 
 * Returns a random integer between 0 and max, including 0 and excluding max.
 */
function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function makeGameSvg(rootSelector, bananoJson, rotation, breakHamiltonianCycle) {
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
      
      slice.push({'x':dx1,'y':dy1});

      let append = true;
      if((!check()) && breakHamiltonianCycle) {
        if(bananoJsonIx == breakIx) {
          append = false;          
        }
      }
      
      if(append) {
        svg.append('path')
          .attr('d', lineFunction(slice))
          .attr('stroke', "brown")
          .attr('stroke-width', 2);
      }
    }
  }
}

function makeGame(rootSelector, numberOfGames) {
  $.ajaxSetup({
    beforeSend : function (xhr) {
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('application/json');
      }
    }
  });

  $.getJSON('banano.json', function (bananoJson) {
    const realIx = getRandomInt(numberOfGames);

    for (let gameIx = 0; gameIx < numberOfGames; gameIx++) {
      const breakHamiltonianCycle = !(gameIx == realIx);
      const rotation = (2.0 * Math.PI) / ((gameIx * 1.0) / numberOfGames);
      makeGameSvg(rootSelector, bananoJson, rotation, breakHamiltonianCycle);
    }
  });
}