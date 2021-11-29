const CodeTranslatorService = require('./../services/codeTranslator');
const pdfService = require('./../services/pdf');
const Quotation = require('./../models/quotation');
const InvoiceText = require('./../models/invoiceText');

function showQuotation(req, res, next) {
    showOrEdit('quotation', req, res, next);
}
function downloadQuotation(req, res, next) {
    showOrEdit('download', req, res, next);
}
function showOrEdit(showOrEdit, req, res, next) {
    let quotationNumber = req.params.quotation;
    console.log(quotationNumber);
    let language = req.query.lang;
    if (!language) {
        language = 'nl';
    }
    let invoiceText;
    InvoiceText.findOne({language: language}).then((text) => {
        invoiceText = text;
        Quotation.findOne({quotationNumber: quotationNumber})
            .then((quotation) => {
                Promise.all(CodeTranslatorService.translateInvoiceCodes(quotation.invoiceLines, language)).then((values) => {
                    let newInvoicelines = [];
                    for (let i = 0; i < values.length; i++) {
                        let printableInvoiceLine = {
                            code: values[i],
                            extraInfo: quotation.invoiceLines[i].extraInfo[language],
                            hours: quotation.invoiceLines[i].hours,
                            cost: quotation.invoiceLines[i].cost,
                            units: quotation.invoiceLines[i].units,
                            unitPrice: quotation.invoiceLines[i].unitPrice,
                            amount: quotation.invoiceLines[i].amount,
                            _id: quotation.invoiceLines[i]._id
                        };
                        newInvoicelines.push(printableInvoiceLine);
                    }
                    if (showOrEdit === 'download') {
                        download({
                            quotation: quotation,
                            number: quotation.quotationNumber,
                            invoiceLines: newInvoicelines,
                            language: language,
                            text: invoiceText
                        }, req, res, next);
                    } else {
                        res.render(showOrEdit, {
                            quotation: quotation,
                            invoiceLines: newInvoicelines,
                            language: language,
                            text: invoiceText
                        })
                    }
                });
            });
    });

}
function updateQuotation(req, res, next) {
    let nr = req.params.quotation;
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
    updateLines(values, language, nr).then((quote) => {
        console.log('redirect');
            res.redirect('/api/');
    });
}

function updateLines(values, language, quoteNr) {
   return Quotation.findOne({quotationNumber: quoteNr}).then((result) => {
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
       return result.save()

    })
}

function editQuotation(req,res,next){
        showOrEdit('editQuotation', req, res, next);
}

function download(values, req, res, next) {
    pdfService.createPDF('./server/views/quotation.ejs',values, function (fileLocation) {
        res.download(fileLocation);
    });
}

module.exports = {
    showQuotation,
    downloadQuotation,
    editQuotation,
    updateQuotation
};
