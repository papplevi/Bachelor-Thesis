#ifndef DATABASE_H
#define DATABASE_H

#include <QObject>
#include <QVariantMap>

class Database : public QObject
{

    Q_OBJECT

public:
    static Database* Instance()
    {
        if(mDatabaseInstance == nullptr) {
            mDatabaseInstance = new Database();
        }
        return mDatabaseInstance;
    }
    Database(const bool &);

    bool addEnvironmentValues(const QString &, const QString &);

    void initGraph();
    void sendHistoric();
    void co2PPM(const QString &, const QString &);
    void sendContact(const QString &, const QString &, const QString &, const QString &);
    void sendCredentials();
    void registerAmbientalTestData(const QString &, const QString &);
    void getContactMessages();
    void sendMail();

public slots:
    void newConnection();

private:
    static Database *mDatabaseInstance;
    Database();

    int counter;

signals:
    void valuesReceived(const QVariantMap &);
};

#endif // DATABASE_H
