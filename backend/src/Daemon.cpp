#include <QCoreApplication>
#include <QJsonDocument>
#include <QLoggingCategory>

#include "Client.h"
#include "Daemon.h"

static QLoggingCategory logDaemon("Daemon", QtCriticalMsg);

/**
    Create a daemon to listen on port 8080. Initialize the
    websocket as nullptr and wait for someone to connect to it.
*/

Daemon::Daemon(QObject *parent)
    : QObject(parent), mPort(8080), mWebSocket(nullptr)
{
    mDatabase = Database::Instance();
    qCDebug(logDaemon) << "Daemon started on port:" << mPort;

    connect(this, &Daemon::newConnection, mDatabase,
            &Database::newConnection); // new client, sending data for render.
}

/**
    Returns the number of port opened for listening to new clients.

    @return Returns the number of port we're listening on.
*/

int Daemon::port() const
{
    return mPort;
}

/**
    Changes the current port number to another one.

    @param  port The number of the port we want to open.
*/

void Daemon::setPort(int port)
{
    mPort = port;
}

/**
    Start the daemon to listen on the given port.
*/

void Daemon::start()
{
    if (mWebSocket) {
        qCCritical(logDaemon)
            << "Daemon is already started, internal error?";
        return;
    }

    // replace with app name
    mWebSocket =
        new QWebSocketServer("backendApp", QWebSocketServer::NonSecureMode, this);

    connect(mWebSocket, &QWebSocketServer::closed, []() {
        qCDebug(logDaemon) << "QWebSocket closed.";
        QCoreApplication::instance()->quit();
    });

    connect(mWebSocket, &QWebSocketServer::acceptError,
            [](const QAbstractSocket::SocketError socketError) {
                qCWarning(logDaemon)
                    << "Unable to accept connection:" << socketError;
            });

    connect(mWebSocket, &QWebSocketServer::serverError,
            [](const QWebSocketProtocol::CloseCode closeCode) {
                qCWarning(logDaemon) << "Protocol error:"
                                                    << closeCode;
            });

    connect(mWebSocket, &QWebSocketServer::newConnection, this,
            &Daemon::clientConnected); // new client

    if (!mWebSocket->listen(QHostAddress::Any, mPort)) {
        qCCritical(logDaemon) << "Failed to listen to port"
                                             << mPort;
        QCoreApplication::instance()->exit(EXIT_FAILURE);
    }
}

/**
    Create a socket for the new client which has connected to us
    on the opened port.
*/

void Daemon::clientConnected()
{
    qCDebug(logDaemon) << "New client connected!";
    auto socket = mWebSocket->nextPendingConnection();
    if (socket) {
        new Client(socket, this);
    }

    emit newConnection();
}
