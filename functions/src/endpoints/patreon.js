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
					await database.ref('patreon').child(Date.now()).update(Object.assign(req.body, action));
					break;
				case 'members:pledge:delete':
					await database.ref('patreon').child(Date.now()).update(Object.assign(req.body, action));
					break;
				case 'members:pledge:update':
					await database.ref('patreon').child(Date.now()).update(Object.assign(req.body, action));
					break;
				default: break;
			}
			return res.json({ method: 'POST', status: 200 });
		}
		return res.status(403).json({ status: 403 });
	});
};
