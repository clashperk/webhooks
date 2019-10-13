module.exports = (app, database) => {
	app.get('/commands', async (req, res) => {
		if (req.query.token !== process.env.TOKEN && req.headers.token !== process.env.TOKEN) {
			return res.json({ status: 403 });
		}

		const data = await database.ref('commands')
			.once('value')
			.then(snap => snap.val());
		return res.json(data);
	});
};
