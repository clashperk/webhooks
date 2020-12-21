const https = require('https');

function getRandom(max, min) {
	return Math.round(Math.random() * (max - min)) + Math.round(min);
}

module.exports = (app, database) => {
	app.get('/dblwebhook', (req, res) => {
		if (req.headers.authorization !== process.env.DBL) {
			return res.status(403).json({ method: 'GET', status: 403 });
		}
		return res.json({ method: 'GET', status: 200 });
	});

	app.post('/dblwebhook', async (req, res) => {
		console.log(req.body);
		if (req.headers.authorization === process.env.DBL && req.body.type === 'upvote') {
			const last_voted = Date.now();
			let xp = getRandom(150, 100);
			if (req.body.isWeekend) xp *= 2;
			const data = await database.ref('ranks').child(req.body.user).once('value')
				.then(snap => snap.val());
			if (data) {
				if (!req.body.isWeekend && (Date.now() - new Date(Number(data.last_voted))) <= 8.64e+7) xp *= 1.2;
				await database.ref('ranks').child(req.body.user).update({ xp: data.xp + Math.round(xp), last_voted });
			} else {
				await database.ref('ranks').child(req.body.user).update({ xp, last_voted });
			}
			const earnedXP = { earnedXP: Math.round(xp) };
			await database.ref('votes').child(last_voted).update(Object.assign(req.body, earnedXP));
			try {
				const user = await new Promise(resolve => {
					https.request(`https://discord.com/api/v6/users/${req.body.user}`, {
						method: 'GET', headers: {
							'Authorization': `Bot ${process.env.BOT_TOKEN}`,
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
				https.request(`https://discordapp.com/api/webhooks/611560024895913985/${process.env.WEBHOOK_TOKEN}`, {
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
};
