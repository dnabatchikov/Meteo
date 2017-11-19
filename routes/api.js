var express = require('express');
var router = express.Router();
var url = require('url');
var mysql = require('mysql');

router.post('/', function(req, res, next) {
  var data = req.body;
  if(data.humidity) {
    var connection = mysql.createConnection(require('config/database'));
    
    connection.connect(function(err) {
      if(err) throw err;
      console.log("Connection ID: "+connection.threadId);
    });
    var correctionFactor = 17.92;
    var uv = data.uv/correctionFactor;
    var CSID = req.header('ControllerSID');
    // вероятно, максимальный показатель освещенности 30клк. 
    // Далее устройство уходит в минус. 
    // Эвристически вычисляем разность просто
    var lux = data.light<0?2*30000+parseFloat(data.light):data.light;
    console.log("LightSensor: "+data.light+" ["+lux+" lx]");
    console.log("POSTed by "+CSID);
    
    connection.query("INSERT INTO meteo(CSID, pressure,temperature,humidity,light,uv,rain) VALUES(?,?,?,?,?,?,?)",
        [CSID, data.pressure, data.temperature, data.humidity, lux, uv, data.rain], function (error, results, fields) {
          if (error) throw error;
          console.log("Last insert ID: "+results.insertId);
          res.end('OK');
        });
    connection.end();
  } else console.log('Humidity sensor failure');
});

module.exports = router;
