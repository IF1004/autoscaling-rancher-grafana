var express = require('express');
const request = require('superagent');
var app = express();

const URL_API_RANCHER = "http://192.168.99.100:8080/";
const URL_API_RANCHER_V1 = URL_API_RANCHER + "v1/";
const URL_API_RANCHER_V2 = URL_API_RANCHER + "v2-beta/";
const API_RANCHER = URL_API_RANCHER_V1;
const API_RANCHER_WEBHOOK = URL_API_RANCHER + "v1-webhooks/";


const PREFIX_LABEL = "scale.";
var APIKEYS = {"username": "AA75F2821934A0510E37", "password": "znkdPG6yMo1bBsLEavTAqQQqs6rqSNa2aFWEMNCo"}
var HOSTS = {};
var SERVICES = {};

app.post('/apikeys', function (req, res) {
    APIKEYS = {"username": req.body.username, "password": req.body.password};
    res.send(APIKEYS)
});

app.get('/', function (req, res) {
    checkWebHooks()
    res.send({"hosts": HOSTS, "services": SERVICES})
});

app.get('/host', function (req, res) {
    request.get(API_RANCHER + "hosts").then((result) => {
        var hosts_data = {};
        for(var i in result.body.data) {
            var host = result.body.data[i];
            var host_data = {};
            for (label in host.data.fields.labels) {
                if (label.startsWith(PREFIX_LABEL)) {
                    host_data[label] = host.data.fields.labels[label]
                }
            }
            if(Object.keys(host_data).length !== 0) {
                host_data["name"] = host.data.fields.hostname
                host_data["accountId"] = host.accountId
                hosts_data[host.id] = host_data
            }
        }
        HOSTS = hosts_data;
        res.send(HOSTS)
    })
});

app.get('/service', function (req, res) {
    request.get(API_RANCHER + "services").then((result) => {
        var services_data = {}

        for(var i in result.body.data) {
            var service = result.body.data[i]
            var name = service.name
            if(service.description != null) {
                try {
                    service_data = JSON.parse(service.description)
                    service_data["name"] = name
                    service_data["accountId"] = service.accountId
                    services_data[service.id] = service_data
                } catch (e) {

                }
            }
        }
        SERVICES = services_data
        res.send(SERVICES)
    })
});

function checkWebHooks() {
    request.get(API_RANCHER_WEBHOOK + "receivers").query({"projectId": "1a5"}).then((result) => {
        console.log(result.body.data)
    });
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});