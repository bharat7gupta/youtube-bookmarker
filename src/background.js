
/** Event listener to listen to url changes and notify to content script */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete' && tab.url.indexOf('youtube.com') != -1 && tab.status == 'complete') {
		const queryParams = tab.url.split('?')[1];
		const urlParams = new URLSearchParams(queryParams);

		chrome.tabs.sendMessage(tabId, { type: 'NEW_VIDEO', videoId: urlParams.get('v') });
	}
});
