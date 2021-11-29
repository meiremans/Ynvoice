module.exports = (app) => {
    const y = require('ypsilon');
    const codes = app.controllers.codes;
    app.routes.post('/codes', codes.addCode);
};