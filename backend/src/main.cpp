#include <QDebug>
#include <QTimer>
#include <QTextCodec>
#include <QCoreApplication>
#include <QCommandLineParser>

#include "Daemon.h"
#include "Led.h"
#include "AmbientalParameters.h"
#include "MotionDetect.h"

int main(int argc, char *argv[])
{
    // Setup codec for locale before we initialize QCoreApplication, otherwise
    // we will run into problems with some unicode characters (as it defaults
    // to Latin1).
    QTextCodec::setCodecForLocale(QTextCodec::codecForName("UTF-8"));

    QCoreApplication app(argc, argv);

    QCommandLineParser parser;
    parser.addHelpOption();
    parser.addVersionOption();

    QCommandLineOption port(
        {QStringLiteral("p"), QStringLiteral("port")},
        QStringLiteral("Port to listen on (default: 8080)."),
        QStringLiteral("port"));
    parser.addOption(port);

    parser.process(app);

    auto daemon = new Daemon(&app);

    if (parser.isSet(port)) {
        bool ok;
        auto customPort = parser.value(port).toInt(&ok, 10);
        if (!ok) {
            qCritical() << "Invalid argument to port:" << parser.value(port);
            return EXIT_FAILURE;
        }
        daemon->setPort(customPort);
    }

    QTimer::singleShot(0, daemon, &Daemon::start);
    auto ambientalParameters = new AmbientalParameters(&app);
    auto motionDetect = new MotionDetect(&app);

    return app.exec();
}
