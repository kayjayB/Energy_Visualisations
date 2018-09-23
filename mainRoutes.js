var path = require("path");
var express = require("express");

// Set up the opentsdb client
var client = require('opentsdb-client')(),
    mQuery = require('opentsdb-mquery')(),
    end = ('2018/09/01 00:00'),
    start = ('2013/01/01 00:00');

client.host('35.240.2.119');
client.port(4242);

var mainRouter = express.Router();

mainRouter.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'landingPage.html'));
});

mQuery
    .aggregator('sum')
    .downsample('5m-avg')
    .rate(false)
    .metric('WITS_13_Jubilee_Road_kVarh')
    .tags('DataLoggerName', 'WITS_13_Jubilee_Road_kVarh');

client
    .ms(true)
    .arrays(true)
    .tsuids(false)
    .annotations('none')
    .start(start)
    .end(end)
    .queries(mQuery)
    .get(function onData(error, data) {
        console.log("in func")
        if (error) {
            console.error(JSON.stringify(error));
            return;
        }
        console.log(JSON.stringify(data));
    });

module.exports = mainRouter;