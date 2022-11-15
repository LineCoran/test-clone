function mp_switchTemplate(id, options, callback) {
	var bg = chrome.runtime.getURL("images/switch.png");

	var div = document.createElement("div");
	div.setAttribute("id", id);
	div.setAttribute("class", "mp-switch");
	div.setAttribute("style", "margin-top:20px;");
	div.setAttribute("data-active", "left");
	div.innerHTML = `
        <div class="mp-switch-text mp-switch-text-left">${ options.left.text }</div>
        <div class="mp-switch-icon" style="background-image: url(${ bg });">
        </div>
        <div class="mp-switch-text mp-switch-text-right">${ options.right.text }</div>
    `;

	div.onclick = function() {
        var active = div.getAttribute('data-active');
        div.setAttribute("data-active", active === "left" ? 'right' : 'left');
		callback(active === "left" ? options.right : options.left);
	}

    return div;
}