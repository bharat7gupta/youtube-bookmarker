
let currentVideoId;
let currentBookmarks = [];
const noBookmarksHTML = '<i class="row">No bookmarks</i>';
const APP_PREFIX = 'ytbmr';

function onSearchTextChange(e) {
	const searchTerm = e.target.value.toLowerCase();
	const filteredBookmarks = currentBookmarks.filter(function(bookmark) {
		return bookmark.desc.toLowerCase().indexOf(searchTerm) > -1;
	});

	showBookmarks(filteredBookmarks);
}

function onHideBookmarkCheckBoxClick(e) {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		const activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, { type: 'HIDE_BOOKMARKS', value: e.target.checked });

		chrome.storage.sync.set({ 'hideBookmarks': e.target.checked });
	});
}

function onLoopItemCheckBoxClick(e) {
	const loopCheckboxes = document.getElementsByClassName('loop-between-bookmarks-checkbox');
	const enableLoopCheckbox = document.getElementById('loop-bookmarks-checkbox');
	const selectedLoopCheckboxes = [...loopCheckboxes].filter(lc => lc.checked);

	if (selectedLoopCheckboxes.length === 2) {
		enableLoopCheckbox.disabled = false;
		[...loopCheckboxes].forEach(lc => lc.disabled = !lc.checked);
	} else {
		enableLoopCheckbox.checked = false;
		enableLoopCheckbox.disabled = true;
		[...loopCheckboxes].forEach(lc => lc.disabled = false);
	}
}

function onLoopBookmarkCheckBoxClick(e) {
	const loopCheckboxes = document.getElementsByClassName('loop-between-bookmarks-checkbox');
	const messageType = e.target.checked ? 'START_LOOP_BETWEEN_BOOKMARKS' : 'STOP_LOOP_BETWEEN_BOOKMARKS';

	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		const activeTab = tabs[0];
		const [startTime, endTime] = [...loopCheckboxes].filter(lc => lc.checked).map(lc => lc.parentNode.getAttribute('data-time')).sort();

		const loopData = { startTime, endTime, isLooping: e.target.checked };
		window.localStorage.setItem(`${APP_PREFIX}-loop-data`, JSON.stringify(loopData));

		chrome.tabs.sendMessage(activeTab.id, { type: messageType, startTime, endTime });
	});
}

function showBookmarks(bookmarks) {
	const bookmarksElement = document.getElementById("bookmarks");
	bookmarksElement.innerHTML = ''; // clear prev list

	if (bookmarks && bookmarks.length > 0) {
		bookmarks.forEach(function(bookmark) {
			addBookmarkDetailRow(bookmarksElement, bookmark);
		});
	}
	else {
		bookmarksElement.innerHTML = noBookmarksHTML;
	}
}

function addBookmarkDetailRow(bookmarksElement, bookmark) {
	const bookmarkElement = document.createElement('div');
	bookmarkElement.id = 'bookmark-'+bookmark.time;
	bookmarkElement.className = 'bookmark';
	bookmarkElement.setAttribute('data-time', bookmark.time);

	// bookmark loop data
	const loopData = window.localStorage.getItem(`${APP_PREFIX}-loop-data`);
	const { startTime, endTime } = JSON.parse(loopData) ?? {};

	// loop between bookmarks checkbox
	const loopPoints = document.createElement('input');
	loopPoints.type = 'checkbox';
	loopPoints.className = 'loop-between-bookmarks-checkbox';
	loopPoints.addEventListener('change', onLoopItemCheckBoxClick);
	loopPoints.checked = bookmark.time === Number(startTime) || bookmark.time === Number(endTime);
	loopPoints.disabled = !loopPoints.checked;

	// time element
	const timeElement = document.createElement('div');
	timeElement.textContent = getFormattedTime(bookmark.time);
	timeElement.className = 'bookmark-time';

	// bookmark description element
	const bookmarkDesc = document.createElement('div');
	bookmarkDesc.textContent = bookmark.desc;
	bookmarkDesc.className = 'bookmark-desc';

	// bookmark controls - edit bookmark description, play from bookmark, copy link
	const bookmarkControls = document.createElement('div');
	const editBookmarkDesc = document.createElement('img');
	const playFromBookmark = document.createElement('img');
	const copyBookmarkLink = document.createElement('img');
	const deleteBookmark = document.createElement('img');
	
	editBookmarkDesc.src = 'icons/edit.png';
	playFromBookmark.src = 'icons/play.png';
	copyBookmarkLink.src = 'icons/copy-link.png';
	deleteBookmark.src = 'icons/delete.png';

	editBookmarkDesc.title = 'Edit bookmark description';
	playFromBookmark.title = 'Start play from bookmark';
	copyBookmarkLink.title = 'Copy bookmark link';
	deleteBookmark.title = 'Delete bookmark';

	editBookmarkDesc.addEventListener('click', onEditBookmarkDescClick);
	playFromBookmark.addEventListener('click', onPlayFromBookmarkClick);
	copyBookmarkLink.addEventListener('click', onCopyBookmarkLinkClick);
	deleteBookmark.addEventListener('click', onDeleteBookmarkClick);

	bookmarkControls.className = 'bookmark-controls';

	bookmarkControls.appendChild(editBookmarkDesc);
	bookmarkControls.appendChild(playFromBookmark);
	bookmarkControls.appendChild(copyBookmarkLink);
	bookmarkControls.appendChild(deleteBookmark);
	
	bookmarkElement.appendChild(loopPoints);
	bookmarkElement.appendChild(timeElement);
	bookmarkElement.appendChild(bookmarkDesc);
	bookmarkElement.appendChild(bookmarkControls);

	bookmarksElement.appendChild(bookmarkElement);
}

function onEditBookmarkDescClick(e) {
	const editDescButton = e.target;
	const bookmarkElem = editDescButton.parentNode.parentNode;
	const bookmarkDesc = bookmarkElem.getElementsByClassName('bookmark-desc')[0];
	const editingAttr = editDescButton.getAttribute('data-editing');
	const isEditing = !editingAttr || editingAttr == "false";

	if(bookmarkDesc) {
		if (isEditing) { // editing
			const bookmarkDescText = bookmarkDesc.innerHTML;
			bookmarkDesc.innerHTML = '';
			editDescButton.src = 'icons/save.png';

			const descEditTextBox = document.createElement('input');
			descEditTextBox.className = 'textbox mini-textbox';
			descEditTextBox.value = bookmarkDescText;
			descEditTextBox.addEventListener('keypress', function(e) {
				e.keyCode === 13 && saveEditedBookmarkDesc(bookmarkElem, bookmarkDesc, editDescButton);
			});

			setTimeout(function() {descEditTextBox.select()}); // select textbox text

			// set editing attribute
			editDescButton.setAttribute('data-editing', true);

			bookmarkDesc.appendChild(descEditTextBox);
		}
		else { // saving
			saveEditedBookmarkDesc(bookmarkElem, bookmarkDesc, editDescButton);
		}
	}
}

function saveEditedBookmarkDesc(bookmarkElem, bookmarkDesc, editDescButton) {
	const newBookmarkDesc = bookmarkDesc.getElementsByTagName('input')[0].value;
	editDescButton.setAttribute('data-editing', false);
	editDescButton.src = 'icons/edit.png';
	bookmarkDesc.innerHTML = newBookmarkDesc;

	// save
	const editedBookmarkTime = bookmarkElem.getAttribute('data-time');
	const editedBookmark = currentBookmarks.filter(function(b) { return b.time == editedBookmarkTime })[0];
	editedBookmark.desc = newBookmarkDesc;
	chrome.storage.sync.set({[currentVideoId]: JSON.stringify(currentBookmarks)});
}

function onPlayFromBookmarkClick(e) {
	const bookmarkTime = e.target.parentNode.parentNode.getAttribute('data-time');

	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		const activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, { type: 'PLAY_FROM_BOOKMARK', value: bookmarkTime });
	});
}

function onCopyBookmarkLinkClick(e) {
	const bookmarkTime = e.target.parentNode.parentNode.getAttribute('data-time');
	const url = `https://www.youtube.com/watch?v=${currentVideoId}&t=${bookmarkTime}`;

	navigator.clipboard.writeText(url);
}

function onDeleteBookmarkClick(e) {
	const bookmarkTime = e.target.parentNode.parentNode.getAttribute('data-time');

	// delete bookmark from popup
	const bookmarkElemToDelete = document.getElementById('bookmark-'+bookmarkTime);
	bookmarkElemToDelete.parentNode.removeChild(bookmarkElemToDelete);

	// send message to delete bookmark from page
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		const activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, { type: 'DELETE_BOOKMARK', value: bookmarkTime });
	});

	// save
	currentBookmarks = currentBookmarks.filter(function(b) { return b.time != bookmarkTime; });
	chrome.storage.sync.set({[currentVideoId]: JSON.stringify(currentBookmarks)});
}

document.addEventListener("DOMContentLoaded", function() {
	const searchBox = document.getElementById("search-box");
	const hideBookmarkCheckBox = document.getElementById("hide-bookmarks-checkbox");
	const loopBookmarkCheckBox = document.getElementById("loop-bookmarks-checkbox");

	// bookmark loop data
	const loopData = window.localStorage.getItem(`${APP_PREFIX}-loop-data`);
	const { isLooping } = JSON.parse(loopData) ?? {};
	loopBookmarkCheckBox.checked = isLooping;
	loopBookmarkCheckBox.disabled = !isLooping;

	// add event listeners
	searchBox && searchBox.addEventListener("keyup", onSearchTextChange);
	hideBookmarkCheckBox && hideBookmarkCheckBox.addEventListener('change', onHideBookmarkCheckBoxClick);
	loopBookmarkCheckBox && loopBookmarkCheckBox.addEventListener('change', onLoopBookmarkCheckBoxClick);

	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		const activeTab = tabs[0];
		const queryParams = activeTab.url.split('?')[1];
		const urlParams = new URLSearchParams(queryParams);
		currentVideoId = urlParams.get('v');

		if (activeTab.url.indexOf('youtube.com') > -1 && currentVideoId) {
			chrome.storage.sync.get([ currentVideoId ], function(data) {
				currentBookmarks = data[currentVideoId] ? JSON.parse(data[currentVideoId]) : [];
				showBookmarks(currentBookmarks);
			});

			chrome.storage.sync.get('hideBookmarks', function(data) {
				hideBookmarkCheckBox.checked = data['hideBookmarks'] || false;
			});
		}
		else {
			const container = document.getElementsByClassName('container')[0];
			container.innerHTML = noBookmarksHTML;
		}
	});
});
