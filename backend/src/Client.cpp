#include <QDebug>
#include <QJsonObject>
#include <QJsonDocument>
#include <QLoggingCategory>
#include <QVariantMap>

#include "Client.h"
#include "Daemon.h"
#include "Led.h"

static QLoggingCategory logClient("Client", QtCriticalMsg);

static const auto dataKey = QStringLiteral("data");
static const auto requestKey = QStringLiteral("request");

static const auto temperatureKey = QStringLiteral("temperature");
static const auto humidityKey = QStringLiteral("humidity");

/**
    Create a new instance for the newly connected client.
    Also create a new thread on the smartHOme to keep up
    the circularity.
*/

Client::Client(QWebSocket *socket, Daemon *parent)
    : QObject(parent), mSocket(socket)
{
    mSocket->setParent(this);
    mParent = parent;

    mDatabase = Database::Instance();

    qCDebug(logClient) << "Client created:" << socket->peerAddress()
                       << "Port" << socket->peerPort();

    connect(mSocket, &QWebSocket::disconnected, [=]() {
        qCDebug(logClient) << "Client disconnected:" << socket->peerAddress()
                           << "Port" << socket->peerPort();
        deleteLater();
    });

    connect(mSocket, &QWebSocket::textMessageReceived, this, &Client::request); // here's the received message via webapp
    connect(mDatabase, &Database::valuesReceived, this, &Client::valuesReceived); // here's the received message via webapp
}

/**
    Destroy the previous client and stop their thread.
*/

Client::~Client()
{
    qCDebug(logClient) << "Client destroyed.";
}

/**
    Returns the index of the last block.

    @param  dataIn Get the request and the data it holds through the
            websocket and validate it progressively.
*/

void Client::request(const QString &dataIn)
{
    const auto document = QJsonDocument::fromJson(dataIn.toUtf8());
    if (!document.isObject()) {
        qCCritical(logClient) << "Request is not an object:" << dataIn;
        mSocket->close(QWebSocketProtocol::CloseCodeDatatypeNotSupported);
        return;
    }

    qCDebug(logClient).noquote() << "request:"
                                 << QString::fromUtf8(document.toJson());

    const auto request = document.object().value("request");
    auto data = document.object().value("data").toObject();

    if (request == "graph") {
        mDatabase->initGraph();
    } else if (request == "istoric") {
        mDatabase->sendHistoric();
    } else if (request == "sendContact") {
        auto name  = data.value("name").toString();
        auto email = data.value("email").toString();
        auto phoneNr = data.value("phoneNr").toString();
        auto message = data.value("message").toString();

        mDatabase->sendContact(name, email, phoneNr, message);
    } else if (request == "credentials") {
        mDatabase->sendCredentials();
    } else if (request == "testAmbientalData") {
        auto humidity = data.value(humidityKey).toString();
        auto temperature = data.value(temperatureKey).toString();

        mDatabase->registerAmbientalTestData(humidity, temperature);
    } else if (request == "contactMessages") {
        mDatabase->getContactMessages();
    } else if (request == "sendAlert") {
        mDatabase->sendMail();
    }
}

/**
    Send through the websocket the result for the received request.

    @param  result QVariantMap containing the result for the
            request received.
*/

void Client::valuesReceived(const QVariantMap &result)
{
    // Reply to the webapp
    if (mSocket) {
        const auto object = QJsonObject::fromVariantMap(result);
        const auto document = QJsonDocument(object);
        mSocket->sendTextMessage(
            QString(document.toJson(QJsonDocument::Compact)));
    }
}
