//based on http://jsfiddle.net/andycooper/PcjUR/1/ and Jim Vallandingham's Tutorial
var width = $('#viz').width() - 100,
    height = $('#viz').height() - 100,
    n = 6,
    m = 1,
    padding = 200,
    radius = d3.scale.sqrt().range([0, 12]),
    color = d3.scale.category10().domain(d3.range(m)),
    x = d3.scale.ordinal().domain(d3.range(m)).rangePoints([0, width], 1),
    center = {
        x: width / 2,
        y: height / 2
    },
    damper = .1,
    firstTicks = true,
    flyoutTimer;
console.log(width);
var brewerScale = ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)',
    'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)',
    'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)'
];
//style categoryBoxes with our 9 colors
brewerScale.forEach(function(color, i) {
    $('#categoryBox' + i).css('background', color)
})
$('body').mousemove(function(e) {
    var flyoutHeight = $('#flyoutTop').height();
    console.log(flyoutHeight);
    $('#flyout').css('left', e.clientX - 220).css('top', e.clientY -
        flyoutHeight - 60);
});
d3.json('./cleanedData.json', function(data) {
    var i = 0;
    data.forEach(function(item) {
        item.id = i;
        var thisCategory = mapCategories(item);
        console.log(thisCategory);
        $('#categoryBox' + thisCategory).append(
            "<div class = 'agency" + item.id + "'>" + item.department +
            "</div>");
        //$('#sideBar').append("<div class = 'agency" + item.id + "'>" + item.department +"</div>");
        i++;
    });
    $('div[class^=agency]').mouseover(function() {
        clearTimeout(flyoutTimer);
        var thisClass = $(this).attr('class');
        $(this).addClass('highlight');
        //$('circle.' + thisClass).animate({
        d3.select('circle.' + thisClass).attr('class',
            'highlight ' + thisClass);
        //.transition().duration(250).style('fill','red');
        var thisAgency = $(this).html();
        nodes.forEach(function(d) {
            if (d.department == thisAgency) {
                d.radius = d.radius + 30;
                $('#flyoutDepartment').html(d.department);
                $('#flyoutFinalBudget').html(
                    "Budget: $" + d.finalBudget.toLocaleString()
                );
                $('#flyout2012Actual').html(
                    "Actual Spend: $" + d.fy2012Actual
                    .toLocaleString());
                $('#flyout').fadeIn(10);
            }
        });
        force.start();
    }).mouseout(function() {
        $(this).removeClass('highlight');
        var thisClass = $(this).attr('class');
        d3.select('circle.' + thisClass).attr('class',
            thisClass);
        //.transition().duration(250).style('fill','#1B8BCD');
        var thisAgency = $(this).html();
        nodes.forEach(function(d) {
            if (d.department == thisAgency) {
                d.radius = d.radius - 30;
            }
        });
        flyoutTimer = setTimeout(function() {
            $('#flyout').fadeOut(10);
        }, 100)
        force.start();
    });
    var max_amount = d3.max(data, function(d) {
            return parseInt(d.finalBudget);
        }),
        radius_scale = d3.scale.pow().exponent(0.5).domain([0,
            max_amount
        ]).range([3, 100]),
        nodes = [];
    var clusters = new Array(9);
    data.forEach(function(d) {
        var node = {
            id: d.id,
            category: d.category,
            department: d.department,
            finalBudget: d.finalBudget,
            fy2012Actual: d.fy2012Actual,
            radius: radius_scale(parseInt(d.finalBudget)),
            //charge: radius_scale(parseInt(d.finalBudget)),
            x: Math.random() * 900,
            y: Math.random() * 900
        }
        nodes.push(node);
        //check if clusters has a larger radius for this category, push if this is larger.
        var thisCategory = mapCategories(node);
        if (!clusters[thisCategory]) {
            clusters[thisCategory] = node;
        }
        if (node.radius > clusters[thisCategory].radius) {
            clusters[thisCategory].radius = node.radius;
        }
    });
    var charge = function(d) {
        return -Math.pow(d.radius, 2.0) / 4;
    };
    var force = d3.layout.force().nodes(nodes).size([width, height]).gravity(-
            0.01)
        //.charge(charge)
        .friction(.7).on("tick", tick).start();
    var svg = d3.select("#viz").append("svg").attr("width", width).attr(
            "height", height).append("g")
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var circle = svg.selectAll("circle").data(nodes).enter().append(
        "circle").attr("r", 0).attr("class", function(d) {
        return "agency" + d.id;
    }).style("fill", function(d) {
        return brewerScale[mapCategories(d)];
    });
    circle.transition().duration(800).attr("r", function(d) {
        return d.radius;
    });
    circle.on('mouseover', function(d) {
        clearTimeout(flyoutTimer);
        $('.agency' + d.id).toggleClass("highlight");
        d3.select(this).classed("highlight", true);
        $('#flyoutDepartment').html(d.department);
        $('#flyoutFinalBudget').html("Budget: $" + d.finalBudget
            .toLocaleString());
        $('#flyout2012Actual').html("Actual Spend: $" + d.fy2012Actual
            .toLocaleString());
        $('#flyout').fadeIn(10);
    }).on('mouseout', function(d) {
        $('.agency' + d.id).toggleClass("highlight");
        d3.select(this).classed("highlight", false);
        flyoutTimer = setTimeout(function() {
            $('#flyout').fadeOut(10);
        }, 100)
    })

    function mapCategories(d) {
            switch (d.category) {
                case "General Government":
                    return 0
                    break;
                case "Operation of Service Departments":
                    return 1
                    break;
                case "Financial Management":
                    return 2
                    break;
                case "City-Wide Appropriations Under the Director of Finance":
                    return 3
                    break;
                case "Promotion and Public Relations":
                    return 4
                    break;
                case "Personnel":
                    return 5
                    break;
                case "Administration of Justice":
                    return 6
                    break;
                case "City-Wide Appropriations Under the First Judicial District":
                    return 7
                    break;
                case "Conduct of Elections":
                    return 8
                    break;
            }
        }
        //pull to center on tick

    function tick(e) {
            circle.each(cluster(10 * e.alpha * e.alpha)).each(collide(.3))
                .each(moveTowardsCenter(.1)).attr("cx", function(d) {
                    return d.x + (center.x - d.x) * (damper + 0.02) *
                        e.alpha;
                }).attr("cy", function(d) {
                    return d.y + (center.y - d.y) * (damper + 0.02) *
                        e.alpha;
                });
            if (firstTicks) {}
        }
        // Move nodes toward cluster focus.

    function moveTowardsCenter(alpha) {
            return function(d) {
                d.x = d.x + (center.x - d.x) * (damper + 0.02) *
                    alpha;
                d.y = d.y + (center.y - d.y) * (damper + 0.02) *
                    alpha;
            };
        }
        // Resolve collisions between nodes.

    function collide(alpha) {
            var quadtree = d3.geom.quadtree(nodes);
            return function(d) {
                var r = d.radius + radius.domain()[1] + padding,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.point.radius +
                            (d.color !== quad.point.color) *
                            padding;
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 ||
                        y2 < ny1;
                });
            };
        }
        // Move d to be adjacent to the cluster node. from http://bl.ocks.org/mbostock/1747543

    function cluster(alpha) {
        return function(d) {
            var cluster = clusters[mapCategories(d)];
            if (cluster === d) return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    }
    $('.about').on('click', function() {
        $('#mask').fadeIn(250);
        $('.popup').fadeIn(250);
    });
    $('.close').on('click', function() {
        $(this).parent().fadeOut(250);
        $('#mask').fadeOut(250);
    });
}); //end d3.json