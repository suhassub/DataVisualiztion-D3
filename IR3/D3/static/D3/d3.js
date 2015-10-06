jQuery(document).ready(function() {

    /* On click event for the button  */
    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');
 
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
 
        e.preventDefault();
    });

     $("#submit").click(function(){
        
	/* Get query from text field */
  var query = document.getElementById("qbox").value;
  var finalquery=query.replace(/\s/g, '+')/*replace(" ","+")*/;
  finalquery="http://127.0.0.1:8000/d3/?query="+finalquery;

  /* alert(finalquery); */

	/* AJAX CALL */     
	$.ajax({url: finalquery, success: function(result){
      
	/* PIE CHART */
var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.population; });

var svg = d3.select("piechart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("/static/D3/pie.csv", function(error, data) {

  data.forEach(function(d) {
    d.population = +d.population;
  });

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.age); });

  g.append("text")
      .attr("transform", function(d) { var c = arc.centroid(d); return "translate(" + c[0]*2.0 +"," + c[1]*2.0 + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return d.data.age; });

});


/* BAR CHART */
var margin = {top: 10, right: 20, bottom: 10, left: 70},
    width = 960 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    /*.ticks(10, "%")*/;

var svgbar = d3.select("barchart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("/static/D3/bar.tsv", type, function(error, data) {
  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svgbar.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svgbar.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svgbar.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });

      

      
});

function type(d) {
  d.frequency = +d.frequency;
  return d;
}
    

  /* WORD CLOUD */
  
  var fill = d3.scale.category20();                                       
  d3.layout.cloud().size([1000, 1000])
      .words(result.word_cloud_data.map(function(d) {
        return {text: d, size: 10 + Math.random() * 90};
      }))
      .padding(5)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();

  function draw(words) {
    d3.select("wordcloud").append("svg")
        .attr("width", 800)
        .attr("height", 750)
      .append("g")
        .attr("transform", "translate(150,150)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }

  //
  /* WORD CLOUD ENDS HERE */
  //  
  
  //
  //
  //TIME SERIES starts here
  //
  //

parseDate = d3.time.format("%Y-%m-%d").parse;
parseTime = d3.time.format("%H:%M:%S").parse;
formatDate = d3.time.format("%d-%b"),
formatTime = d3.time.format("%H:%M"),
bisectDate = d3.bisector(function(d) { return d.date; }).left; 

// Load the raw data
d3.json("/static/D3/timeSeries.json", function(error, events) {

    // parse and format all the event data
    events.forEach(function(d) {
        d.dtg = d.dtg.slice(0,-4)+'0:00'; // get the 10 minute block
        dtgSplit = d.dtg.split(" ");      // split on the space
        d.date = dtgSplit[0];             // get the date seperatly
        d.time = dtgSplit[1];             // format the time
        d.number_downloaded = 1;          // Number of downloads
    });

    // get the scatterplot data and nest the data by date/time
    var data = d3.nest()
        .key(function(d) { return d.dtg;})
        .rollup(function(d) {
            return d3.sum(d,function(g) {return g.number_downloaded; });
            })
        .entries(events);

    // format the date/time data
    data.forEach(function(d) {
        d.dtg = d.key;                   // get the 10 minute block
        dtgSplit = d.dtg.split(" ");     // split on the space
        d.date = parseDate(dtgSplit[0]); // get the date seperatly
        d.time = parseTime(dtgSplit[1]); // format the time
        d.number_downloaded = d.values;  // Number of downloads
    });

    // nest the data by date for the daily graph
    var dataDate = d3.nest()
        .key(function(d) { return d.date;})
        .rollup(function(d) {
            return d3.sum(d,function(g) {return g.number_downloaded; });
            })
        .entries(events);

    // format the date data
    dataDate.forEach(function(d) {
        d.date = parseDate(d.key); // format the date
        d.close = d.values;        // Number of downloads
    });

    // nest the data by 10 minute intervals for the time graph
    var dataTime = d3.nest()
        .key(function(d) { return d.time;})
        .sortKeys(d3.ascending)
        .rollup(function(d) {
            return d3.sum(d,function(g) {return g.number_downloaded; });
            })
        .entries(events);

    // format the time data
    dataTime.forEach(function(d) {
        d.time = d.key;             // get the 10 minute block
        d.time = parseTime(d.time); // get the date seperatly
        d.close = d.values;         // Number of downloads
    });

    // Get number of days in date range to calculate scatterplotWidth
    var oneDay = 24*60*60*5500; // hours*minutes*seconds*milliseconds
    var dateStart = d3.min(data, function(d) { return d.date; });
    var dateFinish = d3.max(data, function(d) { return d.date; });
    var numberDays = Math.round(Math.abs((dateStart.getTime() -
                               dateFinish.getTime())/(oneDay)));

    var margin = {top: 20, right: 20, bottom: 20, left: 200},
        scatterplotHeight = 520,
        scatterplotWidth = numberDays * 1.5,
        dateGraphHeight = 220,
        timeGraphWidth = 220;

    // Set the dimensions of the canvas / graph
    var height = scatterplotHeight + dateGraphHeight,
        width = scatterplotWidth + timeGraphWidth;

    // ************* draw the scatterplot ****************

    var formatDay_Time = d3.time.format("%H:%M");     // tooltip time
    var formatWeek_Year = d3.time.format("%d-%m-%Y"); // tooltip date

    var x = d3.time.scale().range([0, scatterplotWidth]);
    var y = d3.time.scale().range([0, scatterplotHeight]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(7);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .ticks(12,0,0)
        .tickFormat(d3.time.format("%H:%M"));

    var svg = d3.select("timeseries")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + ","
                                            + margin.top + ")");

    // State the functions for the grid
    function make_x_axis() {
        return d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(12)
    }

    // State the functions for the grid
    function make_y_axis() {
        return d3.svg.axis()
          .scale(y)
          .orient("right")
          .ticks(8)
    }
            
    // Set the domains
    y.domain([new Date(1899, 12, 02, 0, 0, 0), 
              new Date(1899, 12, 01, 0, 0, 1)]);
    x.domain(d3.extent(data, function(d) { return d.date; }));
    
    // Draw the Axes and the tick labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + scatterplotHeight + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "middle");

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("  + scatterplotWidth +  ",0)")
        .call(yAxis)
      .selectAll("text");

    // draw the plotted circles
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return d.number_downloaded*8.5; })
        .style("opacity", 1)
        .style("fill", "#e31a1c" )
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.time); })
            ;    

    // *********** place the mouse movement information **************
    var focus = svg.append("g") 
        .style("display", "none");

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "#33a02c")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 1)
        .style("shape-rendering", "crispEdges");

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "#33a02c")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 1)
        .style("shape-rendering", "crispEdges");

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");
    
    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", scatterplotWidth)
        .attr("height", scatterplotHeight)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    // The conversion ratio to change x position of cursor to
    // the index of the date array
    var convertDate =  dataDate.length/scatterplotWidth;
    var convertTime =  dataTime.length/scatterplotHeight;

    // interactive mouse function
    function mousemove() {
        var xpos = d3.mouse(this)[0],
            x0 = x.invert(xpos),
            y0 = d3.mouse(this)[1],
            y1 = y.invert(y0),
            date1 = d3.mouse(this)[0];

        // Place the intersection date text
        focus.select("text.y1")
            .attr("transform",
                  "translate(" + (date1 - 50) + "," + (y0+20) + ")")
            .text(formatDate(x0));
        focus.select("text.y2")
            .attr("transform",
                  "translate(" + (date1 - 50) + "," + (y0+20) + ")")
            .text(formatDate(x0));

        // Place the intersection time text
        focus.select("text.y3")
            .attr("transform",
                  "translate(" + (date1) + "," + (y0-15) + ")")
            .text(formatTime(y1).substring(0,4)+'0');
        focus.select("text.y4")
            .attr("transform",
                  "translate(" + (date1) + "," + (y0-15) + ")")
            .text(formatTime(y1).substring(0,4)+'0');

        // Place the dynamic daily downloads text
        focus.select("text.y5")
            .attr("transform",
                  "translate("
                      + (date1) + ","
                      + (scatterplotHeight+dateGraphHeight) + ")")
            .attr("text-anchor", "middle")
            .text(dataDate[parseInt(xpos*convertDate)].close);
        focus.select("text.y6")
            .attr("transform",
                  "translate("
                      + (date1) + ","
                      + (scatterplotHeight+dateGraphHeight) + ")")
            .attr("text-anchor", "middle")
            .text(dataDate[parseInt(xpos*convertDate)].close);

        // Place the dynamic time downloads text
        focus.select("text.y7")
            .attr("transform",
                  "translate("
                      + (scatterplotWidth+timeGraphWidth) + ","
                      + (y0) + ")")
            .attr("text-anchor", "start")
            .text(dataTime[144-parseInt(y0*convertTime)].close);
        focus.select("text.y8")
            .attr("transform",
                  "translate("
                      + (scatterplotWidth+timeGraphWidth) + ","
                      + (y0) + ")")
            .attr("text-anchor", "start")
            .text(dataTime[144-parseInt(y0*convertTime)].close);


        focus.select(".x")
            .attr("transform",
                  "translate(" + date1 + "," + (0) + ")")
            .attr("y2", height );

        focus.select(".y")
            .attr("transform",
                  "translate(0," + y0 + ")")
            .attr("x2", width );
    }
});
/* Time Series End Data*/

/* World Map Starts */

  var bombMap = new Datamap({
      element: document.getElementById('map_bombs'),
      scope: 'world',
      geographyConfig: {
          popupOnHover: false,
          highlightOnHover: false
      },
      fills: {
        // Colors for countries
            "RUS": "#660066",
            defaultFill: "#2C88BA"
      },
      data: {
        //To add different colors to different countries using the colors above
          // 'RUS': {fillKey: 'RUS'} 
      }
  });

       var bombs = result.map_data;/*[{
          ID: 'RDS-37',
          radius: 8,
          cType: "text/html",
          fillKey: 'RUS',
          date: '1955-11-22',
          latitude: -80,
          longitude: 0,
          fillOpacity: 10

        },{
          ID: 'Tsar Bomba',
          radius: 8,
          cType: "text/html",
          date: '1961-10-31',
          fillKey: 'RUS',
          latitude: 73.482,
          longitude: 54.5854,
          fillOpacity:10
        }
      ];*/
  //draw bubbles for bombs
  bombMap.bubbles(bombs, {
      popupTemplate: function (geo, data) { 
              return ['<div class="hoverinfo">ID: ' +  data.ID,
              '<br/>Content Type: ' +  data.cType,
              '<br/>Date: ' +  data.date + '',
              '</div>'].join('');
      }
  });

/* World Map Ends */

/* FORCE GRAPH */

var width = 960,
    height = 500;

var color = d3.scale.category10();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

var svgforce = d3.select("forcegraph").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("/static/D3/forcegraph.json", function(error, graph) {
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svgforce.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svgforce.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});

/* FORCE GRAPH ends here */


 /* SUCCESS ENDS HERE*/
}});






 
});
});
