const functions = require('firebase-functions');
const express = require('express');
const app = express();
const firebase = require('firebase-admin');
const { token } = require('./config.json');

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const database = firebaseApp.database();

function getStats() {
    const ref = database.ref('stats');
    return ref.once('value').then(snap => snap.val());
}

function getCommands() {
    const ref = database.ref('commands');
    return ref.once('value').then(snap => snap.val());
}

function getUser() {
    const ref = database.ref('users');
    return ref.once('value').then(snap => snap.val());
}

function getGuild() {
    const ref = database.ref('guilds');
    return ref.once('value').then(snap => snap.val());
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/users', (req, res) => {
    getUser().then(data => {
        if (!data[req.query.id]) return res.status(404).json({ status: 404, message: 'resource was not found' });
        res.json({ id: req.query.id, uses: data[req.query.id] });
    });
});

app.get('/guilds', (req, res) => {
    getGuild().then(data => {
        if (!data[req.query.id]) return res.status(404).json({ status: 404, message: 'resource was not found' });
        res.json({ id: req.query.id, uses: data[req.query.id] });
    });
});

app.get('/commands', (req, res) => {
    getCommands().then(data => {
        if (req.query.token === token || req.headers.token === token) {
            return res.json(data);
        }
        return res.status(403).json({ status: 403, message: 'api key is invalid' });
    });
});

app.get('/dblwebhook', (req, res) => {
    res.json({ method: 'GET', status: 200 });
});

app.post('/dblwebhook', (req, res) => {
    if (req.headers.authorization === token) {
        database.ref('votes').child(Date.now()).update(req.body);
        return res.json({ method: 'POST', status: 200 });
    }
    return res.status(403).json({ status: 403, message: 'api key is invalid' });
});

app.get('/patreonwebhook', (req, res) => {
    res.json({ method: 'GET', status: 200 });
});

app.post('/patreonwebhook', async (req, res) => {
    console.log(req.body);
    if (req.query.token === token) {
        switch (req.headers['x-patreon-event']) {
            case 'members:pledge:create':
                database.ref('patreon').child(Date.now()).update(req.body);
                break;

            case 'members:pledge:delete':
                database.ref('patreon').child(Date.now()).update(req.body);
                break;

            case 'members:pledge:update':
                database.ref('patreon').child(Date.now()).update(req.body);
                break;
        }
        return res.json({ method: 'POST', status: 200 });
    }
    return res.status(403).json({ status: 403, message: 'api key is invalid' });
});

exports.app = functions.https.onRequest(app);
