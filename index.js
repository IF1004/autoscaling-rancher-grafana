var grafana = require('./grafana')
var express = require('express');
const request = require('superagent');
var app = express();
app.use(express.json())

const URL_API_RANCHER = "http://192.168.99.100:8080/";
const URL_API_RANCHER_V1 = URL_API_RANCHER + "v1/";
const URL_API_RANCHER_V2 = URL_API_RANCHER + "v2-beta/";
const API_RANCHER = URL_API_RANCHER_V1;
const API_RANCHER_WEBHOOK = URL_API_RANCHER + "v1-webhooks/";


const PREFIX_LABEL = "scale.";
var APIKEYS = {"username": "AA75F2821934A0510E37", "password": "znkdPG6yMo1bBsLEavTAqQQqs6rqSNa2aFWEMNCo"}
var CONFIG = {"domain": "http://10.0.2.2:3000"}
var HOSTS = {};
var SERVICES = {};
var WEBHOOKS = {};
var ALERTS = [];
var STACKS = {}

grafana.setWebhookURL(CONFIG["domain"] + "/webhook");


app.post('/apikeys', function (req, res) {
    APIKEYS = {"username": req.body.username, "password": req.body.password};
    res.send(APIKEYS)
});

app.post('/config', function (req, res) {
    CONFIG = req.body
    grafana.setWebhookURL(CONFIG["domain"] + "/webhook");
    res.send(CONFIG)
});

app.get('/', function (req, res) {
    res.send({"stacks": STACKS, "services": SERVICES, "webhooks": WEBHOOKS})
});

app.get('/update', function (req, res) {
    stackUpdate((r1) => {
        serviceUpdate((r2) => {
            webHookUpdate();
            alertsUpdate();
        })
    })
    res.send()
});

app.get('/webhook', function (req, res) {
    res.send(WEBHOOKS)
});

app.post('/webhook', function (req, res) {
    var ruleName = req.body.ruleName.split("/")
    var stack_name = ruleName[0]
    var service_name = ruleName[1]
    for(var s in SERVICES) {
        var service = SERVICES[s]
        if(service["name"] == service_name && STACKS[service["stack"]] == stack_name) {
            request.post(WEBHOOKS[s])
        }
    }
    res.send()
});

app.get('/webhook/update', function (req, res) {
    webHookUpdate()
    res.send()
});

/*
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
*/

app.get('/service', function (req, res) {
    var response = JSON.parse(JSON.stringify(SERVICES))
    for(var s in SERVICES) {
        response[s]["stack"] = STACKS[response[s]["stack"]]
        response[s]["url"] = WEBHOOKS[s]
    }
    res.send(response)
});

app.get('/service/update', function (req, res) {
    serviceUpdate((result => {
        res.send(result)
    }))
});

app.get('/stack', function (req, res) {
    res.send(STACKS)
});

app.get('/stack/update', function (req, res) {
    stackUpdate((result) => {
        res.send(result)
    })
});

function serviceUpdate(callback) {
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
                    service_data["stack"] = service.environmentId
                    services_data[service.id] = service_data
                } catch (e) {

                }
            }
        }
        SERVICES = services_data;
        if(callback){callback(SERVICES)}
    })
}

function stackUpdate(callback) {
    request.get(API_RANCHER + "environment").then((result) => {
        var stacks_data = {}

        for(var i in result.body.data) {
            var stack = result.body.data[i]
            stacks_data[stack.id] = stack.name
        }
        STACKS = stacks_data;
        if(callback){callback(STACKS)}
    })
}

function webHookUpdate() {
    request.get(API_RANCHER_WEBHOOK + "receivers").query({"projectId": "1a5"}).then((result) => {
        //console.log(result.body.data)
        WEBHOOKS = {}
        for(var i in result.body.data) {
            var webhook = result.body.data[i]

            if(webhook.driver == "scaleService"){
                WEBHOOKS[webhook.scaleServiceConfig.serviceId] = webhook.url
            }
        }

        for (var s in SERVICES) {
            var service = SERVICES[s]
            if(!(s in WEBHOOKS)) {
                // CREATE
                var data = {"driver": "scaleService", "name": "scale.service."+service["name"], "scaleServiceConfig": {
                    "action": "up",
                    "amount": service["scale.up"],
                    "max": 100,
                    "min": 1,
                    "serviceId": s,
                    "type": "scaleService",
                }}
                request.post(API_RANCHER_WEBHOOK + "receivers").query({"projectId": "1a5"}).send(data).then((result) => {
                    WEBHOOKS[result.body.scaleServiceConfig.serviceId] = result.body.url
                });
            }
        }

    });
}

function alertsUpdate(){
    grafana.getAlerts((result) => {
        ALERTS = result
        var new_alerts = []

        for(var s in SERVICES) {
            var service = SERVICES[s]
            var stack_service_name = STACKS[service["stack"]] + "/" + service["name"]

            var create = true
            for(var i in ALERTS) {
                var alert = ALERTS[i]
                if(alert.service == stack_service_name) {
                    create = false;
                    break;
                }
            }

            if(create) {
                new_alerts.push({"service": stack_service_name, "metric":"cpu_usage_total" , "threshould": service["scale.up.cpu"]})
            }
        }

        if(new_alerts.length > 0) {
            grafana.createAlerts(new_alerts, (result) => {
                console.log(result)
            }, error => {
                console.log(error)
            })
        }

    });
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});