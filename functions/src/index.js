require('dotenv').config();
const functions = require('firebase-functions');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { Firebase } = require('firestore-db');

const firebaseApp = new Firebase({
	projectId: process.env.PROJECT_ID,
	clientEmail: process.env.CLIENT_EMAIL,
	privateKey: process.env.PRIVATE_KEY
});

const database = firebaseApp.firebase.database();

const endpoints = fs.readdirSync(path.join(__dirname, 'endpoints'))
	.filter(file => file.endsWith('.js'))
	.map(file => require(path.join(__dirname, 'endpoints', file)));
for (const endpoint of endpoints) {
	endpoint(app, database);
}

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

exports.app = functions.https.onRequest(app);

/* app.listen(process.env.PORT, () => {
	console.log(`Server started on port ${process.env.PORT}`);
});*/

