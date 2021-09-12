const functions = require('firebase-functions');
const router = require('express').Router();
const https = require('https');

const DISCORD_WEBHOOK_URL = functions.config().webhook.top_gg;
const SECRET = functions.config().webhook.secret;
const BOT_TOKEN = functions.config().bot.token;

router.get('/voting', (req, res) => res.json({ method: 'GET', status: 200 }));

router.post('/voting', async (req, res) => {
	if (req.headers.authorization === SECRET && req.body.type === 'upvote') {
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

			if (!user) return functions.logger.warn('User not found!');

			https.request(DISCORD_WEBHOOK_URL, {
				method: 'POST', headers: {
					'Content-Type': 'application/json'
				}
			}, res => {
				res.on('end', () => {
					console.log(res.statusCode);
				});
			}).end(JSON.stringify({
				username: 'ClashPerk',
				avatar_url: 'https://i.imgur.com/bpYiIsV.png',
				embeds: [
					{
						author: {
							name: `${user.username}#${user.discriminator}`,
							icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
						},
						footer: {
							text: 'Just Voted!'
						},
						timestamp: new Date()
					}
				]
			}));
		} catch {
			return res.status(500).json({ method: 'POST', status: 500 });
		}
		return res.json({ method: 'POST', status: 200 });
	}

	return res.status(403).json({ status: 403 });
});

module.exports = router;

