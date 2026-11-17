const express = require('express');
const path = require('path');
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

function filter_flatrate(offers) {
	let flatrate_services = [];
	for (let offer of offers) {
		if (offer['type'].find('FLATRATE') !== undefined) {
			flatrate_services.push(offer);
		}
	}
	return flatrate_services;
}

function consolidate_duplicates(offers) {
	let services = {};
	for (let offer of offers) {
		if (services.keys().find(offer['name']) === undefined) {
			services[offer['name']] = { url: offer['url'] };
		}
	}
	return services;
}

function get_services(offers) {
	let flaterate_offers = filter_flatrate(offers);
	let services = consolidate_duplicates(flaterate_offers);
	return services;
}

app.get('/', (req, res) => {
	let collection = get_stored_media();
	let service_coverage = {};
	try {
		for (let media of collection) {
			let media_services = get_services(media['offers']);
			for (let [service, data] of Object.entries(media_services)) {
				if (service_coverage.keys().find(service) === undefined) {
					service_coverage[service] = {
						media: [
							{
								title: media['title'],
								url: data['url'],
							},
						],
						count: 1,
						total: len(collection),
					};
				} else {
					service_coverage[service]['media'].append({
						title: media['title'],
						url: data['url'],
					});
					service_coverage[service]['count'] += 1;
				}
			}
		}
	} catch (error) {
		return res.status(500).json({});
	}

	// Extract the dict and sort into a list descending with the coverage percentage
	//TODO Continue here
});

app.listen(PORT);
