

module.exports = (app) => {
    const auth = require('./../services/authentication');
    const y = require('ypsilon');
    const dashboard = app.controllers.dashboard;
    app.routes.get('/',auth.BasicAuthentication,dashboard.showDashboard);
    app.routes.get('/quotations',auth.BasicAuthentication,dashboard.showQuotationDashboard)
};

