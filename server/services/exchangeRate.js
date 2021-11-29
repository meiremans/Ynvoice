const y = require('ypsilon');


function getEuroRon(date) {
    const endpoint = `http://data.fixer.io/${date}?access_key=${process.env.FIXER_KEY}`;
    return Promise.resolve(y.request.httpGet(endpoint));
}

module.exports = {
    getEuroRon
};
