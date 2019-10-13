function size(object) {
	if (!object) return 0;
	return Object.values(object).length;
}

module.exports = (app, database) => {
	app.get('/votes/user', async (req, res) => {
		const data = await database.ref()
			.child('votes')
			.orderByChild('user')
			.equalTo(req.query.id)
			.once('value')
			.then(snap => size(snap.val()));
		return res.json({ id: req.query.id, votes: data });
	});

	app.get('/votes', async (req, res) => {
		const data = await database.ref()
			.child('votes')
			.once('value')
			.then(snap => size(snap.val()));
		return res.json({ votes: data });
	});
};
