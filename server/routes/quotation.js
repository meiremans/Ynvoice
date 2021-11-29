module.exports = (app) => {
    const y = require('ypsilon');
    const auth = require('./../services/authentication');
    const quotation = app.controllers.quotation;
    app.routes.get('/quotation/new',auth.BasicAuthentication, function(req, res, next){res.render('upload');});
    app.routes.get('/quotation/:quotation', quotation.showQuotation);
    app.routes.post('/quotation/:quotation',auth.BasicAuthentication, quotation.updateQuotation);
    app.routes.get('/quotation/:quotation/edit',auth.BasicAuthentication, quotation.editQuotation);
    app.routes.get('/quotation/:quotation/download', quotation.downloadQuotation);
};