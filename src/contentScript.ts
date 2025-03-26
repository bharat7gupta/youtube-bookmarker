import { getFormattedTime } from './common';
import { Bookmark, LoopData } from './types/bookmark';

(function() {

	const APP_PREFIX = 'ytbmr';

	let currentVideoId = null;
	let lastHandledVideoId = null;
	let videoBookmarks: Bookmark[] = [];
	let adCheckInterval = null;
	let wasPlayingAd = false;
	let loopData: LoopData = {} as LoopData;
	let lastModifiedByVideoId: any;

	/* configs */
	const bookmarkButtonClassName = 'bookmark-button';
	const bookmarkClassName = 'ct-bookmark';
	const loopSectionClassName = 'ct-bookmarks-loop';
	const bookmarkDescPrefix = 'Bookmark at ';
	const hideBookmarkClassName = 'ct-hide-bookmark';
	const bookmarkReactionClassName = 'ct-bookmark-reaction';

	/* DOM elements */
	let ytRightControls, ytPlayer, ytProgressBar;

	/* respond to messages from background or popup pages */
	chrome.runtime.onMessage.addListener(function(data) {
		switch(data.type) {
			case 'NEW_VIDEO':
				currentVideoId = data.videoId;
				if (currentVideoId && lastHandledVideoId !== currentVideoId) {
					onNewVideoLoad(false);
				}

				break;
			case 'HIDE_BOOKMARKS':
				hideAllBookmarks(data.value);
				
				break;
			case 'PLAY_FROM_BOOKMARK':
				playFrom(data.value);

				break;

			case 'DELETE_BOOKMARK':
				if (videoBookmarks && videoBookmarks.length > 0) {
					removePrevBookmarks();

					videoBookmarks = videoBookmarks.filter(function(b) { return b.time != data.value; });

					showVideoBookmarks(getVideoDuration());
				}

				break;
			case 'START_LOOP_BETWEEN_BOOKMARKS':
				loopData = data;
				initLoopEvent();
				playFrom(data.startTime);
				highlightLoopSection();
				break;
			case 'STOP_LOOP_BETWEEN_BOOKMARKS':
				loopData = {} as LoopData;
				ytPlayer && ytPlayer.removeEventListener('timeupdate', loopBetweenBookmarks);
				removeLoopSectionHighlight();
				break;
			case 'ADD_REACTION':
				const bookmarkId = bookmarkClassName + '-' + data.value.time
				const bookmarkElement = document.getElementById(bookmarkId);

				// clear previous children
				while (bookmarkElement.firstChild) {
					bookmarkElement.firstChild.remove();
				}

				addBookmarkReaction(bookmarkElement, data.value.reaction);
				break;
			default:
				break;
		}
	});

	/* on refresh */
	currentVideoId = getQueryParam('v');

	if (currentVideoId) {
		onNewVideoLoad(true);
	}

	/* On new video load */
	function onNewVideoLoad(isRefresh) {

		ytRightControls = document.getElementsByClassName('ytp-right-controls')[0];
		ytPlayer = document.getElementsByClassName("html5-main-video")[0];
		ytProgressBar = document.getElementsByClassName("ytp-progress-bar-container")[0];

		// check if an ad is playing. If yes, hide bookamarks and recalculate bookmark positions
		adCheckInterval = setInterval(adChecker, 1000);

		removePrevBookmarks();
		videoBookmarks = [];

		const bookmarksPromise = fetchBookmarks();
		
		const lastModifiedPromise = fetchLastModifiedData();

		const videoDurationPromise = new Promise(function(resolve) {
			function getPlayTime() {
				ytPlayer.removeEventListener('playing', getPlayTime);
				resolve(getVideoDuration());
			}

			if (isRefresh) {
				resolve(getVideoDuration());
			} else {
				ytPlayer.addEventListener('playing', getPlayTime);
			}
		});

		Promise.all([bookmarksPromise, lastModifiedPromise, videoDurationPromise])
			.then(function(data: any) {
				videoBookmarks = data[0];
				lastModifiedByVideoId = data[1];

				showVideoBookmarks(data[2]);
				initLoopSectionIfAny();

				addBookmarkButton();
			});

		ytPlayer.addEventListener('playing', function() {
			if(adCheckInterval === null) {
				adCheckInterval = setInterval(adChecker, 1000);
			}
		});

		// clear ad checker interval script when video is paused or has ended
		ytPlayer.addEventListener('ended', clearAdCheckerInterval);
		ytPlayer.addEventListener('pause', clearAdCheckerInterval);

		lastHandledVideoId = currentVideoId;
	}

	/********** UI functions ***********/

	/* Show a bookmark in video progress bar */
	function addBookmark(newBookmark) {
		chrome.storage.sync.get('hideBookmarks', function(data) {
			const videoDuration = getVideoDuration();
			const bookmarkElement = document.createElement('div');

			bookmarkElement.id = bookmarkClassName + '-' + newBookmark.time;
			bookmarkElement.className = bookmarkClassName + (data['hideBookmarks'] ? ` ${hideBookmarkClassName}` : '');
			bookmarkElement.style.left = ((newBookmark.time / videoDuration) * 100) + '%';

			addBookmarkReaction(bookmarkElement, newBookmark.reaction);

			ytProgressBar.appendChild(bookmarkElement);
		});
	}

	function addBookmarkReaction(bookmarkElement, reaction) {
		if (bookmarkElement && reaction) {
			const bookmarkReactionElement = document.createElement('div');
			bookmarkReactionElement.className = bookmarkReactionClassName;
			bookmarkReactionElement.innerText = reaction;
			bookmarkElement.appendChild(bookmarkReactionElement);
		}
	}

	/* Show bookmark button */
	function addBookmarkButton() {
		let bookmarkButton = document.getElementsByClassName(bookmarkButtonClassName)[0];

		if (!bookmarkButton) {
			const bookmarkButton = document.createElement('img');

			bookmarkButton.src = chrome.runtime.getURL('icons/bookmark.png');
			bookmarkButton.className = 'ytp-button ' + bookmarkButtonClassName;
			bookmarkButton.title = 'Click to bookmark this moment (Ctrl + B)';

			ytRightControls.prepend(bookmarkButton);

			bookmarkButton.addEventListener('click', newBookmarkAddEventHandler);
		}
	}

	/* Handle request to add new bookmark */
	function newBookmarkAddEventHandler() {
		if (isPlayingAd()) {
			return;
		}

		const currentTime = getCurrentTime();

		if (currentTime) {
			const newBookmark = { time: currentTime, desc: bookmarkDescPrefix + getFormattedTime(currentTime) };

			addBookmark(newBookmark);

			chrome.runtime.sendMessage({ type: 'BOOKMARK_ADDED', time: currentTime });

			fetchBookmarks().then((data: Bookmark[]) => {
				const isDuplicate = data.some(d => d.time === newBookmark.time);

				if (isDuplicate) {
					return;
				}

				videoBookmarks = data;
				videoBookmarks.push(newBookmark);
				videoBookmarks = videoBookmarks.sort(function(a, b) { return a.time - b.time });
				chrome.storage.sync.set({[currentVideoId]: JSON.stringify(videoBookmarks)});
				lastModifiedByVideoId = {
					...lastModifiedByVideoId,
					[currentVideoId]: Date.now()
				};
				chrome.storage.sync.set({ 'lastModifiedByVideoId': JSON.stringify(lastModifiedByVideoId)});
			});
		}
	}

	/* Fetch all bookmarks for current video */
	function fetchBookmarks() {
		return new Promise(function(resolve) {
			// get all bookmarks for current video and create bookmark elements
			chrome.storage.sync.get([ currentVideoId ], function(data) {
				resolve(data[currentVideoId] ? JSON.parse(data[currentVideoId]) : [])
			});
		});
	}

	/* Fetch metadata across all videos. This is added to store more info for 
		each bookmarked video and also preserve backward compatibility */
	function fetchLastModifiedData() {
		return new Promise(function(resolve) {
			// get last modified data for each video
			chrome.storage.sync.get('lastModifiedByVideoId', function(data) {
				resolve(data.lastModifiedByVideoId ? JSON.parse(data.lastModifiedByVideoId) : {});
			});
		});
	}

	/* Clear out all previous bookmarks */
	function removePrevBookmarks() {
		// remove bookmarks from previous video
		const prevBookmarks = document.getElementsByClassName(bookmarkClassName);

		while(prevBookmarks[0]) {
			prevBookmarks[0].parentNode.removeChild(prevBookmarks[0]);
		}
	}

	function adChecker() {
		if(isPlayingAd()) {
			hideAllBookmarks(true);
			wasPlayingAd = true;
		}
		else {
			if(wasPlayingAd) {
				removePrevBookmarks();
				showVideoBookmarks(getVideoDuration());
				wasPlayingAd = false;
			}
		}
	}

	/* Show all bookmarks */
	function showVideoBookmarks(videoDuration) {
		ytProgressBar && videoBookmarks.forEach(function(bookmark) {
			addBookmark(bookmark);
		});
	}

	function hideAllBookmarks(hide) {
		const bookmarks = document.getElementsByClassName(bookmarkClassName);
		const loopSections = document.getElementsByClassName(loopSectionClassName);
		const addOrRemoveClass = (elem) => hide 
			? elem.classList.add(hideBookmarkClassName) 
			: elem.classList.remove(hideBookmarkClassName);

		Array.from(bookmarks).forEach(addOrRemoveClass);
		Array.from(loopSections).forEach(addOrRemoveClass);
	}

	/********* YouTube player functions *********/

	/* get current video's duration */
	function getVideoDuration() {
		if (ytPlayer) {
			return parseInt(ytPlayer.duration);
		}

		return null;
	}

	/* Get current player time */
	function getCurrentTime() {
		if (ytPlayer) {
			return parseInt(ytPlayer.currentTime);
		}

		return null;
	}

	function loopBetweenBookmarks() {
		const [startTime, endTime] = [loopData.startTime, loopData.endTime].map(Number);

		if(ytPlayer.currentTime >= startTime && parseInt(ytPlayer.currentTime, 10) === endTime) {
			ytPlayer.currentTime = startTime;
		}
	}

	function playFrom(time: number) {
		if(ytPlayer) {
			ytPlayer.currentTime = time;
		}
	}

	function initLoopEvent () {
		ytPlayer && ytPlayer.addEventListener('timeupdate', loopBetweenBookmarks);
	}

	function highlightLoopSection() {
		// clear previous highlight
		removeLoopSectionHighlight();

		chrome.storage.sync.get('hideBookmarks', function(data) {
			const videoDuration = getVideoDuration();
			const loopSection = document.createElement('div');

			loopSection.className = loopSectionClassName + (data['hideBookmarks'] ? ` ${hideBookmarkClassName}` : '');
			loopSection.style.left = ((loopData.startTime / videoDuration) * 100) + '%';
			loopSection.style.right = (100 - ((loopData.endTime / videoDuration) * 100)) + '%';

			ytProgressBar.appendChild(loopSection);
		});
	}

	function removeLoopSectionHighlight() {
		const loopSections = Array.from(document.getElementsByClassName(loopSectionClassName));
		loopSections.forEach((loopSection) => loopSection.parentNode.removeChild(loopSection));
	}

	function initLoopSectionIfAny() {
		if (currentVideoId) {
			chrome.storage.sync.get(['loopData'], function(data) {
				if (!data['loopData']) return;

				const savedLoopData = JSON.parse(data['loopData']) ?? {};
				loopData = savedLoopData[currentVideoId];
				const { startTime, isLooping } = loopData;

				if (isLooping) {
					initLoopEvent();
					playFrom(startTime);
					highlightLoopSection();
				}
			});
		}
	}

	/* Check if ad is playing */
	function isPlayingAd() {
		const adOverlay = document.getElementsByClassName('ytp-ad-player-overlay')[0];
		return !!adOverlay;
	}

	/* clear ad checker interval script */
	function clearAdCheckerInterval() {
		clearInterval(adCheckInterval);
		adCheckInterval = null;
	}

	/*********  Utility functions *********/

	/* get query param from browser url */
	function getQueryParam(key) {
		const urlParams = new URLSearchParams(location.search);

		return urlParams.get(key);
	}

	// setup hot keys
	function hotKeyHandler(e) {
		// Command + B as hotkey for bookmark
		if (e.ctrlKey && (e.keyCode === 66 || e.keyCode === 91)) {
			newBookmarkAddEventHandler();
		}
	}

	// register the handler 
	document.addEventListener('keyup', hotKeyHandler, false);

})();
