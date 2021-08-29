sap.ui.define([
    "sap/m/MessageBox",
    "../controller/BaseController",
    "../lib/SmartHome"
], function (MessageBox, BaseController, SmartHome) {
    "use strict";

    var oSmartHome;

    // Inputs
    var oName, oEmail, oPhoneNr, oMessage;

    return BaseController.extend("SmartHome.controller.Contact", {

        onInit : function () {
            oSmartHome = SmartHome.instance();

            oName = this.getView().byId("inputName");
            oEmail = this.getView().byId("inputEmail");
            oPhoneNr = this.getView().byId("inputTel");
            oMessage = this.getView().byId("tAMessage");
            // sap.ui.getCore().loadLibrary("openui5.googlemaps", "../openui5/googlemaps/");
        },

        bSendPress: function () {
            if (oName.getValue() == 0 ||
                oEmail.getValue() == 0 ||
                oPhoneNr.getValue() == 0 ||
                oMessage.getValue() == 0) {
                    MessageBox.warning("Toate câmpurile sunt obligatorii!");

                return;
            }

            oSmartHome.request({
                request: "sendContact",
                data: {
                    name: oName.getValue(),
                    email: oEmail.getValue(),
                    phoneNr: oPhoneNr.getValue(),
                    message: oMessage.getValue()
                }
            }, function(reply) {
                console.log(reply);
                MessageBox.show("Message successfuly sent");
            }, function(reply) {
                console.log(reply);
                that.showError("Error", reply.result, false);
            });

            MessageBox.information("Mesaj trimis cu succes!");
        },

        handleTelLiveChange: function () {
            let phone = oPhoneNr.getValue();

            if (phone.length > 10) {
                let newValue = phone.slice(0, 10);

                oPhoneNr.setValue(newValue);
            }
        }
    });
});