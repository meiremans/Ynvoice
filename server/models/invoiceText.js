const y = require('ypsilon');

const translationSchema = y.schema('translation', {
    language : String,
    vatCode : String,
    invoiceAddress : String,
    date : String,
    dateSupply : String,
    invoiceNr : String,
    terms :String,
    description : String,
    days : String,
    invoice : String,
    hours : String,
    cost : String,
    amount : String,
    exchangeRate : String,
    transferAmount : String,
    subtotal : String,
    vat : String,
    vatAmount : String,
    other : String,
    total : String,
    notTaxable : String,
    name : String,
    address : String,
    registrationNumber : String,
    comments : String,
    quotation : String,
    quotationNumber : String,
    unitPrice : String,
    quotationComments : String,
    termsOfService: String,
    quotationTOS: String
});

module.exports = translationSchema;