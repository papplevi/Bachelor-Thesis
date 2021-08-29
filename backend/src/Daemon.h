#ifndef DAEMON_H
#define DAEMON_H

#include <QObject>
#include <QWebSocketServer>
#include "Database.h"

class Daemon : public QObject {

    Q_OBJECT

public:
    explicit Daemon(QObject * = nullptr);

    int port() const;
    void setPort(int);

public slots:
    void start();

private slots:
    void clientConnected();

private:
    int mPort;
    QWebSocketServer *mWebSocket;
    Database *mDatabase;

signals:
    void newConnection();
};

#endif // DAEMON_H
