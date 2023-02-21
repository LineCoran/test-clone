function mp_loadAssets() {
	var logoSrc = chrome.runtime.getURL("images/logo.svg");
	var bgSrc = chrome.runtime.getURL("images/bg.png");
	var imgCloseModal = chrome.runtime.getURL("images/modal-close.png");
	var loader = chrome.runtime.getURL("images/loader-sm-primary.svg");
	var iconChevronDown = chrome.runtime.getURL("images/icon-chevron-down.svg");
	var iconInfoHovered = chrome.runtime.getURL("images/icon-info-hovered.svg");
	var iconOrder = chrome.runtime.getURL("images/icon-order.svg");
	var iconSale = chrome.runtime.getURL("images/icon-sale.svg");
	
	var assets = {
		logoSrc,
		bgSrc,
		imgCloseModal,
		loader,
        iconChevronDown,
        iconInfoHovered,
        iconOrder,
        iconSale
	};
	window.marketPapaWidget = {
		...window.marketPapaWidget,
		images: assets
	};

	var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = `
	    @font-face {
			font-family: 'Montserrat';
		    src: url("` + chrome.runtime.getURL('fonts/montserrat/Montserrat-SemiBold.ttf') + `");
		    font-weight: 600;
		    font-style: normal;
		}
		@font-face {
		    font-family: 'Montserrat';
		    src: url("` + chrome.runtime.getURL('fonts/montserrat/Montserrat-Medium.ttf') + `");
		    font-weight: 500;
		    font-style: normal;
		}
		@font-face {
		    font-family: 'Montserrat';
		    src: url("` + chrome.runtime.getURL('fonts/montserrat/Montserrat-Regular.ttf') + `");
		    font-weight: 400;
		    font-style: normal;
		}
    `;
	document.head.appendChild(fa);
}
