module.exports = (app) => {
    const y = require('ypsilon');
    const auth = require('./../services/authentication');
    const process = app.controllers.invoices;
    app.routes.get('/invoice/new',auth.BasicAuthentication, process.newInvoice);
    app.routes.post('/invoice/create',auth.BasicAuthentication,  process.saveNewInvoice);
    app.routes.get('/invoice/:invoice', process.showInvoice);
    app.routes.post('/invoice/:invoice',auth.BasicAuthentication, process.updateInvoice);
    app.routes.get('/invoice/:invoice/edit',auth.BasicAuthentication, process.editInvoice);
    app.routes.get('/invoice/:invoice/download', process.downloadInvoice);
    app.routes.get('/invoice/download/zip', process.downloadZip);
};