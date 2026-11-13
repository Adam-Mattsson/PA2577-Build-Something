const express = require('express');
const path = require('path');
const { env } = require('process');

const app = express();

const MEDIA_CATALOG_SERVICE_URL = env.MEDIA_CATALOG_SERVICE_URL;
const SERVICE_RECOMMENDATION_SERVICE_URL =
	env.SERVICE_RECOMMENDATION_SERVICE_URL;
const PORT = env.PORT;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// --- Get ---

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/home/index.html'));
});

app.get('/collection', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/collection/collection.html'));
});

app.get('/search', async (req, res) => {
	const query = req.query.query;
	if (!query) {
		return res.status(400).json({ message: 'Missing query' });
	}
	try {
		var r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/search?query=${query}`);
	} catch (error) {
		console.error(
			`Could not fetch search results with query ${query}, error: `,
			error,
		);
		return res
			.status(500)
			.json({ message: `Could not fetch search results with query ${query}` });
	}
	if (!r.ok) {
		return res.status(500).json({
			message: `Could not fetch search results with query ${query}, error: ${r.message}`,
		});
	}
	let { message } = await r.json();
	return res.status(200).json({ message: message });
});

app.get('/stored', async (req, res) => {
	try {
		var r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/stored`);
	} catch (error) {
		console.error('Could not fetch stored media, error: ', error);
		return res.status(500).json('Could not fetch stored media');
	}
	if (!r.ok) {
		return res.status(500).json('Could not fetch stored media');
	}
	let { message } = await r.json();
	if (!message) {
		return res.status(500).json('Could not fetch stored media');
	}
	return res.status(200).json({ message: message });
});

app.get('/recommendation', async (req, res) => {
	try {
		var r = await fetch(`${SERVICE_RECOMMENDATION_SERVICE_URL}`);
	} catch (error) {
		console.error('Could not fetch recommendation, error: ', error);
		return res.status(500).json({ message: 'Could not fetch recommendation' });
	}
	if (!r.ok) {
		return res.status(500).json({ message: 'Could not fetch recommendation' });
	}
	let recommendation = await r.json();
	if (!recommendation) {
		return res.status(500).json({ message: 'Could not fetch recommendation' });
	}
	return res.status(200).json({ message: recommendation });
});

// --- POST ---

app.post('/media/save', async (req, res) => {
	const media = req.body;
	if (!media) {
		return res.status(400).json({ message: 'Missing media body' });
	}
	try {
		var r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/media/save`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(media),
		});
	} catch (error) {
		console.error('Could not save media, error: ', error);
		return res.status(500).json({ message: 'Could not save media' });
	}
	if (!r.ok) {
		return res.status(500).json({ message: 'Could not save media' });
	}
	return res.status(200).json('Media saved to collection');
});

// --- DELETE ---

app.delete('/media/remove/:media_id', async (req, res) => {
	let media_id = req.params.media_id;
	try {
		var r = await fetch(
			`${MEDIA_CATALOG_SERVICE_URL}/media/remove/${encodeURIComponent(media_id)}`,
			{
				method: 'DELETE',
			},
		);
	} catch (error) {
		console.error(
			`Could not remove media with id: ${media_id}, error: `,
			error,
		);
		return res
			.status(500)
			.json({ message: `Could not remove media with id: ${media_id}` });
	}
	if (!r.ok) {
		return res
			.status(500)
			.json({ message: `Could not remove media with id: ${media_id}` });
	}
	let message = await r.json();
	if (!message) {
		return res
			.status(500)
			.json({ message: `Could not remove media with id: ${media_id}` });
	}
	return res.status(200).json({ message: message });
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
