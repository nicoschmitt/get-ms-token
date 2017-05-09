require('dotenv').config({silent: true});

let express = require('express');
let fs = require('fs');
let https = require('https');
let path = require('path');
let request = require('request');

var app = express();
let server = https.createServer({
    key  : fs.readFileSync('./certs/dev.cert.key'),
    cert : fs.readFileSync('./certs/dev.cert.crt')
}, app);

server.listen(443, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Server listening at ", addr.address + ":" + addr.port);
});

app.get('/config', (req, res) => res.json({
    appId: process.env.APP_ID,
    redirectUrl: process.env.REDIRECT_URL,
}));

app.get('/token/:code', (req, res) => {
    let url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    let data = {
        client_id: process.env.APP_ID,
        redirect_uri: process.env.REDIRECT_URL,
        client_secret: process.env.APP_SECRET,
        code: req.params.code,
        grant_type: 'authorization_code',
    };
    request.post({url: url, form: data}, function(err, response, body) {
        if (err) res.status(500).json(err);
        else res.send(body);
    });
});

app.use(express.static(path.resolve(__dirname, 'www')));
