sap.ui.define([
    'sap/ui/core/UIComponent',
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/MessageBox",
    'sap/m/MessageToast',
    "sap/m/Text",
    '../control/AuthentificationDialog',
    "../controller/BaseController"
], function (UIComponent, Button, Dialog, MessageBox, MessageToast, Text, AuthentificationDialog, BaseController) {
    "use strict";

    // About buttons.
    var aboutPappLeventeButton;
    var qtFrameworkButton;
    var openUI5FrameworkButton;

    // Search filter
    var iSearchFilter;

    // Rooms
    var oBedroom;
    var oBedroomImage;
    var oLiving;
    var oKitchen;

    // Temperature & Humidity
    var oHumidity;
    var oTemperature;

    // Bulb
    var oBulb;

    // Authentification Dialog
    var oAuthentificationDialog;

    return BaseController.extend("SmartHome.controller.App", {

        /**
         * Initializing method for displaying a welcome message
         * @public
         */
        onInit : function () {
            aboutPappLeventeButton = this.getView().byId("bPappLevente");
            qtFrameworkButton = this.getView().byId("bQtFramework");
            openUI5FrameworkButton = this.getView().byId("bOpenUI5Framework");

            oBulb = this.getView().byId("bBulb");

            iSearchFilter = this.getView().byId("inputSearch");

            this.showWelcomeMessage();
            this.initNavValues();
            this.initAboutButtons();
            this.initRooms();
            this.authentificationDialogInit();
        },

        /**
         * MessageBox with a welcome message for the user
         * with the option to close the opened dialog.
         * @private
         */

        initNavValues: function () {
            oTemperature = this.getView().byId("lblTemperature");
            oHumidity = this.getView().byId("lblHumidity");

            setTimeout(function () {
                let ambientalValues = this.getOwnerComponent().getModel();
                let temperature = ambientalValues.getProperty("/temperature");
                let humidity = ambientalValues.getProperty("/humidity");

                oTemperature.setText("Temperatură: " + temperature + " °C");
                oHumidity.setText("Umiditate: " + humidity + " %");
            }.bind(this), 1500);
        },

        initRooms: function () {
            oBedroom = this.getView().byId("vBedroom");
            oLiving = this.getView().byId("vLiving");
            oKitchen = this.getView().byId("vKitchen");

            oBedroomImage = this.getView().byId("iBedroom");

            oBedroomImage.attachPress(function () {
                console.log("Pressed the image");
            });
        },

        initAboutButtons: function () {
            aboutPappLeventeButton.attachPress(function () {
                var oDialog = new Dialog({
                    title: 'Despre mine',
                    type: 'Message',
                    content: new Text({
                        text: 'Bună ziua\n' +
                              "Mă numesc Papp Levente, am 23 de ani și sunt student în anul terminal (4) la profilul " +
                              "A.I.A (Automatică și Informatică Aplicată).\n" +
                              "De un an jumate lucrez ca dezvoltator software în Arad.\n\n" +
                              "Ce limbaje de programare folosesc?\n" +
                              "• C++, framework-ul Qt 5.14;\n" +
                              "• JavaScript, framework-ul OpenUI5 1.52.9;\n" +
                              "• HTML5 și CSS;\n" +
                              "• Bash & Shell;\n" +
                              "• Configurații Linux Low-Level;\n\n" +
                              "Ce cunoștințe am în alte tehnologii?\n" +
                              "• Baze de date atât in Microsoft Access cât și în phpMyAdmin, MariaDB etc.\n" +
                              "• Cunoștințe de configurare și montare dispozitive hardware (Raspberry Pi, Arduino etc.)"
                    }),
                    beginButton: new Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: 'OK',
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });
    
                oDialog.open();
            });

            qtFrameworkButton.attachPress(function () {
                const qtUrl = "https://doc.qt.io/";
                window.open(qtUrl, "_blank");
            });

            openUI5FrameworkButton.attachPress(function () {
                const openUI5Url = "https://openui5.org/";
                window.open(openUI5Url, "_blank");
            });
        },

        authentificationDialogInit: function () {
            if (oAuthentificationDialog == null) {
                oAuthentificationDialog = new AuthentificationDialog();
            }
        },

        onFilterSearch: function () {
            let filter = iSearchFilter.getValue().toLowerCase();

            if (filter.length < 3) {
                oBedroom.setVisible(true);
                oLiving.setVisible(true);
                oKitchen.setVisible(true);

                return;
            }

            if (filter.startsWith("dor")) {
                oKitchen.setVisible(false);
                oLiving.setVisible(false);
            } else if (filter.startsWith("buc")) {
                oBedroom.setVisible(false);
                oLiving.setVisible(false);
            } else if (filter.startsWith("liv")) {
                oBedroom.setVisible(false);
                oKitchen.setVisible(false);
            } else {
                oBedroom.setVisible(false);
                oKitchen.setVisible(false);
                oLiving.setVisible(false);
            }

        },

        bHomePress: function () {
            let router = UIComponent.getRouterFor(this);
            router.navTo("details");
        },

        bBulbPress: function () {
            let bulbOff = "sap-icon://lightbulb";
            let bulbOn = "res/bulbOn.png";
            let currentIcon = oBulb.getIcon();

            if (currentIcon == bulbOn) {
                let event = new CustomEvent("changeLight", { detail: "off" });

                MessageToast.show("Becul a fost stins!");
                window.dispatchEvent(event);
                oBulb.setIcon(bulbOff);
            } else {
                let event = new CustomEvent("changeLight", { detail: "on" });

                MessageToast.show("Becul a fost aprins!");
                window.dispatchEvent(event);
                oBulb.setIcon(bulbOn);
            }
        },

        bContactPress: function () {
            let router = UIComponent.getRouterFor(this);

            router.navTo("contact");
        },

        bAdminPress: function () {
            oAuthentificationDialog.open();
        },

        showWelcomeMessage: function() {
            let options = {};

            options.icon = MessageBox.Icon.INFORMATION;
            options.title = "Welcome";
            options.actions = sap.m.MessageBox.Action.OK;
            options.initialFocus = MessageBox.Action.OK;

            // MessageBox.show("Welcome to Levi's SmartHome application!", options);
        }
    });
});