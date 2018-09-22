var path = require("path");
var express = require("express");
var mainRouter = express.Router();

mainRouter.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'landingPage.html'));
});

module.exports = mainRouter;