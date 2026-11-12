import { createMediaElements } from '../helper.js';

let queriedMedia = []; // Result from search query
let prevQuery = '';
const MEDIA_SELECTION = document.getElementById('media-selection-holder');
const SAVE_STATUS = document.getElementById('save-status');
const QUERY_FORM = document.getElementById('search-form');
const SAVE_FORM = document.getElementById('save');

function updateMediaSelection() {
	MEDIA_SELECTION.replaceChildren();
	let mediaElements = createMediaElements(queriedMedia);
	MEDIA_SELECTION.append(...mediaElements);
}

SAVE_FORM.addEventListener('submit', async function (e) {
	// Prevent moving from page
	e.preventDefault();
	// Get all selected movies
	if (!SAVE_FORM.elements.selected_media) return;
	SAVE_STATUS.textContent = 'Saving...';
	const selectedMediaIds = [...SAVE_FORM.elements.selected_media]
		.filter((field) => field.checked)
		.map((field) => field.id);
	const selectedMedia = queriedMedia.filter((movie) =>
		selectedMediaIds.includes(String(movie.id)),
	);
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(selectedMedia),
	};
	const r = await fetch('/media/save', requestOptions);
	if (r.ok) {
		SAVE_STATUS.textContent = 'Saved to collection';
	} else {
		SAVE_STATUS.textContent = 'Count not save';
	}
	const result = await r.json();
	// Clear status information after 5 seconds
	setTimeout(() => (SAVE_STATUS.textContent = ''), 5000);
});

QUERY_FORM.addEventListener('submit', async function (e) {
	e.preventDefault();
	const data = Object.fromEntries(new FormData(QUERY_FORM));
	const query = data.query;
	if (typeof query !== 'string') {
		return;
	}
	if (query.trim() === '') {
		return;
	}
	if (prevQuery === query) return; // If the query is the same do not fetch the same result
	const requestOptions = {
		method: 'GET',
	};
	const r = await fetch(
		`/search?query=${encodeURIComponent(query)}`,
		requestOptions,
	);
	if (!r.ok) {
		console.error('Could not search media');
		return;
	}
	prevQuery = query;
	queriedMedia = (await r.json())['message'];
	updateMediaSelection();
});
