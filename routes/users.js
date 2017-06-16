var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('users/register');
});

router.post('/register', function(req, res, next) {
    var login    = req.body.login,
        password = req.body.password,
        password2= req.body.password2,
        name = req.body.name;
        var response = 'Your login is: ' + login;
            response+= 'Your password is: ' + password;
        res.send(response);
});


module.exports = router;
