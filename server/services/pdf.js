const ejs = require('ejs');
const pdf = require('html-pdf');
//because we disabled the SSL configuration in the dockerimage, we have to ignore ssl errors
const options = {format: 'Letter',  phantomArgs: ['--ignore-ssl-errors=yes']};



function createPDF(view,values, cb) {
    console.log(view);
    ejs.renderFile(view, values, function (err, result) {
        if (result) {
            let html = result;
            console.log(`./pdf/${values.number}_${values.language}.pdf`);
            pdf.create(html, options).toFile(`./pdf/${values.number}_${values.language}.pdf`, function (err, result) {
                if (err) return console.log(err);
                console.log(result);
                cb(result.filename);
            });
        }
        else {
            console.log(err);
            cb(err);
        }
    });
}

module.exports = {
    createPDF
};
