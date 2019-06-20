const Sequelize = require('sequelize');

const db = new Sequelize(process.env.POSTGRES, { logging: false });

class Database {
	static get db() {
		return db;
	}
}

module.exports = Database;
