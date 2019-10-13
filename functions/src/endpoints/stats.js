module.exports = (app, database) => {
	app.get('/stats', async (req, res) => {
		const data = await database.ref('stats')
			.once('value')
			.then(snap => snap.val());
		return res.json(data);
	});
};
