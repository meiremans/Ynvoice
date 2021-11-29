const y = require('ypsilon');


const MetaSchema = y.schema('meta', {
    invoiceCounterEU : Number,
    invoiceCounterRO : Number
})

module.exports = MetaSchema;