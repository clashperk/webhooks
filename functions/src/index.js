const functions = require('firebase-functions');
const express = require('express');
const app = express();

app.use((_req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/webhook', require('./routes/patreon'));
app.use('/webhook', require('./routes/voting'));

exports.app = functions.https.onRequest(app);
