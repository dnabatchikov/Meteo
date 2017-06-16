var express = require('express');
var router = express.Router();
var url = require('url');
var mysql = require('mysql');

router.post('/', function(req, res, next) {
  var connection = mysql.createConnection(require('config/database'));
  var data = req.body;
  if(data.humidity) {
    connection.connect();
    connection.query("INSERT INTO meteo(pressure,temperature,humidity,light,uv,rain) VALUES(?,?,?,?,?,?)",
        [data.pressure, data.temperature, data.humidity, data.light, data.uv, data.rain], function (error, results, fields) {
          if (error) throw error;
          res.end('OK');
        });

    connection.end();
  } else console.log('Humidity sensor failure');
  //res.render('users', {data: obj});
}); //

module.exports = router;
