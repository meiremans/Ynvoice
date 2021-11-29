const Invoice = require('./../models/invoice');
const Quotation = require('./../models/quotation');
const InvoiceText = require('./../models/invoiceText');
const productCode = require('./../models/productCode');


function showDashboard(req,res,next){
    let year = new Date().getFullYear();
    if(req.query.year){
        year = req.query.year;
    }

    let lowerdate = new Date(year, 0, 1);
    let upperdate = new Date(year, 11, 31);
    Invoice.find({date:{'$gte': lowerdate, '$lt': upperdate}}).then((invoices) => {
        for (let i = 0; i < invoices.length; i++) {
            let invoiceMonth = new Date(invoices[i].date).getMonth();
            console.log(invoiceMonth);
            invoices[i].month = invoiceMonth+1;
        }

        invoices.sort(function (a, b) {
            return a.month - b.month;
        });
        res.render('dashboard',{invoices:invoices,year:year})
    })
}

function showQuotationDashboard(req,res,next){
    let year = new Date().getFullYear();
    if(req.query.year){
        year = req.query.year;
    }

    let lowerdate = new Date(year, 0, 1);
    let upperdate = new Date(year, 11, 31);
    Quotation.find({date:{'$gte': lowerdate, '$lt': upperdate}}).then((quotations) => {
        for (let i = 0; i < quotations.length; i++) {
            let invoiceMonth = new Date(quotations[i].date).getMonth();
            console.log(invoiceMonth);
            quotations[i].month = invoiceMonth+1;
        }

        quotations.sort(function (a, b) {
            return a.month - b.month;
        });
        res.render('dashboardQuotation',{quotations:quotations,year:year})
    })
}

module.exports = {
    showDashboard,
    showQuotationDashboard

};