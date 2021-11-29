const y = require('ypsilon');

const invoiceLineSchema = y.schema('sub', {
    code: String,
    extraInfo: {
        nl: String,
        en: String,
        ro: String,
        fr: String

    },
    hours: Number,
    cost: Number,
    amount: Number
});


const InvoiceSchema = y.schema('invoice', {
    invoiceNumber: String,
    company: {
        name: String,
        adress: {
            street: String,
            street2: String,
            county: String,
            country: String
        },
        vatNumber: String,
        registrationNumber: String
    },
    date: Date,
    paymentTerms: String,
    client: {
        name: String,
        adress: {
            street: String,
            postalCode: String,
            county: String,
            country: String
        },
        vatNumber: String,
        registrationNumber: String
    },
    invoiceLines: [invoiceLineSchema],
    exchangeRate: Number,
    subTotal : Number,
    VATPercentage : Number,
    VATTotal : Number,
    total: Number
});

module.exports = InvoiceSchema;