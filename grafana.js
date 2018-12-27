const defaults = require('superagent-defaults');
var dashboard_json = require('./ScaleMonitoring');
const panel_template = require("./PanelTemplate")

var URL_API_GRAFANA = "http://192.168.99.100:3000/api/";
var TOKEN = "eyJrIjoiNk9DbEQ0YXNHbWRwQ29wTHNuRjU1NG84NjdySldHaW4iLCJuIjoic2NhbGUtc2VydmljZSIsImlkIjoxfQ=="

var WEBHOOK_SERVICE
var NOTIFICATION_CHANNEL_ID
const NOTIFICATION_NAME = "scale-service-notification"
const DASHBOARD_UID = "scaledashboard"


const request = defaults();
request.set("Authorization", "Bearer " + TOKEN);


module.exports = {

    setWebhookURL: function (url) {
        WEBHOOK_SERVICE = url
    },

    setGrafanaAPI: function (url) {
        URL_API_GRAFANA= url
    },

    setGrafanaTOKEN: function (t) {
        TOKEN= t
    },

    createAlert: function (service, metric, threshould, callback, error) {
        checkNotificationChannel((r => {
            checkDashboard((r2 => {
                var new_dashboard = JSON.parse(JSON.stringify(r2))
                var panels = new_dashboard["panels"];
                if(panels == undefined) {
                    new_dashboard["panels"] = [];
                    panels = new_dashboard["panels"];
                }
                var new_panel = createPanelAndAlert(service, metric, threshould)
                new_panel.id = panels.length + 1
                panels.push(new_panel);
                createOrUpdateDashboard(new_dashboard, callback, error)
            }))
        }));
    },

    createAlerts: function (alerts, callback, error) {
        checkNotificationChannel((r => {
            checkDashboard((r2 => {
                var new_dashboard = JSON.parse(JSON.stringify(r2))
                var panels = new_dashboard["panels"];
                if(panels == undefined) {
                    new_dashboard["panels"] = [];
                    panels = new_dashboard["panels"];
                }
                for(var i in alerts){
                    var alert = alerts[i]
                    var new_panel = createPanelAndAlert(alert.service, alert.metric, alert.threshould)
                    new_panel.id = panels.length + 1
                    panels.push(new_panel);
                }
                createOrUpdateDashboard(new_dashboard, callback, error)
            }))
        }));
    },
    
    getAlerts: function (callback) {
        checkDashboard((result) => {
            alerts = []
            for (var i in result.panels){
                var panel = result.panels[i]
                alerts.push({"service": panel.alert.name, "metric": panel.targets[0].measurement, "threshould": panel.thresholds[0].value})
            }
            if(callback){callback(alerts)}
        })
    }
};

var getDashboard = function (callback, error) {
    request.get(URL_API_GRAFANA + "dashboards/uid/" + DASHBOARD_UID).then((result) => {
        dashboard_json = result.body.dashboard
        if(callback){callback(dashboard_json)}

    }).catch(err => {
        if(error){error(err)}
    });
};

var createOrUpdateDashboard = function (dashboard,callback, error) {
    request.post(URL_API_GRAFANA + "dashboards/db").send({"dashboard": dashboard}).then((result) => {
        dashboard_json = result.body
        if(callback){callback(dashboard_json)}
    }).catch(err => {
        if(error) {error(err)}
    });
};

var checkDashboard = function (callback) {
    if(dashboard_json.id == undefined) {
        getDashboard(callback, (error) => {
            dashboard_json["uid"] = DASHBOARD_UID
            createOrUpdateDashboard(dashboard_json, callback)
        });
    }else{
        callback(dashboard_json)
    }
};

var getNotificationChannel = function (callback) {
    request.get(URL_API_GRAFANA + "alert-notifications").then((result) => {
        for (i in result.body){
            var notification = result.body[i]
            if(notification.name == NOTIFICATION_NAME){
                NOTIFICATION_CHANNEL_ID = notification.id;
                break
            }
        }
        if(callback) {
            callback(NOTIFICATION_CHANNEL_ID)
        }
    });
};

var createNotificationChannel = function (callback) {

    var notification = {
        "name": NOTIFICATION_NAME,  //Required
        "type":  "webhook", //Required
        "disableResolveMessage": true,
        "settings": {
            "autoResolve": true,
            "httpMethod": 'POST',
            "uploadImage": false,
            "url": WEBHOOK_SERVICE }
        };

    request.post(URL_API_GRAFANA + "alert-notifications").send(notification).then((result) => {

        NOTIFICATION_CHANNEL_ID = result.body.id;

        if(callback) {
            callback(NOTIFICATION_CHANNEL_ID)
        }
    });
};

var checkNotificationChannel = function (callback) {
    if(NOTIFICATION_CHANNEL_ID == undefined) {
        getNotificationChannel((result) => {
            if (result == undefined) {
                createNotificationChannel(callback)
            } else {
                if (callback) {
                    callback(result)
                }
            }
        });
    }else{
        callback(NOTIFICATION_CHANNEL_ID)
    }
};


var createPanelAndAlert = function (service_name, metric,threshould, ) {
    var new_panel = JSON.parse(JSON.stringify(panel_template))
    var title = metric + "(" + service_name + ")"

    new_panel.alert.conditions[0].evaluator.params = [threshould]
    new_panel.alert.name = service_name
    new_panel.alert.notifications[0]["id"] = NOTIFICATION_CHANNEL_ID
    new_panel.targets[0].alias = title
    new_panel.targets[0].measurement = metric
    new_panel.targets[0].tags[0].value = service_name
    new_panel.thresholds[0].value = threshould
    new_panel.title = title

    return new_panel;
};

