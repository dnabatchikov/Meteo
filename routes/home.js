/**
 * Created by Denis on 01.04.2017.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var Q = require('q');
var jsonfile = require('jsonfile'),
    fs = require('fs'),
    datetime = require('node-datetime');

var file = '/home/aries/Meteo/cache/home.json';
var cron = require('node-cron');

var task = cron.schedule('* * * * *', function() {

    var connection = mysql.createConnection(require('config/database'));
    connection.connect();

    function queryWidgetDatasets() {
        var deferred = Q.defer();
        connection.query('CALL widget_dataset(1)', deferred.makeNodeResolver());
        return deferred.promise;
    }

    function queryWeekSummaryDataset() {
        var deferred = Q.defer();
        connection.query('CALL weekTemperatureSummary()', deferred.makeNodeResolver());
        return deferred.promise;
    }

    function queryYearSummaryDataset() {
        var deferred = Q.defer();
        connection.query('CALL yearTemperatureSummary()', deferred.makeNodeResolver());
        return deferred.promise;
    }

    function queryColumnTemperatureDataset() {
        var deferred = Q.defer();
        connection.query("CALL averageDayTemperature(0,'T')", deferred.makeNodeResolver());
        return deferred.promise;
    }

    function queryWeekMeasurementsTable() {
        var deferred = Q.defer();
        connection.query("CALL weekMeasurementsTable()", deferred.makeNodeResolver());
        return deferred.promise;
    }

    function queryYearHeatmapDataset() {
        var deferred = Q.defer();
        connection.query("CALL yearHeatMap", deferred.makeNodeResolver());
        return deferred.promise;
    }

    var response = {};

    Q.all([queryWidgetDatasets(), queryWeekSummaryDataset(), queryYearSummaryDataset(), queryColumnTemperatureDataset(), queryWeekMeasurementsTable(), queryYearHeatmapDataset()]).then(function(results) {
        var queryWidgetDataset                = results[0][0][0],
            queryWeekSummaryDataset           = results[1][0][0];
        queryYearSummaryDataset           = results[2][0][0];
        queryColumnTemperatureDataset     = results[3][0][0];
        queryWeekMeasurementsTableDataset = results[4][0][0];
        queryYearHeatmapDataset           = results[5][0][0];
        var widgets = {pressure:{dataset:[]},humidity:{dataset:[]},temperature:{dataset:[]},uv:{dataset:[]},dp:{dataset:[]},lx:{dataset:[]},temperaturehumidity:{dataset:[]}};
        var humiditySparkline = [],
            temperatureSparkline = [],
            pressureSparkLine = [],
            uvSparkline = [],
            lxSparkline = [],
            dpSparkline = [];

        queryWidgetDataset.forEach(function (a) {
            var date = new Date(a.date_added),
                when = date.getDate() + '.' + date.getMonth() + ' ' + date.getHours() + ':' + date.getMinutes();

            widgets.humidity.dataset.push([when, a.humidity]);
            widgets.pressure.dataset.push([when, a.pressure]);
            widgets.temperature.dataset.push([when, a.temperature]);
            widgets.temperaturehumidity.dataset.push([when, a.humidity, a.temperature]);
            widgets.uv.dataset.push([when, a.uv]);
            widgets.dp.dataset.push([when, a.dp]);
            widgets.lx.dataset.push([when, a.light]);


            humiditySparkline.push(a.humidity);
            temperatureSparkline.push(a.temperature);
            pressureSparkLine.push(a.pressure);
            uvSparkline.push(a.uv);
            lxSparkline.push(a.light);
            dpSparkline.push(a.dp);

        });

        widgets.humidity.last = queryWidgetDataset[queryWidgetDataset.length-1].humidity;
        widgets.pressure.last = queryWidgetDataset[queryWidgetDataset.length-1].pressure;
        widgets.temperature.last = queryWidgetDataset[queryWidgetDataset.length-1].temperature;
        widgets.uv.last = queryWidgetDataset[queryWidgetDataset.length-1].uv;
        widgets.dp.last = queryWidgetDataset[queryWidgetDataset.length-1].dp;
        widgets.lx.last = queryWidgetDataset[queryWidgetDataset.length-1].light;

        var weekforecast = [],
            calendar = {rows: [], min: 100, max: 0},
            dayTempHyst = [];

        queryWeekSummaryDataset.forEach(function(a) {
            var date = new Date(a.date_added);
            var dayforecast = {measurements:{humidity:{}, pressure:{}, temperature:{}, uv:{}, lx:{}}};
            dayforecast.dow = a.dow;
            dayforecast.weekday = a.weekday;
            dayforecast.day = a.day;
            dayforecast.month = a.month;
            dayforecast.measurements.temperature.avgT =
                a.avgT ? a.avgT>=1||a.avgT<0||a.avgT>-1||a.avgT<-1 ? a.avgT.toPrecision(2) : a.avgT.toPrecision(1) : a.avgT;
            dayforecast.measurements.temperature.minT =
                a.minT ? a.minT>=1||a.minT<0||a.minT>-1&&a.minT<-1 ? a.minT.toPrecision(2) : a.minT.toPrecision(1) : a.minT;
            dayforecast.measurements.temperature.maxT =
                a.maxT ? a.maxT>-1&& a.maxT<0? a.maxT.toPrecision(1): a.maxT.toPrecision(2): a.maxT;
            dayforecast.measurements.pressure.avgP = a.avgP;
            dayforecast.measurements.pressure.minP = a.minP;
            dayforecast.measurements.pressure.maxP = a.maxP;
            dayforecast.measurements.humidity.avgH = a.avgH;
            dayforecast.measurements.humidity.minH = a.minH;
            dayforecast.measurements.humidity.maxH = a.maxH;

            dayforecast.measurements.uv.max = a.maxUV;
            dayforecast.measurements.uv.avg = a.avgUV;

            dayforecast.measurements.lx.max = a.maxLx;
            dayforecast.measurements.lx.avg = a.avgLx;
            dayforecast.measurements.lx.min = a.avgLx;


            dayforecast.measurements.humidity.avgHD = a.avgHD?a.avgHD.toPrecision(2):a.avgHD;
            dayforecast.measurements.pressure.avgPD = a.avgPD?a.avgPD.toPrecision(2):a.avgPD;
            dayforecast.measurements.temperature.avgTD = a.avgTD?a.avgTD.toPrecision(2):a.avgTD;

            dayforecast.measurements.humidity.avgHN = a.avgHN?a.avgHN.toPrecision(2):a.avgHN;
            dayforecast.measurements.pressure.avgPN = a.avgPN?a.avgPN.toPrecision(2):a.avgPN;
            dayforecast.measurements.temperature.avgTN =
                a.avgTN ? a.avgTN>=1 ? a.avgTN.toPrecision(2) : a.avgTN.toPrecision(1) : a.avgTN;

            dayforecast.measurements.humidity.minHD = a.minHD?a.minHD.toPrecision(2):a.minHD;
            dayforecast.measurements.pressure.minPD = a.minPD?a.minPD.toPrecision(2):a.minPD;
            dayforecast.measurements.temperature.minTD = a.minTD?a.minTD.toPrecision(2):a.minTD;

            dayforecast.measurements.humidity.minHN = a.minHN?a.minHN.toPrecision(2):a.minHN;
            dayforecast.measurements.pressure.minPN = a.minPN?a.minPN.toPrecision(2):a.minPN;
            dayforecast.measurements.temperature.minTN = a.minTN?a.minTN.toPrecision(2):a.minTN;

            dayforecast.measurements.humidity.maxHD = a.maxHD?a.maxHD.toPrecision(2):a.maxHD;
            dayforecast.measurements.pressure.maxPD = a.maxPD?a.maxPD.toPrecision(2):a.maxPD;
            dayforecast.measurements.temperature.maxTD = a.maxTD?a.maxTD.toPrecision(2):a.maxTD;

            dayforecast.measurements.humidity.maxHN = a.maxHN?a.maxHN.toPrecision(2):a.maxHN;
            dayforecast.measurements.pressure.maxPN = a.maxPN?a.maxPN.toPrecision(2):a.maxPN;
            dayforecast.measurements.temperature.maxTN = a.maxTN?a.maxTN.toPrecision(2):a.maxTN;

            dayforecast.measurements.uv = a.avgUV;

            dayforecast.sunrise = a.sunrise ? a.sunrise.substring(0,5) : '&nbsp;';

            weekforecast.push(dayforecast);
        });

        queryYearSummaryDataset.forEach(function(a) {
            var date = new Date(a.date_added);
            calendar.rows.push([date.getFullYear(), date.getMonth(), date.getDate(), a.avgT]);
            calendar.max = a.avgT > calendar.max ? Math.ceil(a.avgT) : calendar.max;
            calendar.min = a.avgT < calendar.min ? Math.floor(a.avgT) : calendar.min;
            calendar.mid = (calendar.max+calendar.min)/2
        });

        var measurements = [], day = {}, heatmap = [];

        queryYearHeatmapDataset.forEach(function(a) {
            heatmap.push(a.line);
        });

        response = {
            widgetsDataset: widgets,
            weekforecastDataset: weekforecast,
            calendar: calendar,
            dayTempHystDataset: dayTempHyst,
            measurementsDataset: measurements,
            sparklines: {
                H: humiditySparkline,
                T: temperatureSparkline,
                P: pressureSparkLine,
                uv:uvSparkline,
                dp: dpSparkline,
                lx: lxSparkline
            },
            heatmap: heatmap.join("\n")
        }
        jsonfile.writeFile(file, response, function(err) {});
        var m = '/home/aries/Meteo/cache/measurements.json';
        jsonfile.writeFile(m, response.weekforecastDataset, function(err) {});
        var s = '/home/aries/Meteo/cache/sparklines.json';
        jsonfile.writeFile(m, response.sparklines, function(err) {});


    });

    connection.end();

    console.log("Fresh data loaded!");
});

task.start();

router.get('/', function(req, res, next) {

    if(fs.existsSync(file) && parseInt((new Date).getTime()/1000) < parseInt(fs.statSync(file).mtime.getTime()/1000 + 60)) {
        console.log('CacheStorage...');
        res.render('home', jsonfile.readFileSync(file));

    } else {
        res.render('Ожидаем создания файла кэша...');
    }
});


module.exports = router;