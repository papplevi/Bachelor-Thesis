sap.ui.define([
    'sap/m/Button',
    'sap/m/DisplayListItem',
    'sap/m/List',
    'sap/m/MessageBox'
], function (Button, DisplayListItem, List, MessageBox) {
    "use strict";

    var AuthentificationDialog = sap.m.Dialog.extend("SmartHome.control.AuthentificationDialog", {
        metadata: {
            properties: {
                title: {type: "string", defaultValue: "Autentificare"},
                contentWidth: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "800px"},
                contentHeight: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "600px"},
                escapeHandler : {type: "any", group: "Behavior", defaultValue: function (oPromise) {
                    oPromise.reject();
                }}
            },
            events: {
                select: {
                    parameters: {
                        packages: {type: "string"},
                        version: {type: "string"}
                    }
                },
                cancel: {}
            }
        },
        renderer: {},

        init: function () {
            sap.m.Dialog.prototype.init.apply(this, arguments);

            this.oUser = new sap.m.Label({
                text: "Utilizator",
                labelFor: "inputUser"
            });

            this.oPassword = new sap.m.Label({
                text: "Parolă",
                labelFor: "inputPassword"
            });

            this.oUserInput = new sap.m.Input({
                id: "inputUser",
                type: "Text"
            });

            this.oPasswordInput = new sap.m.Input({
                id: "inputPassword",
                type: "Password"
            });

            this.oSubmitButton = new sap.m.Button({
                text: "Autentificare",
                press: function () {
                    let oMydata = new sap.ui.model.json.JSONModel('./jsons/admin.json');

                    oMydata.attachRequestCompleted(function () {
                        let data = oMydata.getData();
                        
                        if (data.user == this.oUserInput.getValue() ||
                            data.password == this.oPasswordInput.getValue()) {
                                console.log("good password");
                        } else {
                            MessageBox.error("Parolă incorectă!");
                        }

                        // router.navTo("labelEditor", {file: encodedFileName});
                    }.bind(this));
                }.bind(this)
            });

            this.oUserLayout = new sap.ui.layout.VerticalLayout({
                content: [
                    this.oUser,
                    this.oUserInput,
                    this.oSubmitButton
                ]
            });

            this.oPasswordLayout = new sap.ui.layout.VerticalLayout({
                content: [
                    this.oPassword,
                    this.oPasswordInput
                ]
            });

            this.oUserLayout = new sap.ui.layout.HorizontalLayout({
                content: [
                    this.oUserLayout,
                    this.oPasswordLayout
                ]
            }).addStyleClass("authenticateLayout");

            this.addStyleClass("DialogCSS sapUiResponsiveContentPadding");
            this.setEndButton(new Button({
                text: "Close",
                press: this._bClosePress.bind(this)
            }));
            this.addContent(this.oUserLayout);
        }
    });

    /* =========================================================== */
    /*                      begin: public functions                */
    /* =========================================================== */
    AuthentificationDialog.prototype.open = function () {
        this.setTitle(this.getTitle());
        sap.m.Dialog.prototype.open.apply(this, arguments);
    };
    /* =========================================================== */
    /*                      end: public functions                  */
    /* =========================================================== */

    /* =========================================================== */
    /*                      begin: private functions               */
    /* =========================================================== */
    AuthentificationDialog.prototype._bClosePress = function () {
        this.close();
    };
    /* =========================================================== */
    /*                      begin: private functions               */
    /* =========================================================== */

    return AuthentificationDialog;
});