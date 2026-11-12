const { Pool } = require('pg');

class DB {
	constructor(host, database, user, password) {
		this.pool = new Pool({
			host: host,
			database: database,
			user: user,
			password: password,
		});
	}
	async init() {
		await this.pool.query(`
      CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      type TEXT,
      title TEXT,
      year INTEGER,
      runtime INTEGER,
      photo_url JSONB,
      offers JSONB
    )`);
	}
	async insert(media) {
		let formatted_media = media.map((m) => ({
			...m,
			offers: JSON.stringify(m['offers']),
			photo_url: JSON.stringify(m['photo_url']),
		}));
		formatted_media.forEach(async (m) => {
			await this.pool.query(
				`
        INSERT INTO media (id, type, title, year, runtime, photo_url, offers) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING
        `,
				[m.id, m.type, m.title, m.year, m.runtime, m.photo_url, m.offers],
			);
		});
	}
	async remove(media_id) {
		await this.pool.query(`DELETE FROM media WHERE id = $1`, [media_id]);
	}
	async get_media() {
		let r = await this.pool.query(`SELECT * FROM media`);
		return r.rows;
	}
}

module.exports = DB;
