const express = require('express');
const path = require('path');
const { env } = require('process');

const app = express();

MEDIA_CATALOG_SERVICE_URL = env.MEDIA_CATALOG_SERVICE_URL;
SERVICE_RECOMMENDATION_SERVICE_URL = env.SERVICE_RECOMMENDATION_SERVICE_URL;
PORT = env.PORT;

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
	let r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/search?query=${query}`);
	if (!r.ok) {
		return res.status(500).json({
			message: `Could not fetch search results with query ${query}, error: ${r.message}`,
		});
	}
	let { message } = await r.json();
	return res.status(200).json({ message: message });
});

app.get('/stored', async (req, res) => {
	let r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/stored`);
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
	let r = await fetch(`${SERVICE_RECOMMENDATION_SERVICE_URL}`);
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
	let r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/media/save`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(media),
	});
	if (!r.ok) {
		return res.status(500).json({ message: 'Could not save media' });
	}
	return res.status(200).json('Media saved to collection');
});

// --- DELETE ---

app.delete('/media/remove/:media_id', async (req, res) => {
	let media_id = req.params.media_id;
	let r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/media/remove/${media_id}`, {
		method: 'DELETE',
	});
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
