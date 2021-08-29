#include "src/MailClient.h"

#include <QDebug>

MailClient::MailClient(QObject *parent)
    :QObject(parent)
{
}

bool MailClient::sendMail(const QString &from, const QString &to, const QString &subj, const QString &msg)
{
    Smtp* smtp = new Smtp();
    connect(smtp, SIGNAL(status(QString)), this, SLOT(mailSent(QString)));

    if (!smtp->sendMail(from, to, subj, msg)) {
        return false;
    }

    return true;
}

bool MailClient::mailSent(QString status)
{
    if (status != "Message sent") {
        return false;
    }

    return true;
}