var express = require('express');
const request = require('superagent');
var app = express();


const PREFIX_LABEL = "scale.";
var APIKEYS = {"username": "AA75F2821934A0510E37", "password": "znkdPG6yMo1bBsLEavTAqQQqs6rqSNa2aFWEMNCo"}
var HOSTS = {};
var SERVICES = {};

app.post('/apikeys', function (req, res) {
    APIKEYS = {"username": req.body.username, "password": req.body.password};
    res.send(APIKEYS)
});

app.get('/', function (req, res) {
    res.send({"hosts": HOSTS, "services": SERVICES})
});

app.get('/host', function (req, res) {
    request.get("http://192.168.99.100:8080/v1/hosts").then((result) => {
        var labels = {};

        for(var i in result.body.data) {
            var host = result.body.data[i];

            var hostLabels = {};
            for (label in host.data.fields.labels) {
                if (label.startsWith(PREFIX_LABEL)) {
                    hostLabels[label] = host.data.fields.labels[label]
                }
            }
            if(Object.keys(hostLabels).length !== 0) {
                labels[host.data.fields.hostname] = hostLabels
            }
        }
        HOSTS = labels;
        res.send(HOSTS)
    })
});

app.get('/service', function (req, res) {
    request.get("http://192.168.99.100:8080/v1/services").then((result) => {
        var labels = {}

        for(var i in result.body.data) {
            var service = result.body.data[i]
            var name = service.name
            var label = ""
            if(service.description != null) {
                try {
                    label = JSON.parse(service.description)
                    labels[name] = label
                } catch (e) {

                }
            }
        }
        SERVICES = labels
        res.send(SERVICES)
    })
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});