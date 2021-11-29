const y = require('ypsilon');

const productCodeSchema = y.schema('productCode', {
    code : String,
    nl: String,
    en: String,
    ro: String,
    fr: String
});

module.exports = productCodeSchema;