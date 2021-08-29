sap.ui.define([
    'sap/ui/base/Object',
    '../lib/SmartHome'
], function (Object, Embosser) {
    "use strict";

    var initialized = false;
    var gaugeInstance;

    var Gauge = Object.extend("SmartHome.control.Gauge", {
        constructor: function (element, params) {
            this._element = element;
            this._initialValue = params.initialValue;
            this._higherValue = params.higherValue;
            this._title = params.title;
            this._subtitle = params.subtitle;
        },

        buildConfig: function () {
            let element = this._element;

            return {
              value: this._initialValue,
              valueIndicator: {
                color: '#87959f' },

              geometry: {
                startAngle: 180,
                endAngle: 360 },

              scale: {
                startValue: 0,
                endValue: this._higherValue,
                customTicks: [0, 250, 500, 780, 1050, 1300, 1560],
                tick: {
                  length: 8 },

                label: {
                  font: {
                    color: '#87959f',
                    size: 9,
                    family: '"Open Sans", sans-serif' } } },

              title: {
                verticalAlignment: 'bottom',
                text: this._title,
                font: {
                  family: '"Open Sans", sans-serif',
                  color: '#fff',
                  size: 10 },

                subtitle: {
                  text: this._subtitle,
                  font: {
                    family: '"Open Sans", sans-serif',
                    color: '#87959f',
                    weight: 700,
                    size: 28 } } },

              onInitialized: function () {
                let currentGauge = $(element);
                let circle = currentGauge.find('.dxg-spindle-hole').clone();
                let border = currentGauge.find('.dxg-spindle-border').clone();

                currentGauge.find('.dxg-title text').first().attr('y', 48);
                currentGauge.find('.dxg-title text').last().attr('y', 28);
                currentGauge.find('.dxg-value-indicator').append(border, circle);
              }
            };
        }
    });

    Gauge.prototype.initialize = function () {
        // if (initialized) {
        //     return;
        // }
        // initialized = true;

        $(this._element).dxCircularGauge(this.buildConfig());
    };

    return {
        instance: function (element, params) {
            let gaugeInstance = new Gauge(element, params);
            return gaugeInstance;
        }
    };
});