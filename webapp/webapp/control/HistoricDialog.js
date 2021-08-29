sap.ui.define([
    'sap/m/Button',
    'sap/m/DisplayListItem',
    'sap/m/List'
], function (Button, DisplayListItem, List) {
    "use strict";

    var HistoricDialog = sap.m.Dialog.extend("SmartHome.control.HistoricLog", {
        metadata: {
            properties: {
                title: {type: "string", defaultValue: "Parametri ambientali"},
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

            this.oListRecords = new List({
                includeItemInSelection: false
            });

            this.addStyleClass("DialogCSS sapUiResponsiveContentPadding");
            this.setEndButton(new Button({
                text: "Close",
                press: this._bClosePress.bind(this)
            }));
            this.addContent(this.oListRecords);
        }
    });

    /* =========================================================== */
    /*                      begin: public functions                */
    /* =========================================================== */
    HistoricDialog.prototype.open = function (historic) {
        if (historic) {
            this.oListRecords.destroyItems();
            for (let record in historic) {
                this.oListRecords.addItem(new DisplayListItem({
                    label: "10.05.2020 / " + historic[record].time,
                    value: "Temperature: " + historic[record].temperature +
                            " / Humidity: "  + historic[record].humidity,
                }));
            }
        }

        this.setTitle(this.getTitle());
        sap.m.Dialog.prototype.open.apply(this, arguments);
    };
    /* =========================================================== */
    /*                      end: public functions                  */
    /* =========================================================== */

    /* =========================================================== */
    /*                      begin: private functions               */
    /* =========================================================== */
    HistoricDialog.prototype._bClosePress = function () {
        this.close();
    };
    /* =========================================================== */
    /*                      begin: private functions               */
    /* =========================================================== */

    return HistoricDialog;
});