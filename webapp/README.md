### Intructions for setting up smarthome-webapp

### Install Node Version Manager (nvm):

    :::sh
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

### Close the Terminal then open it again

### Install node.js:

    :::sh
    nvm install stable

### Install required tools:

    :::sh
    npm install -g grunt-cli
    npm install -g bower

### Clone repository:

    :::sh
    # Clone repo
    git clone https://github.com/foxxydev/SecuRO-webapp.git
    cd SecuRO-webapp

### Install site dependencies:

    :::sh
    npm install
    bower install

### Deploy site-resources:

    :::sh
    grunt install-resources

### Deploy/run site:

    :::sh
    grunt

### Open http://localhost:3000 in your browser.
