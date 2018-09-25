var path = require("path");
var express = require("express");

// Set up the opentsdb client
var client = require('opentsdb-client')(),
    mQuery = require('opentsdb-mquery')(),
    end = ('2018/09/01 00:00'),
    start = ('2018/08/30 00:00');

client.host('35.240.2.119');
client.port(4242);

var mainRouter = express.Router();

mainRouter.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'landingPage.html'));
});

mainRouter.get('/visualisation1', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'visualisation1.html'));
});

mainRouter.post('/getData', function(req, res) {
    mQuery
        .aggregator('sum')
        .downsample('1h-avg') // Average datapoints hourly to limit the number of points being returned
        .rate(false)
        .metric(req.body.loggerName)
        .tags('DataLoggerName', req.body.loggerName);

    client
        .ms(true)
        .arrays(true)
        .tsuids(false)
        .annotations('none')
        .start(req.body.startDate)
        .end(req.body.endDate)
        .queries(mQuery)
        .get(function onData(error, data) {
            if (error) {
                console.error(JSON.stringify(error));
                return;
            }
            // console.log(JSON.stringify(data));

            res.send(data);
        });
});

module.exports = mainRouter;