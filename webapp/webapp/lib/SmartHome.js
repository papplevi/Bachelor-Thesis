sap.ui.define([
    'sap/ui/core/ws/WebSocket'
], function (WebSocket) {
    "use strict";

    var smartHomeInstance = null;

    var SmartHome = WebSocket.extend("SmartHome.lib.SmartHome", {
        /**
         * Method for connecting to the websocket based on given
         * arguments (localIP:portToListenOn)
         * @private
         */
        constructor: function () {
            WebSocket.apply(this, arguments);

            this.requests = {};
            this.requestIdCounter = 0;

            this.attachMessage(null, function (message) {
                // Here we catch the reply
                let reply = JSON.parse(message.getParameter("data"));

                // Ensure that this is a known id...
                if (!this.requests.hasOwnProperty(reply.id)) {
                    return;
                }

                let delRequest = true;

                // Call the appropriate callback and delete the request.
                if (reply.status === "success") {
                    this.requests[reply.id].success(reply);
                } else if (reply.status === "progress") {
                    this.requests[reply.id].progress(reply);
                    delRequest = false;
                } else {
                    this.requests[reply.id].failure(reply);
                }
                if (delRequest) {
                    delete this.requests[reply.id];
                }
            }, this);
        }
    });

    /**
     * Method for checking if the current connection is alive.
     * @public
     * @returns {sap.ui.core.ws.WebSocket} the open state of the web socket
     */
    SmartHome.prototype.isConnectionAlive = function() {
        return this.getReadyState() === sap.ui.core.ws.ReadyState.OPEN;
    };

    /**
     * Method for sending a new request to be processed on the back-end.
     * @public
     * @param {string} data the string data to be sent to the back-end
     * @param {function} success the function to be appealed on success
     * @param {function} failure the function to be appealed on failure
     * @param {function} progress the function to be appealed during progress
     * @returns {Object} return ourself, for chaining
     */
    SmartHome.prototype.request = function(data, success, failure, progress) {
        const requestId = ++this.requestIdCounter;

        // Send the data (as a string)
        data.id = requestId;
        this.send(JSON.stringify(data));

        // Place the request in the list of requests.
        this.requests[requestId] = {request: data, success: success, failure: failure, progress: progress};

        // Return ourself, for chaining.
        return this;
    };

    /**
     * Method to send the data as a JSON/string to the back-end.
     * @public
     * @param {string} stringData the JSON/string data to be sent to the back-end
     * @returns {Object} return ourself, for chaining
     */
    SmartHome.prototype.sendData = function(stringData) {
        this.send(stringData);

        return this;
    };

    return {
        /**
         * Method for returning the same instance for this class.
         * @public
         * @returns {SmartHome} the instance of the class
         */
        instance: function () {
            if (smartHomeInstance == null) {
                // We need a null-argument as this...
                Array.prototype.unshift.call(arguments, null);
                smartHomeInstance = new (Function.prototype.bind.apply(SmartHome, arguments))();
            }
            return smartHomeInstance;
        }
    };
});
