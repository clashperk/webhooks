const functions = require('firebase-functions');
const express = require('express');
const firebase = require('firebase-admin');
const app = express();
const { token, dbl } = require('./config.json');
const auth = require('./config.json');

const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(auth),
    databaseURL: "https://clashperk.firebaseio.com"
});

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

function getVotes(id) {
    const ref = database.ref();
    if (id) {
        return ref.child('votes')
            .orderByChild('user')
            .equalTo(id)
            .once('value')
            .then(snap => size(snap.val()));
    }

    return ref.child('votes')
        .once('value')
        .then(snap => size(snap.val()));
}

function size(object) {
    if (!object) return 0;
    return Object.values(object).length;
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
        if (req.query.id === '444432489818357760') return res.json({ id: req.query.id, uses: 'Infinity' });
        if (!data[req.query.id]) return res.json({ id: req.query.id, uses: 0 });
        res.json({ id: req.query.id, uses: data[req.query.id] });
    });
});

app.get('/votes/user', (req, res) => {
    getVotes(req.query.id).then(data => {
        return res.json({ id: req.query.id, votes: data });
    });
});

app.get('/votes', (req, res) => {
    getVotes().then(data => {
        return res.json({ votes: data });
    });
});

app.get('/guilds', (req, res) => {
    getGuild().then(data => {
        if (!data[req.query.id]) return res.json({ id: req.query.id, uses: 0 });
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

app.post('/dblwebhook', async (req, res) => {
    console.log(req.body);
    if (req.headers.authorization === dbl && req.body.type === 'upvote') {
        const last_voted = Date.now();
        let xp = getRandom(150, 100);
        if (req.body.isWeekend) xp *= 2;
        const data = await database.ref('ranks').child(req.body.user).once('value').then(snap => snap.val());
        if (data) {
            if (!req.body.isWeekend && (Date.now() - new Date(Number(data.last_voted))) <= 8.64e+7) xp *= 1.2;
            await database.ref('ranks').child(req.body.user).update({ xp: data.xp + Math.round(xp), last_voted });
        } else {
            await database.ref('ranks').child(req.body.user).update({ xp, last_voted });
        }
        const body = req.body;
        const earnedXP = { earnedXP: Math.round(xp) };
        await database.ref('votes').child(last_voted).update(Object.assign(body, earnedXP));
        return res.json({ method: 'POST', status: 200 });
    }

    return res.status(403).json({ status: 403 });
});

function getRandom(max, min) {
    return Math.round(Math.random() * (max - min)) + Math.round(min);
}

app.get('/patreonwebhook', (req, res) => {
    res.json({ method: 'GET', status: 200 });
});

app.post('/patreonwebhook', async (req, res) => {
    console.log(req.body);
    const body = req.body;
    const action = { action: req.headers['x-patreon-event'] };
    if (req.query.token === token) {
        switch (req.headers['x-patreon-event']) {
            case 'members:pledge:create':
                database.ref('patreon').child(Date.now()).update(Object.assign(body, action));
                break;
            case 'members:pledge:delete':
                database.ref('patreon').child(Date.now()).update(Object.assign(body, action));
                break;
            case 'members:pledge:update':
                database.ref('patreon').child(Date.now()).update(Object.assign(body, action));
                break;
        }
        return res.json({ method: 'POST', status: 200 });
    }
    return res.status(403).json({ status: 403, message: 'api key is invalid' });
});

app.get('/stats', (req, res) => {
    getStats().then(data => {
        return res.json(data);
    });
});

/* app.use((req, res) => {
    return res.redirect('/');
});*/

exports.app = functions.https.onRequest(app);
