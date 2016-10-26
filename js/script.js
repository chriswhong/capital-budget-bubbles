//based on http://jsfiddle.net/andycooper/PcjUR/1/ and Jim Vallandingham's Tutorial
var width = $('#viz').width(),
  height = $('#viz').height(),
  n = 6,
  m = 1,
  padding = 200,
  radius = d3.scaleSqrt().range([0, 12]),
  center = {
      x: (width / 2),
      y: height / 2
  },
  damper = .1,
  flyoutTimer
  
var charge = function(d) {
    return -Math.pow(d.radius, 2.0) / 4
  };

var colors = [
  "#52b93c",
  "#ae6dea",
  "#b2c936",
  "#6d4fc2",
  "#80b13e",
  "#4e6fe5",
  "#b1af2c",
  "#9e3eac",
  "#53bd65",
  "#d242ac",
  "#478433",
  "#d87ade",
  "#55c696",
  "#e74084",
  "#41bfbf",
  "#b73820",
  "#4d8ade",
  "#e2ab3c",
  "#585db3",
  "#cd7829",
  "#9387e2",
  "#a8892f",
  "#8252a1",
  "#b2b15b",
  "#ae377e",
  "#398660",
  "#d63f50",
  "#56a7d9",
  "#e7653d",
  "#5168a2",
  "#677229",
  "#e56eae",
  "#94b375",
  "#bc3d65",
  "#a29edf",
  "#8a632e",
  "#c788cb",
  "#d99668",
  "#9a5179",
  "#e07f7f",
  "#df8db2",
  "#a44d44"
]

d3.csv('./fy17types.csv', function(data) {
    
    var max_amount = d3.max(data, function(d) {
      return parseInt(d.fy17total);
    })
                
    var radius_scale = d3.scalePow()
      .exponent(0.5)
      .domain([0, max_amount])
      .range([0, 100])


    var nodes = [];
    data.map(function(d, i) {
      var node = {
        type: d.type,
        name: d.name,
        fy17total: d.fy17total,
        radius: radius_scale(parseInt(d.fy17total)),
        x: Math.random() * 300,
        y: Math.random() * 300,
        color: colors[i%colors.length]
      }
      nodes.push(node);
    });

    nodes.map(function(d) {
      $('#sidebar').append('<div class="type' + d.type + '"><div class="bullet" style="background-color:' + d.color + '"></div>' + d.name + '</div>')
    })


    

    var force = d3.forceSimulation(nodes)
      .velocityDecay(0.1)
      .force("x", d3.forceX().strength(0.01))
      .force("y", d3.forceY().strength(0.01))
      .force("center", d3.forceCenter(center.x, center.y))
      // .force("charge", d3.forceManyBody())
      .force("collide", d3.forceCollide().radius(function(d) { return d.radius - 1; }).iterations(2))
      .on("tick", tick)


      // .size([width, height])
      // .gravity(-0.01)
      //   //.charge(charge)
      // .friction(.7).on("tick", tick).start();
    var svg = d3.select("#viz").append("svg").attr("width", width).attr(
            "height", height).append("g")
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var circle = svg.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 0)
      .attr("class", function(d) {
        return 'type' + d.type
      })
      .style("fill", function(d) {
        console.log(d.color)
        // return brewerScale[mapCategories(d)];
        return d.color
    });

    circle.transition().duration(800).attr("r", function(d) {
        return d.radius;
    });

    circle
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", true);
        updateInfo(d)
      })
      .on('mouseout', function(d) {
        d3.select(this).classed("highlight", false);
      })

   
    //pull to center on tick
    function tick(e) {
      console.log('tick')
      circle
 
        .attr("cx", function(d) {
          return d.x 
        })
        .attr("cy", function(d) {
          return d.y 
        });
    }
     

$('div[class^=type]').mouseover(function() {
        
        clearTimeout(flyoutTimer);
        var thisClass = $(this).attr('class');
        $(this).addClass('highlight');
        d3.select('circle.' + thisClass).attr('class',
            'highlight ' + thisClass);
        //.transition().duration(250).style('fill','red');
        var thisType = thisClass.split('type')[1]
        nodes.forEach(function(d) {
            if (d.type == thisType) {
                d.radius = d.radius;
            }
        });
        // force.alpha()
        // force.restart()
    }).mouseout(function() {
        $(this).removeClass('highlight');
        var thisClass = $(this).attr('class');
        d3.select('circle.' + thisClass).attr('class', thisClass);
        var thisAgency = $(this).html();
        nodes.forEach(function(d) {
            updateInfo(d)
        });
        flyoutTimer = setTimeout(function() {
            $('#flyout').fadeOut(10);
        }, 100)
        // force.alpha(1)
        // force.restart()
    });


    $('.about').on('click', function() {
      $('#mask').fadeIn(250);
      $('.popup').fadeIn(250);
    });
    $('.close').on('click', function() {
      $(this).parent().fadeOut(250);
      $('#mask').fadeOut(250);
    });

})

function updateInfo(d) {
  $('#info').html('<h2>' + d.name + '</h2><h1>' + numeral(d.fy17total).format('($ 0.00 a)') + '</h1>')
}
