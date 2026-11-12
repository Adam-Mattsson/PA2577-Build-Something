import { createMediaElements } from '../helper.js';

let mediaCollection = [];
let recommendation = [];
const MEDIA_COLLECTION = document.getElementById('media-collection');
const RECOMMENDATION_LIST = document.getElementById('recommendation-list');

function updateMediaCollection() {
	MEDIA_COLLECTION.replaceChildren();
	let mediaElements = createMediaElements(mediaCollection);
	for (let i = 0; i < mediaElements.length; i++) {
		// Remove the checkbox
		let checkbox = mediaElements[i].querySelector('input[name=selected_media]');
		mediaElements[i].removeChild(checkbox);
		checkbox.remove();
		// Add Remove X
		let deleteDiv = document.createElement('div');
		deleteDiv.className = 'media-delete';
		deleteDiv.textContent = 'X';
		deleteDiv.dataset.id = mediaCollection[i].id;
		mediaElements[i].append(deleteDiv);
	}
	MEDIA_COLLECTION.append(...mediaElements);
}

async function getCollection() {
	const requestOptions = {
		method: 'GET',
	};
	const r = await fetch('/stored', requestOptions);
	if (!r.ok) {
		console.error('Could not fetch stored media');
		return;
	}
	mediaCollection = (await r.json())['message'];
}

async function getRecommendation() {
	const requestOptions = {
		method: 'GET',
	};
	const r = await fetch('/recommendation', requestOptions);
	if (!r.ok) {
		console.error('Could not fetch service recommendation');
		return;
	}
	recommendation = (await r.json())['message'];
}

// Check every time we click if we press the delete button remove the card and from the users collection
document.addEventListener('click', async (event) => {
	let deleteButton = event.target.closest('.media-delete');
	if (!deleteButton) return; // If we pressed anything other than the delete button then we resume
	event.preventDefault();
	let response = await fetch(
		`/media/remove/${encodeURIComponent(deleteButton.dataset.id)}`,
		{ method: 'DELETE' },
	);
	if (response.ok) {
		// Remove corresponding card
		deleteButton.closest('.media-option').remove();
	}
	await load_recommendation();
});

function updateRecommendationElements() {
	// Update the recommendation-list HTML element
	RECOMMENDATION_LIST.replaceChildren(); // Remove old children
	for (let i = 0; i < recommendation.length; i++) {
		let service = recommendation[i];

		let service_content = document.createElement('div'); // Holder for service information
		let hidden_details = document.createElement('details'); // Dropdown / hidden info with the medias covered
		let summary = document.createElement('summary');
		summary.className = 'streaming-summary';
		summary.textContent = `${i + 1}. ${service.service}: ${service.count}/${service.total} titles`;
		let progress_bar = document.createElement('progress'); // Progress coverage
		progress_bar.value = service.count;
		progress_bar.max = service.total;

		let media_list = document.createElement('ul');
		for (let media of service.media) {
			let li = document.createElement('li');
			let a = document.createElement('a');
			a.href = media.url; // Url to the media on the service
			a.target = '_blank'; // Open link on new page
			a.textContent = media.title; // Show only the title of the media as the href
			li.appendChild(a);
			media_list.appendChild(li);
		}
		summary.appendChild(progress_bar);
		hidden_details.appendChild(summary);
		hidden_details.appendChild(media_list);
		service_content.appendChild(hidden_details);
		RECOMMENDATION_LIST.appendChild(service_content);
	}
}

async function load_recommendation() {
	await getRecommendation();
	updateRecommendationElements();
}

async function init() {
	await getCollection();
	updateMediaCollection();
	await load_recommendation();
}

await init();
