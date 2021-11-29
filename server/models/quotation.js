const y = require('ypsilon');

const InvoiceLineSchema = y.schema('sub', {
    code: String,
    extraInfo: {
        nl: String,
        en: String,
        ro: String,
        fr: String

    },
    units : Number,
    unitPrice: Number,
    hours: Number,
    cost: Number,
    amount: Number
});


const QuotationSchema = y.schema('quotation', {
    quotationNumber: String,
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
    validUntil: String,
    client: {
        name: String,
        adress: {
            street: String,
            county: String,
            city: String,
            country: String
        },
        vatNumber: String,
        registrationNumber: String
    },
    invoiceLines: [InvoiceLineSchema],
    total: Number
});

module.exports = QuotationSchema;