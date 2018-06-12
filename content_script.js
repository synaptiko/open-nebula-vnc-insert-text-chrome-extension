function injectScript(code, ...args) {
	const script = document.createElement('script');
	script.textContent = typeof code === 'function' ? `(${code})(${args.map((arg) => JSON.stringify(arg)).join(', ')});` : code;
	(document.head || document.documentElement).appendChild(script);
	script.remove();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	injectScript(text => window.__sendTextToVNC(text), request.data)
});
chrome.runtime.sendMessage({ contentScriptTabId: true });

injectScript(() => {
	let rfbInstance;

	const origSetTimeout = window.setTimeout;

	window.setTimeout = function(fn, timeout) {
		if (timeout === 4) {
			const origUtilSetDefaults = window.Util.set_defaults;

			window.Util.set_defaults = function(obj) {
				if (obj instanceof window.RFB) {
					rfbInstance = obj;
					window._rfb = obj;
				}
				origUtilSetDefaults.apply(window.Util, arguments);
			}
		}
		origSetTimeout.apply(window, arguments);
	};

	window.__sendTextToVNC = function (text) {
		if (rfbInstance) {
			const data = [];
			const shiftChar = 65505;

			for (let i = 0; i < text.length; i += 1) {
				let c = text.charCodeAt(i);
				const toShiftedChar = ('!@#$%^&*()_+{}:\"<>?~|'.indexOf(text[i]) !== -1)

				if (text[i] === '\n') {
					c = 65421
				}

				if (toShiftedChar) {
					data.push(...RFB.messages.keyEvent(shiftChar, 1))
				}
				data.push(...RFB.messages.keyEvent(c, 1))
				data.push(...RFB.messages.keyEvent(c, 0))
				if (toShiftedChar) {
					data.push(...RFB.messages.keyEvent(shiftChar, 0))
				}
			}

			rfbInstance._sock.send(data);
		}
	}
});
