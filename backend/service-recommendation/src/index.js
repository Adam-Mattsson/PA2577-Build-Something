const express = require('express');
const { env } = require('process');

const MEDIA_CATALOG_SERVICE_URL = env.MEDIA_CATALOG_SERVICE_URL;
const PORT = env.PORT;

const app = express();

async function get_stored_media() {
	let r = await fetch(`${MEDIA_CATALOG_SERVICE_URL}/stored`);
	if (!r.ok) {
		console.error('Could not fetch stored media');
		return [];
	}
	let media = await r.json();
	return media['message'];
}

// First step of the service filtering process
// Filter to only include offers with a "FLATRATE*" cost type
function filter_flatrate(offers) {
	return offers.filter((offer) => offer['type']?.includes('FLATRATE'));
}

// Second step of the service filtering process
// Merge duplicates and create dict structure
function consolidate_duplicates(offers) {
	let services = {};
	for (let offer of offers) {
		if (!(offer['name'] in services)) {
			services[offer['name']] = { url: offer['url'] };
		}
	}
	return services;
}

function get_services(offers) {
	let flatrate_offers = filter_flatrate(offers ?? []);
	return consolidate_duplicates(flatrate_offers);
}

app.get('/', async (req, res) => {
	let service_coverage = {};
	try {
		let collection = await get_stored_media();
		for (let media of collection) {
			let media_services = get_services(media['offers']);
			for (let [service, data] of Object.entries(media_services)) {
				if (!(service in service_coverage)) {
					service_coverage[service] = {
						media: [],
						count: 0,
						total: collection.length,
					};
				}
				service_coverage[service]['media'].push({
					title: media['title'],
					url: data['url'],
				});
				service_coverage[service]['count'] += 1;
			}
		}
	} catch (error) {
		console.error('Could not calculate recommendation, error: ', error);
		return res
			.status(500)
			.json({ message: 'Problem occured when calculating recommendation' });
	}

	// Extract the dict and sort into a list descending with the coverage percentage
	let sorted_services = Object.entries(service_coverage)
		.map(([service, data]) => ({ service, ...data }))
		.sort((a, b) => b.count - a.count);
	return res.status(200).json({ message: sorted_services });
});

app.listen(PORT);
