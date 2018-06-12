const textarea = document.getElementById('text');
const insertButton = document.getElementById('insert');

textarea.focus();

function sendText() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { data: textarea.value });
	});
}

insertButton.addEventListener('click', (e) => {
	sendText();
});

textarea.addEventListener('keydown', (e) => {
	if (e.ctrlKey && e.keyCode == 13) {
		sendText();
		e.preventDefault();
	}
});
