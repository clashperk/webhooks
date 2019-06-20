const Clans = require('../models/clans');

const api = async function(request, response, next) {
	if (request.headers.api_key !== process.env.API_KEY) {
		return response.status(400).json({ message: 'missing authorization' });
	}

	const guild = request.query.guild;
	const tag = request.query.tag;

	if (!guild || !tag) {
		return response.status(400).json({ message: 'guild and tag parameters are missing' });
	}

	const data = await Clans.findOne({ where: { guild, tag } });

	if (!data) {
		return response.status(400).json({ message: 'not found' });
	}
	return response.status(200).json(data);
};

module.exports = api;
