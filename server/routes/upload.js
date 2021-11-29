

module.exports = (app) => {
    const y = require('ypsilon');
    const process = app.controllers.process;
    const auth = require('./../services/authentication');
    app.routes.post('/upload',auth.BasicAuthentication, process.upload);
};

