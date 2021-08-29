#include <QtCore/QDebug>
#include <QLoggingCategory>

#include "Led.h"

static QLoggingCategory logLed("Led", QtCriticalMsg);

Led::Led(QObject *parent) : QObject(parent)
{
}

void Led::blink() const
{
    // Initialize Serial
    QSerialPort serial;
    serial.setPortName("ttyACM0");
    serial.open(QIODevice::ReadWrite);
    serial.setBaudRate(QSerialPort::Baud9600);
    serial.setDataBits(QSerialPort::Data8);
    serial.setParity(QSerialPort::NoParity);
    serial.setStopBits(QSerialPort::OneStop);
    serial.setFlowControl(QSerialPort::NoFlowControl);

    if (serial.isOpen() && serial.isWritable()) {
        QByteArray ba("R");
        serial.write(ba);
        serial.flush();
        qDebug() << "data has been send" << endl;
        serial.close();
    } else {
        qDebug() << "An error occured" << endl;
    }
}
