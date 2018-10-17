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

mainRouter.post('/getData', function(req, res) {
    mQuery
        .aggregator('sum')
        .downsample(req.body.increments) // Average datapoints hourly to limit the number of points being returned
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

            res.send(data);
        });
});

mainRouter.post('/getBuildingData', function(req, res) {
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    let metrics = req.body.loggerName;
    var results = [];
    for (let i = 0; i < metrics.length; i++) {
        mQuery
            .aggregator('sum')
            .downsample(req.body.increments) // Average datapoints hourly to limit the number of points being returned
            .rate(false)
            .metric(metrics[i])
            .tags('DataLoggerName', metrics[i]);

        client
            .ms(true)
            .arrays(true)
            .tsuids(false)
            .annotations('none')
            .start(startDate)
            .end(endDate)
            .queries(mQuery)
            .get(function onData(error, data) {
                if (error) {
                    console.error(JSON.stringify(error));
                    return;
                }
                results.push(data);
                if (results.length == metrics.length) {
                    res.send(results);
                }
            });
    }
});

mainRouter.post('/getTimeData', function(req, res) {
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    var results = [];
    for (let i = 0; i < startDate.length; i++) {
        mQuery
            .aggregator('sum')
            .downsample(req.body.increments) // Average datapoints hourly to limit the number of points being returned
            .rate(false)
            .metric(req.body.loggerName)
            .tags('DataLoggerName', req.body.loggerName);

        client
            .ms(true)
            .arrays(true)
            .tsuids(false)
            .annotations('none')
            .start(startDate[i])
            .end(endDate[i])
            .queries(mQuery)
            .get(function onData(error, data) {
                if (error) {
                    console.error(JSON.stringify(error));
                    return;
                }
                results.push(data);
                if (results.length == startDate.length) {
                    //console.log(results)
                    res.send(results);
                }
            });
    }
});

mainRouter.get('/getAllMetrics', function(req, res) {
    client.metrics(function onResponse(error, metrics) {
        if (error) {
            console.error(JSON.stringify(error));
            return;
        }
        res.send(metrics);
    });
});

module.exports = mainRouter;