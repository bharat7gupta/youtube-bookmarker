(function() {

	let currentVideoId = null;
	let lastHandledVideoId = null;
	let videoBookmarks = [];
	let adCheckInterval = null;
	let wasPlayingAd = false;

	/* configs */
	const bookmarkButtonClassName = 'bookmark-button';
	const bookmarkClassName = 'bookmark';
	const bookmarkDescPrefix = 'Bookmark at ';

	/* DOM elements */
	let ytLeftControl, ytPlayer, ytProgressBar;

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
				if(ytPlayer) {
					ytPlayer.currentTime = data.value;
				}

				break;

			case 'DELETE_BOOKMARK':
				if (videoBookmarks && videoBookmarks.length > 0) {
					removePrevBookmarks();

					videoBookmarks = videoBookmarks.filter(function(b) { return b.time != data.value; });

					showVideoBookmarks(getVideoDuration());
				}

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

		ytLeftControl = document.getElementsByClassName('ytp-left-controls')[0];
		ytPlayer = document.getElementsByClassName("html5-main-video")[0];
		ytProgressBar = document.getElementsByClassName("ytp-progress-bar-container")[0];

		// check if an ad is playing. If yes, hide bookamarks and recalculate bookmark positions
		adCheckInterval = setInterval(adChecker, 1000);

		removePrevBookmarks();
		videoBookmarks = [];

		const fetchBookmarksPromise = fetchBookmarks();

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

		Promise.all([fetchBookmarksPromise, videoDurationPromise])
			.then(function(data) {
				videoBookmarks = data[0];

				showVideoBookmarks(data[1]);

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
			const bookmark = document.createElement('div');

			bookmark.id = bookmarkClassName + '-' + newBookmark.time;
			bookmark.className = bookmarkClassName + (data['hideBookmarks'] ? ' hide-bookmark' : '');
			bookmark.style.top = 0;
			bookmark.style.left = ((newBookmark.time / videoDuration) * 100) + '%';

			ytProgressBar.appendChild(bookmark);
		});
	}

	/* Show bookmark button */
	function addBookmarkButton() {
		let bookmarkButton = document.getElementsByClassName(bookmarkButtonClassName)[0];

		if (!bookmarkButton) {
			const bookmarkButton = document.createElement('img');

			bookmarkButton.src = chrome.runtime.getURL('icons/bookmark.png');
			bookmarkButton.className = 'ytp-button ' + bookmarkButtonClassName;
			bookmarkButton.title = 'Click to bookmark this moment (Ctrl + B)';

			ytLeftControl.appendChild(bookmarkButton);

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

			fetchBookmarks().then(data => {
				videoBookmarks = data;
				videoBookmarks.push(newBookmark);
				videoBookmarks = videoBookmarks.sort(function(a, b) { return a.time - b.time });
				chrome.storage.sync.set({[currentVideoId]: JSON.stringify(videoBookmarks)});
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
			addBookmark(bookmark, videoDuration);
		});
	}

	function hideAllBookmarks(hide) {
		const bookmarks = document.getElementsByClassName('bookmark');

		for(let i=0; i<bookmarks.length; i++) {
			hide ? bookmarks[i].classList.add('hide-bookmark') : bookmarks[i].classList.remove('hide-bookmark');
		}
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
