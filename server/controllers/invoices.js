const exchangeService = require("../services/exchangeRate");

const y = require('ypsilon');
const moment = require("moment");
const Invoice = require('./../models/invoice');
const InvoiceText = require('./../models/invoiceText');
const pdfService = require('./../services/pdf');
const EasyZip = require('easy-zip').EasyZip;
const CodeTranslatorService = require('./../services/codeTranslator');
const Productcode = require('./../models/productCode');
const MetaModel = require('../models/meta');


async function newInvoice(req, res, next) {

    const clients = await Invoice.aggregate([
        {
            '$sort': {
                'date': -1
            }
        }, {
            '$group': {
                '_id': '$client.vatNumber',
                'adress': {'$first': '$client.adress'},
                'name': {'$first': '$client.name'},
            }
        }
    ]);

    const codes = await Productcode.find({});
    res.render('create', {clients, codes})
}


function showInvoice(req, res, next) {
    showOrEdit('invoice', req, res, next);
}

async function saveNewInvoice(req, res, next) {
    let unavailableCodes = [];
    let date = new Date(req.body.date);
    let yesterday = new Date(req.body.date);
    yesterday.setDate((yesterday.getDate()-1));
    let ronRate = (await exchangeService.getEuroRon(moment(yesterday).format('YYYY-MM-DD'))).rates.RON;
    let invoiceNr = await makeInvoiceString(req.body.clientAdressCountry);
    console.log('invoicenr');
    console.log(invoiceNr);
    const {lineItems,undefinedCodes} = await processLineItems(req.body);
    let invoice = new Invoice({
        invoiceNumber: invoiceNr,
        company: {
            name: process.env.COMPANY_NAME,
            adress: {
                street: process.env.COMPANY_ADDRESS_STREET,
                street2: process.env.COMPANY_ADDRESS_STREET2,
                county: process.env.COMPANY_CITY,
                country: process.env.COMPANY_COUNTRY,
            },
            vatNumber: process.env.COMPANY_VAT_NUMBER,
            registrationNumber: process.env.COMPANY_REGISTRATION_NUMBER
        },
        date: date,
        paymentTerms: process.env.INVOICE_PAYMENT_TERMS,
        client: {
            name: req.body.clientName,
            adress: {
                street: req.body.clientAdressStreet,
                postalCode : req.body.clientAdressPostalCode,
                county: req.body.clientAdressCounty,
                country: req.body.clientAdressCountry
            },
            vatNumber: req.body.clientVatNumber,
            registrationNumber: ''
        },
        invoiceLines: lineItems,
        exchangeRate: ronRate,
        subTotal: lineItems.reduce((acc,item) => item.amount + acc,0),
        VATPercentage: parseFloat(req.body.vatPercentage),

    });
    invoice.VATTotal =  invoice.subTotal * invoice.VATPercentage;
    invoice.total= invoice.subTotal  * (1+ invoice.VATPercentage / 100);

    await invoice.save();

    if (undefinedCodes.length > 0) {
        res.render('newcode', {codes: undefinedCodes});
    } else {
        res.redirect('/api/');
        next();
    }
}

const processLineItems = async (body) => {
    const codes = await Productcode.find({}).lean();

    if (!Array.isArray(body.lineCode)) {
        const undefinedCode = codes.find(x => x.code === body.lineCode) ? undefined : body.lineCode  ;
        return {lineItems: [{
            code: body.lineCode,
            extraInfo: {
                nl: body.lineExtraInfo,
                en: body.lineExtraInfo,
                ro: body.lineExtraInfo,
                fr: body.lineExtraInfo
            },
            amount: parseFloat(body.lineAmount)
        }],undefinedCodes : [undefinedCode]};
    }
    return body.lineCode.map((lineCode, i) => {
        return {
            code: lineCode,
            extraInfo: {
                nl: body.lineExtraInfo[i],
                en: body.lineExtraInfo[i],
                ro: body.lineExtraInfo[i],
                fr: body.lineExtraInfo[i]
            },
            amount: parseFloat(body.lineAmount[i])
        };
    });
};

function showOrEdit(showOrEdit, req, res, next) {
    let invoicenr = req.params.invoice;
    let language = req.query.lang;
    if (!language) {
        language = 'nl';
    }
    let invoiceText;

    InvoiceText.findOne({language: language}).then((text) => {
        invoiceText = text;
        Invoice.findOne({invoiceNumber: invoicenr})
            .then((invoice) => {
                Promise.all(CodeTranslatorService.translateInvoiceCodes(invoice.invoiceLines, language)).then((values) => {
                    let newInvoicelines = [];
                    for (let i = 0; i < values.length; i++) {
                        let printableInvoiceLine = {
                            code: values[i],
                            extraInfo: invoice.invoiceLines[i].extraInfo[language],
                            hours: invoice.invoiceLines[i].hours,
                            cost: invoice.invoiceLines[i].cost,
                            amount: invoice.invoiceLines[i].amount,
                            _id: invoice.invoiceLines[i]._id
                        };
                        newInvoicelines.push(printableInvoiceLine);
                    }
                    if (showOrEdit === 'download') {
                        download({
                            invoice: invoice,
                            number: invoice.invoiceNumber,
                            invoiceLines: newInvoicelines,
                            language: language,
                            text: invoiceText
                        }, req, res, next);
                    } else {
                        res.render(showOrEdit, {
                            invoice: invoice,
                            invoiceLines: newInvoicelines,
                            language: language,
                            text: invoiceText
                        })
                    }
                });
            });
    })

}

function generateAllPdfBetweenDates(startDate, endDate) {
    let allInvoiceText;
    let filePaths = [];
    return InvoiceText.find({}).then((text) => {
        allInvoiceText = text;
    }).then(() => {
        return Invoice.find({date: {'$gte': startDate, '$lt': endDate}});
    })
        .then((invoices) => {
            for (let h = 0; h < allInvoiceText.length; h++) {
                for (let i = 0; i < invoices.length; i++) {
                    let invoice = invoices[i];
                    Promise.all(CodeTranslatorService.translateInvoiceCodes(invoice.invoiceLines, allInvoiceText[h].language)).then((values) => {
                        let newInvoicelines = [];

                        for (let i = 0; i < values.length; i++) {
                            let printableInvoiceLine = {
                                code: values[i],
                                extraInfo: invoice.invoiceLines[i].extraInfo[allInvoiceText[h].language],
                                hours: invoice.invoiceLines[i].hours,
                                cost: invoice.invoiceLines[i].cost,
                                amount: invoice.invoiceLines[i].amount,
                                _id: invoice.invoiceLines[i]._id
                            };
                            newInvoicelines.push(printableInvoiceLine);
                        }
                        pdfService.createPDF('invoice', {
                            invoice: invoice,
                            invoiceLines: newInvoicelines,
                            language: allInvoiceText[i].language,
                            text: allInvoiceText[i]
                        }, function (filepath) {
                            filePaths.push(filepath);
                            if (i === values.length - 1) {
                                console.log('last one generated');
                            }
                        })
                    });
                }

                if (h === allInvoiceText.length) {
                    console.log(filePaths);
                    return filePaths;
                }
            }
        })
        .catch((err) => {
            console.error(err);
        })

}

function editInvoice(req, res, next) {
    showOrEdit('editInvoice', req, res, next);
}

function downloadInvoice(req, res, next) {
    showOrEdit('download', req, res, next);
}

function updateInvoice(req, res, next) {
    let invoicenr = req.params.invoice;
    let values = [];
    let language;
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            item = req.body[key];
            if (key === 'language') {
                language = req.body[key];
            } else {

                values.push({key: key, value: req.body[key]});
            }
        }
    }
    updateLines(values, language, invoicenr);
}

function updateLines(values, language, invoicenr) {
    Invoice.findOne({invoiceNumber: invoicenr}).then((result) => {
        console.log(result);
        for (let i = 0; i < result.invoiceLines.length; i++) {
            for (let j = 0; j < values.length; j++) {
                console.log(result.invoiceLines[i]._id + "=" + values[j].key);
                if (result.invoiceLines[i]._id.toString() === values[j].key) {
                    result.invoiceLines[i].extraInfo[language] = values[j].value;
                    console.log(result.invoiceLines[i].extraInfo[language]);
                }
            }
        }
        result.save();

    })
}

function downloadZip(req, res, next) {
    let zip = new EasyZip();
    let files = [];
    let lowerdate = new Date(2017, 0, 1);
    let upperdate = new Date(2017, 11, 31);
    generateAllPdfBetweenDates(lowerdate, upperdate).then((invoicePaths) => {
        for (let i = 0; i < invoicePaths.length; i++) {
            files.push({source: invoicePaths[i], target: 'test'});
        }
        zip.writeToResponse(res, 'attachment.zip');
    })

}

function download(values, req, res, next) {
    pdfService.createPDF('./server/views/invoice.ejs', values, function (fileLocation) {
        res.download(fileLocation);
    });
}

function makeInvoiceString(country) {
    let field = 'invoiceCounterEU';
    let prefix = process.env.INVOICE_COUNTER_PREFIX;
    if (country === "Romania") {
        field = 'invoiceCounterRO';
        prefix = `${process.env.INVOICE_COUNTER_PREFIX}-RO`;
    }
    return makeInvoiceNumber(field).then((meta) => {
        return prefix + meta;
    });
}

function makeInvoiceNumber(field) {

    return MetaModel.findOne({}).then((meta) => {
        if(!meta){
            meta = new MetaModel({invoiceCounterEU:0,invoiceCounterRO:0});
        }
        meta[field]++;
        meta.save();
        return meta[field];
    })
}


module.exports = {
    showInvoice,
    editInvoice,
    updateInvoice,
    downloadInvoice,
    downloadZip,
    newInvoice,
    saveNewInvoice

};
