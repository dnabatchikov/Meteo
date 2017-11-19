var yr = (new Date()).getFullYear();
$(document).ready(function() {

    Highcharts.SparkLine = function (a, b, c) {
        var hasRenderToArg = typeof a === 'string' || a.nodeName,
            options = arguments[hasRenderToArg ? 1 : 0],
            defaultOptions = {
                chart: {
                    renderTo: (options.chart && options.chart.renderTo) || this,
                    backgroundColor: null,
                    borderWidth: 0,
                    type: 'area',
                    margin: [2, 2, 2, 2],
                    height: 50,
                    style: {
                        overflow: 'hidden',
                        width: '100%'
                    },

                    // small optimalization, saves 1-2 ms each sparkline
                    skipClone: true,

                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    startOnTick: false,
                    endOnTick: false,
                    tickPositions: [0]
                },
                yAxis: {
                    endOnTick: false,
                    startOnTick: false,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    tickPositions: [0]
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    backgroundColor: null,
                    borderWidth: 0,
                    shadow: false,
                    useHTML: true,
                    hideDelay: 0,
                    shared: true,
                    padding: 0,

                },
                plotOptions: {
                    series: {
                        //negativeColor: '#0000cf',
                        //color: '#cf0000',
                        animation: true,
                        lineWidth: 1,
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        },
                        marker: {
                            radius: 1,
                            states: {
                                hover: {
                                    radius: 5
                                }
                            }
                        },
                        fillOpacity: 0.35
                    },
                    column: {
                        negativeColor: '#0000cf',
                        borderColor: 'silver'
                    },

                }
            };

        options = Highcharts.merge(defaultOptions, options);

        return hasRenderToArg ?
            new Highcharts.Chart(a, options, c) :
            new Highcharts.Chart(options, b);
    };

    var start = +new Date(),
        $tds = $('div[data-sparkline]'),
        fullLen = $tds.length,
        n = 0;

    Highcharts.Chunk = function(settings) {
        console.log(settings);
        var time = +new Date(),
            i,
            len = $tds.length,
            $td, stringdata, arr,
            opts = [
                {
                    color:settings.H.color,
                    fillOpacity:settings.H.fillOpacity,
                    min:settings.H.min,
                    max:settings.H.max,
                    m:settings.H.m
                },{
                    color:settings.P.color,
                    fillOpacity:settings.P.fillOpacity,
                    min:settings.P.min,
                    max:settings.P.max,
                    m:settings.P.m
                },{
                    color:settings.T.colors.pos,
                    fillOpacity:settings.T.fillOpacity,
                    min:settings.T.minT,
                    max:settings.T.maxT,
                    threshold:0,
                    negativeColor:settings.T.colors.neg,
                    m:settings.T.m
                },{
                    color:settings.dp.color,
                    fillOpacity:settings.dp.fillOpacity,
                    min:0,
                    max:settings.T.maxT,
                    m:settings.dp.m
                },{
                    color:settings.uv.color,
                    fillOpacity:settings.T.fillOpacity,
                    min:settings.uv.min,
                    max:settings.uv.max,
                    m:settings.uv.m
                },{
                    color:settings.lx.color,
                    fillOpacity:0.4,
                    min:0,
                    max:settings.lx.max,
                    m:settings.lx.m
                }
            ],
            chart;

        for (i = 0; i < len; i ++) {
            $td = $($tds[i]);
            stringdata = $td.data('sparkline');
            arr = stringdata.split('; ');
            opts[i].data = $.map(arr[0].split(','), parseFloat);
            chart = {};

            opts[i].series = [{
                data: opts[i].data,
                negativeColor: opts[i].negativeColor,
                color: opts[i].color,
                fillOpacity: opts[i].fillOpacity,
                threshold: opts[i].threshold ? opts[i].threshold : 0,
            }];

            if (arr[1]) {
                chart.type = arr[1];
            }

            $td.highcharts('SparkLine', {
                series: opts[i].series,
                yAxis: {
                    min:opts[i].min,
                    max:opts[i].max,
                },
                tooltip: {
                    headerFormat: '<span style="font-size: 10px"></span><br/>',
                    pointFormat: '<b>{point.y}</b> '+opts[i].m
                },
                exporting: false,
                chart: chart
            });

            n += 1;

            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 500) {
                $tds.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }

        }
        return opts;
    }
    
    
});