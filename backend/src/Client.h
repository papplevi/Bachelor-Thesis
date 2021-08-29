#ifndef CLIENT_H
#define CLIENT_H

#include <QObject>
#include <QWebSocket>
#include <QWebSocketServer>

#include "Database.h"

// Fix circular dependency with forward declaration.
class Daemon;
class Client final : public QObject {

    Q_OBJECT

public:
    Client(QWebSocket *, Daemon* = nullptr);
    ~Client();

private slots:
    void request(const QString &);
    void valuesReceived(const QVariantMap &);

private:
    void handleCommand(const QVariantMap &);

private:
    QWebSocket *mSocket;
    Daemon *mParent;
    Database *mDatabase;


};

#endif // CLIENT_H
