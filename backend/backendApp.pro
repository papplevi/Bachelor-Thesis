CONFIG = qt debug c++11 link_pkgconfig
QT = core sql websockets serialport
#LIBS += libQt5SerialPort.a
*-g++* {
    QMAKE_CXXFLAGS += "-Wall -Wextra -pedantic"
}

SOURCES += \
    src/AmbientalParameters.cpp \
    src/Client.cpp \
    src/Daemon.cpp \
    src/Database.cpp \
    src/Led.cpp \
    src/MotionDetect.cpp \
    src/Smtp.cpp \
    src/MailClient.cpp \
    src/main.cpp

HEADERS += \
    src/AmbientalParameters.h \
    src/Client.h \
    src/Daemon.h \
    src/Database.h\
    src/Led.h \
    src/Smtp.h \
    src/MotionDetect.h \
    src/MailClient.h

isEmpty(PREFIX) {
    PREFIX=$$(prefix)
    isEmpty(PREFIX) {
        warning("Neither qmake variable 'PREFIX' nor environment variable 'prefix' was defined.")
        PREFIX=/usr
    }
}
target.path = $$PREFIX/sbin
INSTALLS += target