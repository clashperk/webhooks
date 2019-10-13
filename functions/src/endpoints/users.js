module.exports = (app, database) => {
	app.get('/users', async (req, res) => {
		const data = await database.ref('users')
			.once('value')
			.then(snap => snap.val());
		if (!data[req.query.id]) return res.json({ id: req.query.id, uses: 0 });
		return res.json({ id: req.query.id, uses: data[req.query.id] });
	});
};
