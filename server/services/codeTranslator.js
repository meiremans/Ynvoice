const productCode = require('./../models/productCode');
function translateInvoiceCodes(invoiceLines, language) {
    let promiseArray = [];
    for (let i = 0; i < invoiceLines.length; i++) {
        console.log(invoiceLines[i]);
        if (invoiceLines[i].code) {
            promiseArray.push(getCodeTranslation(invoiceLines[i].code, language));
        }
    }
    return promiseArray;
}

function getCodeTranslation(code, language) {
    productCode.find({}).then(console.log);
    return productCode.findOne({code: code}).then((codeObj) => {
        if(!codeObj){
            throw new Error(`${code} was not found`);
        }
        return codeObj[language];
    })
}

module.exports = {
    translateInvoiceCodes
}
