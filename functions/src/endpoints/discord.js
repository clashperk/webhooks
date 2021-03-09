const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = app => {
	app.get('/discord', (req, res) => {
		const qs = require('querystring');
		const query = qs.stringify({
			client_id: process.env.CLIENT_ID,
			redirect_uri: process.env.REDIRECT_URI,
			// permissions: 1812851905,
			response_type: 'code',
			scope: ['identify', 'guilds'].join(' ')
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
		data.append('scope', ['identify', 'guilds'].join(' '));
		data.append('code', req.query.code);

		const response = await (await fetch('https://discordapp.com/api/oauth2/token', {
			method: 'POST',
			body: data
		})).json();

		const user = await fetch('https://discordapp.com/api/users/@me', {
			headers: {
				authorization: `${response.token_type} ${response.access_token}`
			}
		}).then(res => res.json());

		const guilds = await fetch('https://discordapp.com/api/v7/users/@me/guilds', {
			headers: {
				Authorization: `Bearer ${response.access_token}`
			}
		}).then(res => res.json());

		return res.json({ user, guilds, total_guilds: guilds && guilds.length });
	});
};
