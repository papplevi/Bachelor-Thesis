#include <QtCore/QDebug>
#include <QLoggingCategory>

#include <QString>
#include "AmbientalParameters.h"

static QLoggingCategory logAmbientalParameters("AmbientalParameters", QtCriticalMsg);

AmbientalParameters::AmbientalParameters(QObject *parent) : QObject(parent)
{
    qCDebug(logAmbientalParameters) << "INITIALIZING AMBIENTAL PARAMETER SENSORS";

    mDatabase = Database::Instance();

    arduino = new QSerialPort(this);

    arduino->setPortName("ttyACM0");
    arduino->open(QSerialPort::ReadOnly);
    arduino->setBaudRate(QSerialPort::Baud9600);
    arduino->setDataBits(QSerialPort::Data8);
    arduino->setFlowControl(QSerialPort::NoFlowControl);
    arduino->setParity(QSerialPort::NoParity);
    arduino->setStopBits(QSerialPort::OneStop);
    connect(arduino, SIGNAL(readyRead()), this, SLOT(readSerial()));
}

void AmbientalParameters::readSerial()
{
    // Start reading from arduino.
    readData = arduino->readAll();

    // Wait for all data arriving.
    while (arduino->waitForReadyRead(500)) {
        readData.append(arduino->readAll());
    }

    if (arduino->error() == QSerialPort::ReadError) {
        qCritical(logAmbientalParameters) << QObject::tr("Failed to read from port %1, error: %2")
                                    .arg("ttyACM0").arg(arduino->errorString()) << endl;
    } else if (arduino->error() == QSerialPort::TimeoutError && readData.isEmpty()) {
        qCritical(logAmbientalParameters) << QObject::tr("No data was currently available"
                                      " for reading from port %1")
                                    .arg("ttyACM0") << endl;
    }
    QStringList buffer_split = QString::fromStdString(readData.toStdString()).split(",");

    //  Check if all values have arrived correctly.
    if (buffer_split.length() == 4) {
        // qDebug () << buffer_split;
        // Check the values integrity.
        if ((buffer_split[0].length() == 5) && (buffer_split[1].length() == 5)
            && (buffer_split[2].length() == 6) && (buffer_split[3].length() == 6)) {
            // mDatabase->addEnvironmentValues(buffer_split[0], buffer_split[1]);
            mDatabase->co2PPM(buffer_split[2], buffer_split[3]);
            // qCDebug(logAmbientalParameters) << "Inserting data";
        }
    }
}