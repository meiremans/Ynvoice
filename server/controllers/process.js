const y = require('ypsilon');
const csv = require("csvtojson");
const fs = require('fs');
const InvoiceModel = require('../models/invoice');
const QuotationModel = require('../models/quotation');
const MetaModel = require('../models/meta');
const ProductCodeModel = require('../models/productCode');
const exchangeService = require('./../services/exchangeRate');




function printCSV(req, res, next) {
    lineItems = [];
    csv()
        .fromString(req.files.csvdata.data.toString())
        .on('json', (json) => {
            lineItems.push(json);
        })
        .on('done', (error) => {
            console.log('done');
            res.setResponse(lineItems);
            next();
        });
}

function upload(req, res, next) {

    lineItems = [];
    csv()
        .fromString(req.files.csvdata.data.toString())
        .on('json', (json) => {
            lineItems.push(json);
            console.log(json);
            console.log('----line item--------');
        })

        .on('done', (error) => {
            console.log('done');
            res.setResponse(lineItems);
            saveCSV(lineItems).then((invoice) => {
                console.log('returned');
                console.log(invoice.invoiceLines);
                Promise.all(checkIfCodesAvailable(invoice.invoiceLines)).then((values) => {
                    console.log(values);
                    let undefinedCodes = [];
                    for (let i = 0; i < invoice.invoiceLines.length; i++) {
                        console.log(values[i]);
                        if (values[i].length === 0) {
                            if (!undefinedCodes.includes(invoice.invoiceLines[i].code)) {
                                undefinedCodes.push(invoice.invoiceLines[i].code);
                            }
                        }
                    }
                    if (undefinedCodes.length > 0) {
                        console.log('render');
                        res.render('newcode', {codes: undefinedCodes});
                    } else {
                        res.redirect('/api/');
                        next();
                    }
                });
            });
        })

}

function makeInvoiceNumber(field) {

    return MetaModel.findOne({}).then((meta) => {
        meta[field]++;
        meta.save();
        return meta[field];
    })
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

function saveQuotation(lineItems) {
    //get all static data from first line item
    console.log('save quote');
    const firstItem = lineItems[0];
    console.log(firstItem);
    return new Promise(
        function (resolve, reject) {
            let quotation = new QuotationModel({
                quotationNumber: firstItem[getRightKey(firstItem,['Display Name','display_name'])],
                company: {
                    name: firstItem[getRightKey(firstItem,['Company/Company Name','company_id/name'])],
                    adress: {
                        street: firstItem[getRightKey(firstItem,['Company/Street','company_id/street'])],
                        street2: firstItem[getRightKey(firstItem,['Company/Street2','company_id/street2'])],
                        county: firstItem[getRightKey(firstItem,['Company/City','company_id/city'])],
                        country: firstItem[getRightKey(firstItem,['Company/Country/Country Name','company_id/country_id/name'])]
                    },
                    vatNumber: firstItem[getRightKey(firstItem,['Company/Tax ID','company_id/vat'])],
                    registrationNumber: firstItem[getRightKey(firstItem,['Company/Company registry','company_id/company_registry'])]
                },
                date: firstItem[getRightKey(firstItem,['Creation Date','create_date'])],
                validUntil: firstItem['validity_date'],
                client: {
                    name: firstItem[getRightKey(firstItem,['Customer/Company Name Entity','partner_id/commercial_partner_id'])],
                    adress: {
                        street: firstItem[getRightKey(firstItem,['Customer/Street','partner_id/street'])],
                        county: firstItem[getRightKey(firstItem,['Customer/Street2','partner_id/street2'])],
                        city : firstItem['partner_id/city'],
                        country: firstItem[getRightKey(firstItem,['Customer/Country/Display Name','partner_id/country_id/name'])]
                    },
                    vatNumber: firstItem[getRightKey(firstItem,['Customer/TIN','partner_id/vat'])]
                },
                invoiceLines: [],
                total: firstItem[getRightKey(firstItem,['Total','amount_total'])]
            });
            for (let i = 0; i < lineItems.length; i++) {
                let item = lineItems[i];
                let nameKey = getRightKey(item, ['Order Lines/Display Name', 'order_line/display_name']);
                let amountKey = getRightKey(item, ['Order Lines/Price Reduce', 'order_line/price_subtotal']);//TODO: check in other version of import for "Price Reduce and change it to subtotal
                let codeKey = getRightKey(item, ['Order Lines/Display Name', 'order_line/product_id']);
                let invoiceLine = {
                    code: splitCodeAndText(item[codeKey]).code,
                    extraInfo: {
                        nl: splitCodeAndText(item[nameKey]).text,
                        en: splitCodeAndText(item[nameKey]).text,
                        ro: splitCodeAndText(item[nameKey]).text,
                        fr: splitCodeAndText(item[nameKey]).text
                    },
                    amount: item[amountKey],
                    units : item['order_line/product_uom_qty'], //TODO: check how this is in other version of import and add this
                    unitPrice : item['order_line/price_reduce_taxexcl']//TODO: check how this is in other version of import and add this
                };
                console.log(invoiceLine);
                if (invoiceLine.code) {
                    quotation.invoiceLines.push(invoiceLine);
                }
            }
            console.log(firstItem['display_name']);
            quotation.save();
            resolve(quotation);
        })

}

function getRightKey(item, keys) {
    for (let i = 0; i < keys.length; i++) {
        if (item[keys[i]]) {
            return keys[i];
        }
    }
    return false;
}

function saveCSV(lineItems) {
    if (lineItems[0].Status === "Quotation" || lineItems[0].state === "Quotation") {
        return saveQuotation(lineItems);
    } else {
        return saveInvoice(lineItems);
    }
}

function saveInvoice(lineItems) {
    //get all static data from first line item
    const firstItem = lineItems[0];
    let ronRate;
    let unavailableCodes = [];
    let date = firstItem['tax_line_ids/invoice_id/date'];
    if(!date){
        date = firstItem['invoice_line_ids/invoice_id/date'];
    }


    return exchangeService.getEuroRon(date).then((result) => {
        console.log(result.rates.RON);
        ronRate = result.rates.RON;
        return ronRate;
    })
        .then((rate) => {
            return makeInvoiceString(firstItem['partner_shipping_id/country_id'])
        })
        .then((invoiceNr) => {
            console.log('invoicenr');
            console.log(invoiceNr);
            let invoice = new InvoiceModel({
                invoiceNumber: invoiceNr,
                company: {
                    name: firstItem['invoice_line_ids/invoice_id/company_id'],
                    adress: {
                        street: firstItem['company_id/street'],
                        street2: firstItem['company_id/street2'],
                        county: firstItem['company_id/state_id/display_name'],
                        country: firstItem['company_id/state_id/country_id']
                    },
                    vatNumber: firstItem['company_id/vat'],
                    registrationNumber: firstItem['company_id/company_registry']
                },
                date: firstItem['tax_line_ids/invoice_id/date'],
                paymentTerms: firstItem['payment_term_id/note'],
                client: {
                    name: firstItem['invoice_line_ids/invoice_id/commercial_partner_id'],
                    adress: {
                        street: firstItem['partner_shipping_id/contact_address'],
                        county: firstItem['partner_shipping_id/city'],
                        country: firstItem['partner_shipping_id/country_id']
                    },
                    vatNumber: firstItem['partner_id/vat'],
                    registrationNumber: firstItem['']
                },
                invoiceLines: [],
                exchangeRate: ronRate,
                subTotal: firstItem['tax_line_ids/invoice_id/amount_untaxed'],
                VATPercentage: firstItem['tax_line_ids/tax_id/amount'],
                VATTotal: firstItem['amount_tax'],
                total: firstItem['tax_line_ids/invoice_id/amount_total']
            });
            for (let i = 0; i < lineItems.length; i++) {
                let item = lineItems[i];
                let invoiceLine = {
                    code: splitCodeAndText(item['invoice_line_ids/product_id/display_name']).code,
                    extraInfo: {
                        nl: splitCodeAndText(item['invoice_line_ids/display_name']).text,
                        en: splitCodeAndText(item['invoice_line_ids/display_name']).text,
                        ro: splitCodeAndText(item['invoice_line_ids/display_name']).text,
                        fr: splitCodeAndText(item['invoice_line_ids/display_name']).text
                    },
                    amount: item['invoice_line_ids/price_subtotal']
                };
                if (invoiceLine.code) {
                    invoice.invoiceLines.push(invoiceLine);
                }
            }
            console.log(invoiceNr);
            invoice.save();
            console.log(unavailableCodes);
            return invoice;

        })
}

function splitCodeAndText(displayName) {
    //if no code is supplied return only text
    if (!displayName.includes('[') && !displayName.includes(']')) {
        return {text: displayName};
    }
    let item = {
        code: displayName.substring(displayName.lastIndexOf("[") + 1, displayName.lastIndexOf("]")),
        text: displayName.substring(displayName.lastIndexOf("]") + 2, displayName.length)
    };
    return item

}

function checkIfCodesAvailable(lineItems) {
    let promiseArray = [];
    for (let i = 0; i < lineItems.length; i++) {
        promiseArray.push(getProductCode(lineItems[i].code));
    }
    return promiseArray;
}

function getProductCode(code) {
    return ProductCodeModel.find({code: code});
}

module.exports = {
    upload,
    printCSV
};
