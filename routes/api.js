var express = require('express');
var router = express.Router();
var url = require('url');
var mysql = require('mysql');

router.post('/', function(req, res, next) {
  var connection = mysql.createConnection(require('config/database'));
  var data = req.body;

  if(data.humidity) {
    connection.connect();
    var correctionFactor = 17.92;
    var uv = data.uv/correctionFactor;
    var CSID = req.header('ControllerSID');
    console.log("POSTed by "+CSID);
    connection.query("INSERT INTO meteo(CSID, pressure,temperature,humidity,light,uv,rain) VALUES(?,?,?,?,?,?,?)",
        [CSID, data.pressure, data.temperature, data.humidity, data.light, uv, data.rain], function (error, results, fields) {
          if (error) throw error;
          res.end('OK');
        });
    connection.end();
  } else console.log('Humidity sensor failure');
});

module.exports = router;
