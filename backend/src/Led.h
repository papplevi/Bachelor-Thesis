#ifndef LED_H
#define LED_H

#include <QObject>
#include <QtSerialPort/QSerialPort>
#include <QtSerialPort/QSerialPortInfo>
#include <QDebug>

class Led : public QObject {

    Q_OBJECT

public:
    explicit Led(QObject * = nullptr);

    void blink() const;
};

#endif // LED_H
