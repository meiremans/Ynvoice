const dotenv = require("dotenv");
dotenv.config();

console.log(process.env);

const y = require('ypsilon');
const InvoiceText = require('./models/invoiceText');
var basicAuth = require('express-basic-auth');
var cookieParser = require('cookie-parser');

const yConfig = {
    addToNginx : false,
    serverRoot : 'server'
};
y.init(function(app){
    return app.use(cookieParser(process.env.COOKIESECRET));

},yConfig);
firstRun();


function firstRun(){
    InvoiceText.find({language : 'nl'})
        .then((text) => {
            if(!text || text.length === 0){
                let nl = new InvoiceText({
                    language : 'nl',
                    vatCode : 'BTW code',
                    invoiceAddress : 'Factuur adress',
                    date : 'Datum',
                    dateSupply : 'Datum van levering',
                    invoiceNr : 'Factuur nummer',
                    terms :'Voorwaarden',
                    description : 'Omschrijving',
                    days : 'Dagen',
                    invoice : 'Factuur',
                    hours : 'Uren',
                    cost : 'Prijs',
                    amount : 'Hoeveelheid',
                    exchangeRate : 'Wisselkoers van gisteren',
                    transferAmount : 'Stort alstublieft het verschuldigde bedrag binnen de betalingstermijn',
                    subtotal : 'Subtotaal',
                    vat : 'BTW',
                    vatAmount : 'BTW Bedrag',
                    other : 'Overige',
                    total : 'Totaal',
                    notTaxable : 'Niet belastbaar in Roemenië, volgens art.278 Paragraaf (2) van wet 227/2015 – Roemeense fiscale code'
                });
                nl.save().catch(console.log);
            }
            if(!text || text.length === 0){
                let en = new InvoiceText({
                    language : 'en',
                    vatCode : 'VAT Code',
                    invoiceAddress : 'Invoice Adress',
                    date : 'Date',
                    dateSupply : 'Date of supply',
                    invoiceNr : 'Invoice No.',
                    terms :'Terms',
                    description : 'Description',
                    days : 'Days',
                    invoice : 'Invoice',
                    hours : 'Hours',
                    cost : 'Cost',
                    amount : 'Amount',
                    exchangeRate : 'Exchange rate of previous day',
                    transferAmount : 'Please transfer the invoice amount to the given account within the payment deadline.',
                    subtotal : 'Subtotal',
                    vat : 'VAT',
                    vatAmount : 'VAT-Amount',
                    other : 'Other',
                    total : 'Total',
                    notTaxable : 'not taxable in Romania, according to art . 278, align. (2), of  the Law 227/2015 - Romanian Fiscal Code'
                });
                en.save().catch(console.log);
            }
            if(!text || text.length === 0){
                let ro = new InvoiceText({
                    language : 'ro',
                    vatCode : 'TVA codă',
                    invoiceAddress : 'Adresă de facturare',
                    date : 'Dată',
                    dateSupply : 'Dată de livrare',
                    invoiceNr : 'Număr factură',
                    terms :'Termen de livrare',
                    description : 'Descriere produs',
                    days : 'Zile',
                    invoice : 'Factură',
                    hours : 'Ore lucrate',
                    cost : 'Cost pe oră',
                    amount : 'Sumă',
                    exchangeRate : 'Curs valutar din data zilei precedente',
                    transferAmount : 'Vă rugăm să transferati contravaloarea facturii în cont până la data scadenței',
                    subtotal : 'Subtotal (fără TVA)',
                    vat : 'Cotă de TVA',
                    vatAmount : 'Valoare TVA',
                    other : 'Alte costuri ',
                    total : 'Total (fără TVA+TVA)',
                    notTaxable : 'netaxabil in Romania, in conformitate cu art. 278, alin. (2), al Legii 227/2015 - Codul Fiscal'
                });
                ro.save().catch(console.log);
            }
        }).catch(console.log)
}
