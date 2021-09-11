const functions = require('firebase-functions');
const router = require('express').Router();
const https = require('https');

function getRandom(max, min) {
	return Math.round(Math.random() * (max - min)) + Math.round(min);
}

const DISCORD_WEBHOOK_URL = functions.config().webhook.url;
const SECRET = functions.config().webhook.secret;
const BOT_TOKEN = functions.config().bot.token;

router.get('/voting', (req, res) => {
	if (req.headers.authorization !== SECRET) {
		return res.status(403).json({ method: 'GET', status: 403 });
	}
	return res.json({ method: 'GET', status: 200 });
});

router.post('/voting', async (req, res) => {
	if (req.headers.authorization === SECRET && req.body.type === 'upvote') {
		const last_voted = Date.now();
		let xp = getRandom(150, 100);
		if (req.body.isWeekend) xp *= 2;
		if (data) {
			if (!req.body.isWeekend && (Date.now() - new Date(Number(data.last_voted))) <= 8.64e+7) xp *= 1.2;
		}
		const earnedXP = { earnedXP: Math.round(xp) };
		try {
			const user = await new Promise(resolve => {
				https.request(`https://discord.com/api/v6/users/${req.body.user}`, {
					method: 'GET', headers: {
						'Authorization': `Bot ${BOT_TOKEN}`,
						'Content-Type': 'application/json'
					}
				}, res => {
					let raw = '';
					res.on('data', chunk => {
						raw += chunk;
					});
					res.on('end', () => {
						console.log(raw);
						if (res.statusCode === 200) {
							resolve(JSON.parse(raw));
						} else { resolve(null); }
					});
				}).end();
			});

			if (!user) return;
			const payload_json = JSON.stringify({
				username: 'ClashPerk',
				avatar_url: 'https://i.imgur.com/bpYiIsV.png',
				embeds: [
					{
						author: {
							name: `${user.username}#${user.discriminator}`,
							icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
						},
						footer: {
							text: `Received ${earnedXP.earnedXP} XP`
						},
						color: 0x38d863,
						timestamp: new Date()
					}
				]
			});
			https.request(DISCORD_WEBHOOK_URL, {
				method: 'POST', headers: {
					'Content-Type': 'application/json'
				}
			}, res => {
				res.on('end', () => {
					console.log(res.statusCode);
				});
			}).end(payload_json);
		} catch { }
		return res.json({ method: 'POST', status: 200 });
	}

	return res.status(403).json({ status: 403 });
});

module.exports = router;

