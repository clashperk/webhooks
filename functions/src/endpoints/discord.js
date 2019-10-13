const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = (app, database) => {
	app.get('/discord', (req, res) => {
		const qs = require('querystring');
		const query = qs.stringify({
			client_id: process.env.CLIENT_ID,
			redirect_uri: process.env.REDIRECT_URI,
			permissions: 1812851905,
			response_type: 'code',
			scope: ['identify', 'bot'].join(' ')
		});

		return res.redirect(`https://discordapp.com/api/oauth2/authorize?${query}`);
	});
	app.get('/discord/callback', async (req, res) => {
		if (!req.query.code) return res.status(400).json({ message: 'No access code provided!', status: 400 });

		const data = new FormData();
		data.append('client_id', process.env.CLIENT_ID);
		data.append('client_secret', process.env.CLIENT_SECRET);
		data.append('grant_type', 'authorization_code');
		data.append('redirect_uri', process.env.REDIRECT_URI);
		data.append('scope', ['identify', 'bot'].join(' '));
		data.append('code', req.query.code);

		const response = await (await fetch('https://discordapp.com/api/oauth2/token', {
			method: 'POST',
			body: data
		})).json();

		const _res = await fetch('https://discordapp.com/api/users/@me', {
			headers: {
				authorization: `${response.token_type} ${response.access_token}`
			}
		});

		const resp = await _res.json();

		if (_res.status === 200) {
			await database.ref('logins').child(Date.now()).update(Object.assign(resp, {
				guild: req.query.guild_id || null,
				permissions: req.query.permissions || null
			}));
		}

		return res.redirect('https://clashperk.xyz');
	});
};
