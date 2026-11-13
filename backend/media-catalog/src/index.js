const express = require('express');
const path = require('path');
const { env } = require('process');
const DB = require('./db.js');
const { setTimeout } = require('timers/promises');

const SEARCH_SERVICE_URL = env.SEARCH_SERVICE_URL;
const PORT = env.PORT;
const DB_HOST = env.DB_HOST;
const DB_NAME = env.DB_NAME;
const DB_USER = env.DB_USER;
const DB_PASSWORD = env.DB_PASSWORD;

const app = express();
const db = new DB(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD);
const DB_RETRY = 10; // The amount of times the system will be allowed to retry setting up the db

app.use(express.json());

app.get('/search', async (req, res) => {
	let query = req.query.query;
	try {
		var r = await fetch(
			`${SEARCH_SERVICE_URL}/justwatch?q=${encodeURIComponent(query)}&L=en_IN`,
		);
	} catch (error) {
		console.error('Could not fetch search result, error: ', error);
		return res.status(400).json({ message: 'Could not fetch search result' });
	}
	if (!r.ok) {
		console.error(r.message);
		return res.status(400).json({ message: 'Could not fetch search result' });
	}
	let data = await r.json();
	if (!data.hasOwnProperty('description')) {
		console.error(r.message);
		return res.status(400).json({ message: 'Could not fetch search result' });
	}
	// Media information is received under "description" tag in request
	return res.status(200).json({ message: data['description'] });
});

app.post('/media/save', async (req, res) => {
	let media = req.body;
	if (media.length === 0)
		return res.status(400).json({ message: 'Empty body' });
	try {
		await db.insert(media);
		return res.status(200).json({ message: 'Media saved' });
	} catch (error) {
		console.error('Could not save media, error: ', error);
		return res.status(500).json({ message: 'Could not save media' });
	}
});

app.get('/stored', async (req, res) => {
	try {
		let media = await db.get_media();
		return res.status(200).json({ message: media });
	} catch (error) {
		console.error('Could not fetch media, error: ', error);
		return res.status(500).json({ message: 'Could not fetch media' });
	}
});

app.delete('/media/remove/:media_id', async (req, res) => {
	let media_id = req.params.media_id;
	try {
		let media = await db.remove(media_id);
		return res.status(200).json({ message: 'Media deleted from collection' });
	} catch (error) {
		console.error(
			`Could not delete media with id: ${media_id}, error: `,
			error,
		);
		return res
			.status(500)
			.json({ message: `Could not delete media with id: ${media_id}` });
	}
});

app.listen(PORT);

async function startup() {
	let retry = 0;
	while (retry < DB_RETRY) {
		try {
			await db.init();
			break;
		} catch (error) {
			console.error('Could not connect to DB, retrying');
			retry += 1;
			await setTimeout(2000); // Sleep 2 seconds between retries
		}
	}
}
startup();
