#ifndef MAILCLIENT_H
#define MAILCLIENT_H

#include <src/Smtp.h>

class MailClient : public QObject
{
    Q_OBJECT
public:
    MailClient(QObject * = nullptr);
    bool sendMail(const QString &, const QString &, const QString &, const QString &);

private slots:
    bool mailSent(QString);
};

#endif // MAILCLIENT_H