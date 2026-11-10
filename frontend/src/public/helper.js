function createMediaElement(media) {
	let holder = document.createElement('label');
	holder.className = 'media-option';

	let checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.name = 'selected_media';
	checkbox.value = '';
	checkbox.id = media.id;

	let poster = document.createElement('img');
	poster.src = media.photo_url[0];
	poster.alt = media.title;
	poster.className = 'media-poster';

	let infoHolder = document.createElement('span');
	infoHolder.className = 'media-info';

	let title = document.createElement('span');
	title.className = 'media-title';
	title.textContent = media.title;

	let year = document.createElement('span');
	year.className = 'media-year';
	year.textContent = `Year: ${media.year}`;

	let type = document.createElement('span');
	type.className = 'media-type';
	type.textContent = `Media: ${media.type}`;

	infoHolder.appendChild(title);
	infoHolder.appendChild(year);
	infoHolder.appendChild(type);

	holder.appendChild(checkbox);
	holder.appendChild(poster);
	holder.appendChild(infoHolder);
	return holder;
}

export function createMediaElements(media_collection) {
	let created = [];
	for (let media of media_collection) {
		created.push(createMediaElement(media));
	}
	return created;
}
