#include <QDebug>
#include <QLoggingCategory>

#include <QDateTime>
// Database libraries
#include <QSqlDatabase>
#include <QSqlQuery>
#include <QSqlError>

#include "Database.h"
#include "MailClient.h"

static QLoggingCategory logDatabase("Database", QtCriticalMsg);

static auto alertMessage = QStringLiteral("Alertă! Valorile citite de senzorul de gaz au depăsit pragul.");
static const auto usernameKey = QStringLiteral("username");
static const auto receiverKey = QStringLiteral("receiver");
static const auto subjectKey = QStringLiteral("subject");

/**
    Create the connection to the database with the credentials.
*/
Database* Database::mDatabaseInstance = nullptr;

Database::Database()
{
    counter = 0;

    // Could be a good  idea not to store these hardcoded...
    QSqlDatabase db = QSqlDatabase::addDatabase("QMYSQL");
    db.setHostName("localhost");
    db.setUserName("root");
    db.setPassword("password");
    db.setDatabaseName("temperature");

    if (!db.open()) {
        qCCritical(logDatabase) << "Failed to open the database!";
    }

    qCDebug(logDatabase) << "The database connection has been successfully established!";

    initGraph();
}

bool Database::addEnvironmentValues(const QString &humidity, const QString &temperature)
{
    QSqlQuery insertQuery;
    QVariantMap reply;
    QString currentDate = QDateTime::currentDateTime().toString(QStringLiteral("HH:mm"));

    insertQuery.prepare("SELECT * FROM tblTemperature");
    insertQuery.exec();

    if (insertQuery.size()) {
        counter = insertQuery.size();
    }

    // Insert new values to the table.
    if (!insertQuery.exec("INSERT INTO temperature.tblTemperature (ID, Humidity, Temperature, Time) "
                          "VALUES('" + QString::number(counter) + "', '" + humidity + "', '"
                          + temperature + "', '" + currentDate + "')")) {
        qDebug() << "Error: " << insertQuery.lastError();
        return false;
    }
    counter++;
    qCDebug(logDatabase) << "Count = [" <<  counter << "]";

    return true;
}

void Database::initGraph()
{
    QSqlQuery selectQuery;
    QVariantMap values;
    QVariantMap reply;

    selectQuery.exec("SELECT * FROM tblTemperature");

    int nrRows = selectQuery.size();

    if(!selectQuery.exec("SELECT * FROM tblTemperature WHERE Id BETWEEN " +
                    QString::number(nrRows - 10) + " and " +  QString::number(nrRows - 1))) {
        qCDebug(logDatabase) << selectQuery.lastError();
    };

    while (selectQuery.next()) {
        QVariantMap queryMap = QVariantMap({
            {"humidity", selectQuery.value(1).toString()},
            {"temperature", selectQuery.value(2).toString()},
            {"time", selectQuery.value(3).toString()}
        });

        values.insert(selectQuery.value(0).toString(), queryMap);
    }
    reply.insert("graphic", values);

    emit valuesReceived(reply);
}

void Database::sendHistoric()
{
    QSqlQuery selectQuery;
    QVariantMap values;
    QVariantMap reply;

    if(!selectQuery.exec("SELECT * FROM tblTemperature")) {
        qCDebug(logDatabase) << selectQuery.lastError();
    }

    while (selectQuery.next()) {
        QVariantMap myMap = QVariantMap({
            {"humidity", selectQuery.value(1).toString()},
            {"temperature", selectQuery.value(2).toString()},
            {"time", selectQuery.value(3).toString()}
        });

        values.insert(selectQuery.value(0).toString(), myMap);
    }
    reply.insert("historic", values);

    qCDebug(logDatabase) << "Historic sent";

    emit valuesReceived(reply);
}

void Database::newConnection()
{
    initGraph();
    co2PPM(0, "250");
}

void Database::co2PPM(const QString &rzero, const QString &ppm)
{
    qDebug () << "values arrived, sneding";
    QVariantMap reply;
    QVariantMap gaugeData = QVariantMap({
        {"ppm", ppm}
    });

    reply.insert("gauge", gaugeData);

    emit valuesReceived(reply);
}

void Database::sendContact(const QString &name, const QString &email, const QString &phoneNr, const QString &message)
{
    QSqlQuery insertQuery;
    QVariantMap reply;
    QString currentDate = QDateTime::currentDateTime().toString(QStringLiteral("dd/MM/yyyy - hh:mm"));

    insertQuery.prepare("SELECT * FROM tblContact");
    insertQuery.exec();

    // Insert new values to the table.
    if (!insertQuery.exec("INSERT INTO temperature.tblContact (Date, name, email, phone, message) "
                          "VALUES('" + currentDate + "', '" + name + "', '" + email + "', '"
                          + phoneNr + "', '" + message + "')")) {
        qDebug() << "Error: " << insertQuery.lastError();
    }

    reply.insert("state", "success");

    emit valuesReceived(reply);
}

void Database::sendCredentials()
{
    QSqlQuery selectQuery;
    QVariantMap reply;
    QVariantMap values;

    if(!selectQuery.exec("SELECT * FROM tblAccount")) {
        qCDebug(logDatabase) << selectQuery.lastError();
    }

    while (selectQuery.next()) {
        values.insert("user", selectQuery.value(0).toString());
        values.insert("password", selectQuery.value(1).toString());
    }
    reply.insert("credentials", values);

    qCDebug(logDatabase) << "Credentials have been sent!";

    emit valuesReceived(reply);
}

void Database::registerAmbientalTestData(const QString &humidity, const QString &temperature)
{
    QSqlQuery insertQuery;
    QVariantMap reply;
    QString currentDate = QDateTime::currentDateTime().toString(QStringLiteral("HH:mm"));

    insertQuery.prepare("SELECT * FROM tblTemperature");
    insertQuery.exec();

    const auto size = insertQuery.size();
    // Insert test values to the table.
    if (!insertQuery.exec("INSERT INTO temperature.tblTemperature (ID, Humidity, Temperature, Time) "
                          "VALUES('" + QString::number(size) + "', '" + humidity + "', '"
                          + temperature + "', '" + currentDate + "')")) {
        qDebug() << "Error: " << insertQuery.lastError();
    }
}

void Database::getContactMessages()
{
    QSqlQuery selectQuery;
    QVariantMap values;
    QVariantMap reply;

    selectQuery.exec("SELECT * FROM tblTemperature");

    int counter = 0;

    if(!selectQuery.exec("SELECT * FROM tblContact WHERE 1 ")) {
        qCDebug(logDatabase) << selectQuery.lastError();
    };

    while (selectQuery.next()) {
        QVariantMap queryMap = QVariantMap({
            {"date", selectQuery.value(0).toString()},
            {"name", selectQuery.value(1).toString()},
            {"email", selectQuery.value(2).toString()},
            {"phone", selectQuery.value(3).toString()},
            {"message", selectQuery.value(4).toString()}
        });

        values.insert(QString::number(counter), queryMap);
        counter++;
    }
    reply.insert("contact", values);

    emit valuesReceived(reply);
}

void Database::sendMail()
{
    MailClient mailClient;

    QVariantMap data(QVariantMap({
        {usernameKey, "papplevente997@gmail.com"},
        {receiverKey, "papplevente@yahoo.com"},
        {subjectKey, "Gas alert"}
    }));

    const auto username = data.value(usernameKey).toString();
    const auto receiver = data.value(receiverKey).toString();
    const auto subject = data.value(subjectKey).toString();

    qDebug () << username << receiver << subject;
    if (!mailClient.sendMail(username, receiver, subject, alertMessage)) {
        qCDebug(logDatabase) << "Error in sending the mail!";
    }

    // emit valuesreceived("")
}