chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.contentScriptTabId) {
		chrome.pageAction.show(sender.tab.id);
	}
});
