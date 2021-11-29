const y = require('ypsilon');
const Productcode = require('./../models/productCode');

function addCode(req, res, next) {
    let strcodes = req.body.codes.substring(0, req.body.codes.length - 1);
    let codes = strcodes.split(',');
    for (let i = 0; i < codes.length; i++) {
        let nl = req.body[`${codes[i]}_nl`];
        let en = req.body[`${codes[i]}_en`];
        let ro = req.body[`${codes[i]}_ro`];
        let fr = req.body[`${codes[i]}_fr`];
        let productCode = new Productcode({
            code: codes[i],
            nl: nl,
            en: en,
            ro: ro,
            fr: fr
        });
        productCode.save();
    }
    res.redirect('/api/');
}



module.exports = {
    addCode
};
