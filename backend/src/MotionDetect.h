#ifndef MOTION_DETECT_H
#define MOTION_DETECT_H

#include <QObject>
#include <QtSerialPort/QSerialPort>
#include <QtSerialPort/QSerialPortInfo>
#include <QDebug>

#include "Database.h"

class MotionDetect : public QObject {

    Q_OBJECT

public:
    explicit MotionDetect(QObject * = nullptr);

private slots:
    void readSerial();

private:
    QSerialPort *arduino;
    QByteArray readData;
};

#endif // MOTION_DETECT_H
