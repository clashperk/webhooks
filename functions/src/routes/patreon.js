const functions = require('firebase-functions');
const router = require('express').Router();
const https = require('https');

const DISCORD_WEBHOOK_URL = functions.config().webhook.url;
const SECRET = functions.config().webhook.secret;
const BOT_TOKEN = functions.config().bot.token;

router.get('/patreon', (req, res) => res.json({ method: 'GET', status: 200 }));

router.post('/patreon', async (req, res) => {
	if (req.query.token === SECRET) {
		switch (req.headers['x-patreon-event']) {
			case 'members:pledge:create':
				await pledgeCreate(req.body);
				break;
			case 'members:pledge:delete':
				await pledgeDelete(req.body);
				break;
			case 'members:pledge:update':
				await pledgeUpdate(req.body);
				break;
			default: break;
		}
		return res.json({ method: 'POST', status: 200 });
	}
	return res.status(403).json({ status: 403 });
});

async function getDiscordUser(userId) {
	if (!userId) return null;
	return new Promise(resolve => {
		https.request(`https://discord.com/api/v6/users/${userId}`, {
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
				if (res.statusCode === 200) {
					resolve(JSON.parse(raw));
				} else {
					resolve(null);
				}
			});
		}).end();
	});
}

async function executeWebhook(embed) {
	https.request(DISCORD_WEBHOOK_URL, {
		method: 'POST', headers: {
			'Content-Type': 'application/json'
		}
	}, res => {
		res.on('end', () => {
			console.log(res.statusCode);
		});
	}).end(JSON.stringify({ embeds: [embed] }));
}

async function pledgeCreate(body) {
	const patron = body.included?.find(inc => inc.type === 'user');
	const discordId = patron?.attributes?.social_connections?.discord.user_id;

	const { attributes } = body.data;
	if (attributes.currently_entitled_amount_cents === 0) return;

	const embed = {
		timestamp: new Date(attributes.pledge_relationship_start),
		description: [
			'**Patron**',
			`${patron.attributes.full_name} (${patron.id})`,
			'',
			'**Entitled Amount**',
			`$ ${attributes.currently_entitled_amount_cents / 100}`
		].join('\n'),
		footer: { text: 'Pledge Create' },
		color: 0xf96854
	};

	const user = await getDiscordUser(discordId);

	if (user) {
		embed.author = {
			name: `${user.username}#${user.discriminator} (${user.id})`,
			icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
		};
	}

	return executeWebhook(embed);
}

async function pledgeUpdate(body) {
	const patron = body.included?.find(inc => inc.type === 'user');
	const discordId = patron?.attributes?.social_connections?.discord.user_id;

	const { attributes } = body.data;

	const embed = {
		timestamp: new Date(attributes.pledge_relationship_start),
		description: [
			'**Patron**',
			`${patron.attributes.full_name} (${patron.id})`,
			'',
			'**Entitled Amount**',
			`$ ${attributes.currently_entitled_amount_cents / 100}`
		].join('\n'),
		footer: { text: 'Pledge Update' },
		color: 0x38d863
	};

	const user = await getDiscordUser(discordId);

	if (user) {
		embed.author = {
			name: `${user.username}#${user.discriminator} (${user.id})`,
			icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
		};
	}

	return executeWebhook(embed);
}

async function pledgeDelete(body) {
	const patron = body.included?.find(inc => inc.type === 'user');
	const discordId = patron?.attributes?.social_connections?.discord.user_id;

	const { attributes } = body.data;

	const embed = {
		timestamp: new Date(attributes.pledge_relationship_start),
		description: [
			'**Patron**',
			`${patron.attributes.full_name} (${patron.id})`,
			'',
			'**Lifetime Support**',
			`$ ${attributes.lifetime_support_cents / 100}`
		].join('\n'),
		footer: { text: 'Pledge Delete' },
		color: 0xf30c11
	};

	const user = await getDiscordUser(discordId);

	if (user) {
		embed.author = {
			name: `${user.username}#${user.discriminator} (${user.id})`,
			icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
		};
	}

	return executeWebhook(embed);
}

module.exports = router;
