/**
 * Created by Denis on 16.06.2017.
 */
google.charts.load('current', {packages: ['corechart', 'calendar', 'bar']});
var options = {
    width: 130,
    height: 70,
    legend: {
        position: 'none'
    },
    vAxis: {minValue: 0}
};



$(document).ready(function() {
    var settings = {
        P:{
            min:Math.floor(wfD.pressure.minP),
            max:Math.ceil(wfD.pressure.maxP),
            color:'#800080',
            fillOpacity:0.4,
            m:'mmHg'},
        T:{
            min: Math.floor(wfD.temperature.minT),
            max: Math.ceil(wfD.temperature.maxT),
            colors:{
                pos:'#900',
                neg:'#009'
            },
            fillOpacity:0.4,
            m:'°C'},
        dp: {
            min:wfD.temperature.minT-3,
            max:wfD.temperature.maxT,
            color:'#000',
            fillOpacity:0.4,
            m:'°C'
        },
        H:{
            min:Math.floor(wfD.humidity.minH), //-1.0,
            max:Math.ceil(wfD.humidity.maxH), //+1.0,
            color:'#11b3f0',
            fillOpacity:0.4,
            m:'%'
        },
        lx:{
            min:0, //-1.0,
            max:10000, //+1.0,
            color:'orange',
            fillOpacity:0.4,
            m:'лк'
        },
        uv:{
            min:0,
            max:wfD.uv.max,
            color:'#11b300',
            fillOpacity:0.4,
            rainbow: [{
                threshold: 4482,
                negativeColor: 'green',
                color: 'yellow'
            },{
                threshold: 5976,
                negativeColor: 'transparent',
                color: 'orange'
            },{
                threshold: 8216,
                negativeColor: 'transparent',
                color: 'red'
            },{
                threshold: 8217,
                negativeColor: 'transparent',
                color: 'purple'
            },],
            m:'мкВт⋅м<sup>-2</sup>'
        }
    };

    Highcharts.Chunk(settings);
})

