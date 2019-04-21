queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

function makeGraphs(error, stormData) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }

    // Fields for select options
    var optionsData = [{key:'All'},
                       {key:'Death'},
                       {key:'Injury'}]

    // Crossfilter
    var ndx = crossfilter(stormData);
    var optionsFilter = crossfilter(optionsData);
    var donations = crossfilter([{key:'Donations',
                                  value:30000000000},
                                 {key:'Needs',
                                  value:199999999700}]);
  
    //reduce functions
    function reduceAddYear(p,v){
        p['deaths'] += v['DEATHS_DIRECT']
        p['injuries'] += v['INJURIES_DIRECT']
        return p
    }
    function reduceRemoveYear(p,v){
        p['deaths'] -= v['DEATHS_DIRECT']
        p['injuries'] -= v['INJURIES_DIRECT']
        return p
    }
    function reduceInitYear(){
        return {
            deaths: 0,
            injuries: 0
        }
    }

    // Dimensions
    var yearDim = ndx.dimension(function (d) {
        return d["YEAR"];
    });

    var eventDim = ndx.dimension(function (d) {
        return d["EVENT_TYPE"];
    });

    var optionsDim = optionsFilter.dimension(function(d){
        return d.key
    });
    
    var donationsDim = donations.dimension(function(d) {
        return d.key
    })    

    // Groups
    var yearGroup = yearDim.group().reduce(reduceAddYear,reduceRemoveYear,reduceInitYear);

    var eventGroup = eventDim.group().reduce(reduceAddYear,reduceRemoveYear,reduceInitYear);

    var optionsGroup = optionsDim.group();

    var donationsGroup = donationsDim.group().reduce(function(p,v){
        p += v.value;
        return p
    },function(p,v){
        p -= v.value;
    },function(){
        return 0
    });
    
    // Charts
    if(window.location.pathname == '/'){
        //=== RESORT ===//
        // Bar Chart
        var barChart = dc.barChart('#bar-graph');

        barChart
            .width($('#bar-graph').parent().width())
            .height(300)
            .dimension(yearDim)
            .group(yearGroup)
            .valueAccessor(function(d) {
              return d.value.deaths+d.value.injuries;
             })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Year")
            .yAxisLabel("Amount")
            .elasticY(true)
            .elasticX(true)
            .margins({top: 10, right: 50, bottom: 70, left: 70})
            .on("postRender", function(c) {
              fixChartLabels(c);
              // c.width($('#select').parent().width())
            });

        // Select Menu
        var selectField = dc.selectMenu('.select-menu');

        selectField
            .dimension(optionsDim)
            .group(optionsGroup)
            .title(function (d,i){
                return d.key
            })
            .promptText('Filter');
        
        var selectField2 = dc.selectMenu('.select-menu2');

        selectField2
            .dimension(optionsDim)
            .group(optionsGroup)
            .title(function (d,i){
                return d.key
            })
            .promptText('Filter');

        // Line Chart
        var lineChart = dc.lineChart('#line-graph');

        lineChart
            .width($('#line-graph').parent().width())
            .height(300)
            .dimension(eventDim)
            .group(eventGroup)
            .valueAccessor(function(d) {
              return d.value.deaths+d.value.injuries;
             })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Event Type")
            .yAxisLabel("Amount")
            .elasticY(true)
            .elasticX(true)
            .margins({top: 10, right: 50, bottom: 180, left: 70})
            .on("postRender", function(c) {
              fixChartLabels(c);
            });
        
        $('.select-menu,.select-menu2').change(function(event){
            var selection = $(event.target).val();
            if(selection == 'Death'){
                barChart.valueAccessor(function(d) {
                    return d.value.deaths;
                })
                .margins({top: 10, right: 50, bottom: 70, left: 70})
                lineChart.valueAccessor(function(d) {
                    return d.value.deaths;
                })
                .margins({top: 10, right: 50, bottom: 70, left: 70})
            }
            else if(selection == 'Injury'){
                barChart.valueAccessor(function(d) {
                    return d.value.injuries;
                })
                lineChart.valueAccessor(function(d) {
                    return d.value.injuries;
                })
            }
            else {
                barChart.valueAccessor(function(d) {
                    return d.value.deaths+d.value.injuries;
                })
                lineChart.valueAccessor(function(d) {
                    return d.value.deaths+d.value.injuries;
                })
            }
            dc.renderAll();
        });


        
        var tO;
        $(window).resize(function(e,d,i){   
            clearTimeout(tO);
            tO = setTimeout(function() {
                console.log('Resize');
                barChart
                    .width($('#bar-graph').parent().width())
                lineChart
                    .width($('#line-graph').parent().width())
                // dc.redrawAll();
                // dc.deregisterAllCharts();
                dc.renderAll();  
            }, 1000);      
        })
    }
    else if(window.location.pathname == '/help'){
        // pie Chart
        var pieChart = dc.pieChart('#pie-chart');

        pieChart
            .dimension(donationsDim)
            .group(donationsGroup)
            .radius(100)
            .height(200)
            .valueAccessor(function(d) {
                // console.log(d.value)
                return d.value;
             })
    }   
    
    dc.renderAll();

    $('#donation-form').submit(function (e) {
        e.preventDefault();

        var amount = $(this).children('#donatenumber').val();
        
        var update = donationUpdate(200000000000,30000000000,amount);
        if(update){
            donations.add([{key:'Donations', value:Number.parseInt(amount)},{key:'Needs', value:Number.parseInt('-'+amount)}])

            var donationsDim = donations.dimension(function(d) {
                // console.log(d)
                return d.key
            })
            var donationsGroup = donationsDim.group().reduce(function(p,v){
                p += v.value;
                return p
            },function(p,v){
                p -= v.value;
            },function(){
                return 0
            });

            pieChart
                .dimension(donationsDim)
                .group(donationsGroup)
                .valueAccessor(function(d) {
                    console.log(d)
                    return d.value;
                 })
            dc.renderAll();
        }
        else{
            console.log('Thank You');
            $('.donation').slideUp();  
        }
        $(this).slideUp(function(){
            $('#thanks').slideDown();
        });    
    })
}

function donationUpdate(g,c,d) {
    g = Number.parseInt(g);
    c = Number.parseInt(c);
    d = Number.parseInt(d);

    console.log(c+d > g)
    if((c+d) >= g){
        console.log('Thank You')
        return false;
    }
    else{
        var current = $('#current');
        if(d){
            current.val(function(){
                var val = Number.parseInt($(this).val());
                console.log(typeof val)
                return val + d;
            })
        }
        else{
            current.val(c)
        }
        var goal = $('#goal').val(g);
        var need = $('#need').val(goal.val() - current.val());
        $('#a').attr('max',need.val())
        console.log(goal.val() - current.val())
    }
    return need <= 0 ? false : true;
}

function fixChartLabels(chart) {
    $('#bar-graph .axis text')
    // .css('fill','white')

    $('#bar-graph .axis.x text')
    .css('pointer-events','all')
    .css('cursor','pointer')

    chart.svg().selectAll('.axis.x text')
    .on("click",function(d) { 
    chart.filter(d);  
    dc.redrawAll();
    })
    .style("text-anchor", "end" )      
    .attr("dx", function(d) { return "-0.6em"; })
    // .attr("dy", function(d) { return "0"; })
    .attr("transform", function(d) { return "rotate(-90, -4, 9) "; })
    .attr("transform", function(d) { return "rotate(-90, -4, 9) "; });
}

donationUpdate(200000000000,30000000000,0)
