#ifndef AMBIENTAL_PARAMETERS_H
#define AMBIENTAL_PARAMETERS_H

#include <QObject>
#include <QtSerialPort/QSerialPort>
#include <QtSerialPort/QSerialPortInfo>
#include <QDebug>

#include "Database.h"

class AmbientalParameters : public QObject {

    Q_OBJECT

public:
    explicit AmbientalParameters(QObject * = nullptr);

private slots:
    void readSerial();

private:
    QSerialPort *arduino;
    QByteArray readData;
    Database *mDatabase;
};

#endif // AMBIENTAL_PARAMETERS_H
