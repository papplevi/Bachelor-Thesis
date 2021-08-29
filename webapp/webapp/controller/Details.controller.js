sap.ui.define([
    'jquery.sap.global',
    "sap/m/MessageBox",
    '../control/HistoricDialog',
    "../controller/BaseController",
    "../lib/Constants",
    "../lib/SmartHome",
    '../control/Gauge'
], function (jQuery, MessageBox, HistoricDialog, BaseController, Constants, SmartHome, Gauge) {
    "use strict";

    var oGauge;

    var oHistoricDialog;

    // Switch
    var oSwichAerConditionat;
    var oSwitchCentrala;
    var oSwitchDezumidificator;

    return BaseController.extend("SmartHome.controller.Details", {
        /**
         * Initializing method to make a connection with the back-end
         * based on our local IP on port 8080 (or the port number we are
         * being listened on by the C++ end of the application)
         * @public
         */
        onInit : function () {
            this.smartHomeInit();
            this.initCharts();
            this.initWeather(document, 'script', 'weatherwidget-io-js');
            this.gaugeInit();
            this.historicDialogInit();
        },

        /**
         * Method for trying to create a connection to the web socket where
         * we communicate with the back-end part of the application on our
         * local IP on port 8080. In case of failure or unexpected closure
         * from the back-end we display a message accordingly.
         * @private
         */
        smartHomeInit: function() {
            // This is mainly used to determine if we should show which error
            // message should be shown.
            this.mSmartHomeConnected = false;

            // Only initialize smartHome and event-handlers once.
            if (this.mSmartHome === undefined) {
                this.mSmartHomeUrl = "//" + window.location.hostname + ":8080";
                this.mSmartHome = SmartHome.instance(this.mSmartHomeUrl);

                this.mSmartHome.attachOpen(function() {
                    this.mSmartHomeConnected = true;
                }, this);
                this.mSmartHome.attachError(function () {
                    if (!this.mSmartHomeConnected) {
                        // this.showError("Connection error", "Failed to connect to smartHome (" + this.mSmartHomeUrl + ").", true);
                    }
                }, this);
                this.mSmartHome.attachClose(function () {
                    if (this.mSmartHomeConnected) {
                        this.showError("Connection error", "Connection unexpectedly closed.", true);
                    }
                }, this);
            }

            oSwichAerConditionat = this.getView().byId("swAerConditionat");
            oSwitchCentrala = this.getView().byId("swCentrala");
            oSwitchDezumidificator = this.getView().byId("swDezumidificator");

            oSwichAerConditionat.attachChange(this.swAerConditionatChange, this);
            oSwitchCentrala.attachChange(this.swCentralaChange, this);
            oSwitchDezumidificator.attachChange(this.swDezumidificatorChange, this);
        },

        bBlinkPress: function () {
            this.mSmartHome.request({
                request: "smarthome.request",
                data: {
                }
            }, function(reply) {
                MessageBox.show("Request successfuly sent");
            }, function(reply) {
                that.showError("Error", reply.result, false);
            });
        },

        initWeather: function (doc, script, id) {
                var js, fjs = doc.getElementsByTagName(script)[0];
                if (!doc.getElementById(id)) {
                    js = doc.createElement(script);
                    js.id = id;
                    js.src = 'https://weatherwidget.io/js/widget.min.js';
                    fjs.parentNode.insertBefore(js, fjs);
                };
        },

        /**
         * Method for generalizing errors with title, message and reload of the page.
         * @private
         * @param {string} title the title of the messagebox
         * @param {string} message the message for the content of the messagebox
         * @param {bool} reconnect refresh the webpage or not
         */
        showError: function(title, message, reconnect) {
            let options = {};

            options.icon = MessageBox.Icon.ERROR;
            options.title = title;

            if (reconnect) {
                options.actions = sap.m.MessageBox.Action.RETRY;
                options.onClose = function () {
                    window.location.reload();
                };
                options.initialFocus = MessageBox.Action.RETRY;
            } else {
                options.actions = sap.m.MessageBox.Action.OK;
                options.initialFocus = MessageBox.Action.OK;
            }

            MessageBox.show(message, options);
        },

        gaugeInit: function () {
            this.mSmartHome.attachMessage(null, function (message) {
                const replyData = JSON.parse(message.getParameter("data"));

                if (replyData.gauge) {
                    $(document).ready(function () {
                        $('.gauge').each(function (index, item) {
                            let params = {
                                initialValue: replyData.gauge.ppm,
                                higherValue: 1560,
                                // title: `Temperature ${index + 1}`,
                                subtitle: 'Calitate aer\nPPM CO2'
                            };

                            oGauge = Gauge.instance(item, params);
                            oGauge.initialize();
                        });
                    });
                }
            });
        },

        historicDialogInit: function () {
            if (oHistoricDialog == null) {
                oHistoricDialog = new HistoricDialog();
            }
        },

        initCharts: function () {
            this.mSmartHome.attachMessage(null, function (message) {
                const replyData = JSON.parse(message.getParameter("data"));

                if (replyData.graphic) {
                    let ambientalValues = replyData.graphic;

                    let time = [];
                    let temperature = [];
                    let humidity = [];

                    for (let data in ambientalValues) {
                        time.push(ambientalValues[data].time);
                        temperature.push(ambientalValues[data].temperature);
                        humidity.push(ambientalValues[data].humidity);
                    }

                    let jsonModel = new sap.ui.model.json.JSONModel({
                            temperature: temperature[temperature.length - 1],
                            humidity: humidity[humidity.length - 1]
                    });
                    this.getOwnerComponent().setModel(jsonModel);

                    this.initInstalations(temperature[temperature.length -1], humidity[humidity.length -1]);

                    var config = {
                        type: 'line',
                        data: {
                            labels: time,
                            datasets: [{
                                label: "Temperatură",
                                backgroundColor: Constants.ChartColors.red,
                                borderColor: Constants.ChartColors.red,
                                data: temperature,
                                fill: false,
                            }, {
                                label: 'Umiditate',
                                fill: false,
                                backgroundColor: Constants.ChartColors.blue,
                                borderColor: Constants.ChartColors.blue,
                                data: humidity
                            }]
                        },
                        options: {
                            responsive: true,
                            title: {
                                display: true,
                                text: 'Temperatură și umiditate'
                            },
                            tooltips: {
                                mode: 'index',
                                intersect: false,
                            },
                            hover: {
                                mode: 'nearest',
                                intersect: true
                            },
                            scales: {
                                xAxes: [{
                                    display: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Oră'
                                    }
                                }],
                                yAxes: [{
                                    display: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Valoare'
                                    },
                                    ticks: {
                                        beginAtZero: true,
                                        max: 50
                                    }
                                }]
                            }
                        }
                    };
                    var ctx = document.getElementById('myChart').getContext('2d');
                    window.myLine = new Chart(ctx, config);
                }
            }.bind(this));
        },

        initInstalations: function (temperature, humidity) {
            if (temperature >= 21) {
                oSwichAerConditionat.setState(true);
                oSwitchCentrala.setState(false);
            } else {
                oSwichAerConditionat.setState(false);
                oSwitchCentrala.setState(true);
            }

            if (humidity >= 50) {
                oSwitchDezumidificator.setState(true);
            } else {
                oSwitchDezumidificator.setState(false);
            }
        },

        bIstoricPress: function () {
            this.mSmartHome.request({
                request: "istoric",
                data: {
                    // cnp: cnp,
                }
            }, function(reply) {
                console.log(reply);
                MessageBox.show("History successfuly arrived");
            }, function(reply) {
                that.showError("Error", reply.result, false);
            });

            this.mSmartHome.attachMessage(null, function (message) {
                const replyData = JSON.parse(message.getParameter("data"));
                oHistoricDialog.open(replyData.historic);
            });
        },

        swAerConditionatChange: function () {
        },

        swCentralaChange: function () {

        },

        swDezumidificatorChange: function () {

        }
    });
});