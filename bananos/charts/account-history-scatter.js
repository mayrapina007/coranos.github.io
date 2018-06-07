// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function onLoad() {
  d3.json('account-history.json', function(response) {
    showScatter(response);
  });
}

// Get the data
function showScatter(response) {
  // format the data
  const data = [];
  
  response.results.forEach(function(d) {
    const dataElt = {};
    dataElt.account = d.account;
    dataElt.tx = Object.entries(d.history).length;
    dataElt.balance = +d.balance;
    if(dataElt.tx > 0) {
      if(dataElt.balance > 0) {
        data.push(dataElt);
      } else {
        console.log('balance', JSON.stringify(dataElt));
      }
    } else {
      console.log('tx', JSON.stringify(dataElt));
    }
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return (d.tx); }));
  y.domain([0, d3.max(data, function(d) { return (d.balance); })]);

  // Add the valueline path.
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);
      
  // Add the scatterplot
  svg.selectAll("dot")
      .data(data)
    .enter().append("circle")
      .attr("r", 5)
      .attr("cx", function(d) { return x((d.tx)); })
      .attr("cy", function(d) { return y((d.balance)); });

  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

}
