const https = require('https');

async function getDiscordUser(userId) {
	if (!userId) return null;
	return new Promise(resolve => {
		https.request(`https://discord.com/api/v6/users/${userId}`, {
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
}

async function webhook(embed) {
	const payload_json = JSON.stringify({
		username: 'ClashPerk',
		avatar_url: 'https://i.imgur.com/bpYiIsV.png',
		embeds: [embed]
	});
	https.request(`https://discordapp.com/api/webhooks/612211124556791808/${process.env.PATREON_WEBHOOK_TOKEN}`, {
		method: 'POST', headers: {
			'Content-Type': 'application/json'
		}
	}, res => {
		res.on('end', () => {
			console.log(res.statusCode);
		});
	}).end(payload_json);
}

async function pledgeCreate(body) {
	const patron_user = body.included.find(inc => inc.type === 'user');
	const discord_id = patron_user.attributes.social_connections &&
		patron_user.attributes.social_connections.discord &&
		patron_user.attributes.social_connections.discord.user_id;

	const { attributes } = body.data;
	if (attributes.currently_entitled_amount_cents === 0) return;

	const embed = {
		timestamp: new Date(attributes.pledge_relationship_start),
		description: [
			'**Patron**',
			`${patron_user.attributes.full_name} (${patron_user.id})`,
			'',
			'**Entitled Amount**',
			`$ ${attributes.currently_entitled_amount_cents / 100}`
		].join('\n'),
		footer: {
			text: 'Pledge Create'
		},
		color: 0xf96854
	};

	const user = await getDiscordUser(discord_id);

	if (user) {
		embed.author = {
			name: `${user.username}#${user.discriminator}`,
			icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
		};
	}

	return webhook(embed);
}

async function pledgeUpdate(body) {
	const patron_user = body.included.find(inc => inc.type === 'user');
	const discord_id = patron_user.attributes.social_connections &&
		patron_user.attributes.social_connections.discord &&
		patron_user.attributes.social_connections.discord.user_id;

	const { attributes } = body.data;

	const embed = {
		timestamp: new Date(attributes.pledge_relationship_start),
		description: [
			'**Patron**',
			`${patron_user.attributes.full_name} (${patron_user.id})`,
			'',
			'**Entitled Amount**',
			`$ ${attributes.currently_entitled_amount_cents / 100}`
		].join('\n'),
		footer: {
			text: 'Pledge Update'
		},
		color: 0x38d863
	};

	const user = await getDiscordUser(discord_id);

	if (user) {
		embed.author = {
			name: `${user.username}#${user.discriminator}`,
			icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
		};
	}

	return webhook(embed);
}

async function pledgeDelete(body) {
	const patron_user = body.included.find(inc => inc.type === 'user');
	const discord_id = patron_user.attributes.social_connections &&
		patron_user.attributes.social_connections.discord &&
		patron_user.attributes.social_connections.discord.user_id;

	const { attributes } = body.data;

	const embed = {
		timestamp: new Date(attributes.pledge_relationship_start),
		description: [
			'**Patron**',
			`${patron_user.attributes.full_name} (${patron_user.id})`,
			'',
			'**Lifetime Support**',
			`$ ${attributes.lifetime_support_cents / 100}`
		].join('\n'),
		footer: {
			text: 'Pledge Delete'
		},
		color: 0xf30c11
	};

	const user = await getDiscordUser(discord_id);

	if (user) {
		embed.author = {
			name: `${user.username}#${user.discriminator}`,
			icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
		};
	}

	return webhook(embed);
}

module.exports = (app, database) => {
	app.get('/patreonwebhook', (req, res) => {
		if (req.query.token !== process.env.PATREON) {
			return res.status(403).json({ method: 'GET', status: 403 });
		}
		return res.json({ method: 'GET', status: 200 });
	});

	app.post('/patreonwebhook', async (req, res) => {
		console.log(req.body);
		const action = { action: req.headers['x-patreon-event'] };
		if (req.query.token === process.env.PATREON) {
			switch (req.headers['x-patreon-event']) {
				case 'members:pledge:create':
					await database.ref('patreon')
						.child(Date.now())
						.update(Object.assign(req.body, action));

					await pledgeCreate(req.body);
					break;
				case 'members:pledge:delete':
					await database.ref('patreon')
						.child(Date.now())
						.update(Object.assign(req.body, action));

					await pledgeDelete(req.body);
					break;
				case 'members:pledge:update':
					await database.ref('patreon')
						.child(Date.now())
						.update(Object.assign(req.body, action));

					await pledgeUpdate(req.body);
					break;
				default: break;
			}
			return res.json({ method: 'POST', status: 200 });
		}
		return res.status(403).json({ status: 403 });
	});
};
