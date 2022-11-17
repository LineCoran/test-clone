
function toRuble(price) {
    if (!price) price = '0'
    price += ''
    if (price.length === 1) { price = '00' + price }
    else if (price.length === 2) { price = '0' + price }
    else if (price.length === 0) { price = '000' }

    let intPart = price.slice(0,-2)
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function formatNumber(number) {
    if (!number) number = ''
    number += ''
    if (number.trim() === '') return 0
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

var logoSrc, bgSrc, imgCloseModal, loader;

function loadAssets() {
	logoSrc = chrome.runtime.getURL("images/logo.svg");
	bgSrc = chrome.runtime.getURL("images/bg.png");
	imgCloseModal = chrome.runtime.getURL("images/modal-close.png");
	loader = chrome.runtime.getURL("images/loader-sm-primary.svg");
	
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

function setBrandSupplierLink(product_id) {
	fetch(new Request('https://card.wb.ru/cards/detail?nm=' + product_id,
		{ method: 'GET' }
	))
	.then(res => res.json())
	.then(res => {
		if (!res || !res.hasOwnProperty('data')) return false;
		if (!res.data.hasOwnProperty('products')) return false;
		if (!Array.isArray(res.data.products)) return false;
		let card = res.data.products.filter(item => item.id === parseInt(product_id));
		if (!card.length) return false;

		var brandId = card[0].brandId;
		var brand = card[0].brand;
		var supplierId = card[0].supplierId;
		
		var brand_link = document.querySelector(`.mp-widget-brand-link[data-product-id="${ product_id }"]`)
		if (brand_link) {
			brand_link.setAttribute('href', `https://marketpapa.ru/brand?brand_id=${ brandId }&brand_name=${ encodeURIComponent(brand) }`);
		}
		
		var supplier_link = document.querySelector(`.mp-widget-supplier-link[data-product-id="${ product_id }"]`)
		if (supplier_link) {
			supplier_link.setAttribute('href', `https://marketpapa.ru/supplier?supplier_id=${ supplierId }`);
		}
	})
	.catch(error => {});
}
// seller-info__name href="/seller/126965"

function initTemplate(productId, preview, target, mpData) {

	// console.log('initTemplate')

	var period = 'month';
	var filters = ['revenue'];

	function tooltipDateFormat(val, timestamp) {
	    var d = new Date(val * 1000);
	    var day = d.getDate();
	    if (day < 10) day = '0' + day;
	    var month = d.getMonth() + 1;
	    if (month < 10) month = '0' + month;
	    return day + '.' + month + '.' + d.getFullYear();
	}

	function xAxisLabeFormatter(val, timestamp, opts) {
	    var d = new Date(val * 1000);
		var day = d.getDate();
		if (period !== 'month') return day;
		if (opts.i % 2 === 0) return '';
	    return day;
	}

	function mpFilterTemplate() {
		if (!mpData) return '';
		return `
			<div class="marketpapa-chart-filters">
				<div class="marketpapa-chart-filter-item">
					<div class="marketpapa-chart-filter marketpapa-filter-revenue` + (filters.includes('revenue') ? ' marketpapa-filter-active' : '') + `" data-filter="revenue">
						<div class="marketpapa-chart-filter-title">Выручка</div>
						<div class="marketpapa-chart-filter-value">` + toRuble(mpData.amountFbo[period]) + ` ₽</div>
					</div>
				</div>
				<div class="marketpapa-chart-filter-item">
					<div class="marketpapa-chart-filter marketpapa-filter-sales` + (filters.includes('sales') ? ' marketpapa-filter-active' : '') + `" data-filter="sales">
						<div class="marketpapa-chart-filter-title">Продажи</div>
						<div class="marketpapa-chart-filter-value">` + formatNumber(mpData.realSalesFbo[period]) + ` шт</div>
					</div>
				</div>
				<div class="marketpapa-chart-filter-item">
					<div class="marketpapa-chart-filter marketpapa-filter-sales-rate" data-filter="sales-rate">
						<div class="marketpapa-chart-filter-title">%Выкупа</div>
						<div class="marketpapa-chart-filter-value">` + Math.round(mpData.realSalesRateFbo[period]) + `</div>
					</div>
				</div>
			</div>
			<div class="marketpapa-chart-filters">
				<div class="marketpapa-chart-filter-item">
					<div class="marketpapa-chart-filter marketpapa-filter-lost-revenue` + (filters.includes('lost-revenue') ? ' marketpapa-filter-active' : '') + `" data-filter="lost-revenue">
						<div class="marketpapa-chart-filter-title">Упущ. выручка</div>
						<div class="marketpapa-chart-filter-value">` + toRuble(mpData.amountLostSalesFbo[period]) + ` ₽</div>
					</div>
				</div>
				<div class="marketpapa-chart-filter-item">
					<div class="marketpapa-chart-filter marketpapa-filter-orders` + (filters.includes('orders') ? ' marketpapa-filter-active' : '') + `" data-filter="orders">
						<div class="marketpapa-chart-filter-title">Заказы</div>
						<div class="marketpapa-chart-filter-value">` + formatNumber(mpData.salesFbo[period]) + ` шт</div>
					</div>
				</div>
				<div class="marketpapa-chart-filter-item">
					<div class="marketpapa-chart-filter marketpapa-filter-last-qty` + (filters.includes('last-qty') ? ' marketpapa-filter-active' : '') + `" data-filter="last-qty">
						<div class="marketpapa-chart-filter-title">Остаток</div>
						<div class="marketpapa-chart-filter-value">` + formatNumber(mpData.lastQtyFbo[period]) + ` шт</div>
					</div>
				</div>
			</div>
			<div class="marketpapa-chart-filters">
				<div class="marketpapa-chart-filter-item" style="margin:0;">
					<div class="marketpapa-chart-filter marketpapa-filter-price` + (filters.includes('price') ? ' marketpapa-filter-active' : '') + `" data-filter="price">
						<div class="marketpapa-chart-filter-title">История цены</div>
						<div class="marketpapa-chart-filter-value">` + toRuble(mpData.avgSalePriceMin[period]) + ` - ` + toRuble(mpData.avgSalePriceMax[period]) + ` ₽</div>
					</div>
				</div>
			</div>
		`;
	}

	function mpFooterTemplate() {
		if (!mpData) return '';
		console.log(mpData)
		var brandLink = !mpData.hasOwnProperty('brandName') ?
			'https://marketpapa.ru/find'
			: 'https://marketpapa.ru/brand?brand_name=' + encodeURIComponent(mpData.brandName);
		var supplierLink = !mpData.hasOwnProperty('supplierName') ?
			'https://marketpapa.ru/find'
			: 'https://marketpapa.ru/supplier?supplier_name=' + encodeURIComponent(mpData.supplierName);
		return `
			<div class="marketpapa-footer">
				<div class="marketpapa-footer-link">
					<a href="` + brandLink + `" target="_blank" data-product-id="${ productId }" class="mp-widget-brand-link">Аналитика по бренду</a>
				</div>
				<div class="marketpapa-footer-link">
					<a href="` + supplierLink + `" target="_blank" data-product-id="${ productId }" class="mp-widget-supplier-link">Аналитика по поставщику</a>
				</div>
				<a href="https://marketpapa.ru/item/` + productId + `" target="_blank" class="marketpapa-button marketpapa-button-primary">
					Подробная аналитика
				</a>
			</div>
		`;
	}

	function marketPapaTemplate() {
		if (!mpData) return '';
		return `
		<div class="marketpapa-wrapper">
			<div class="marketpapa-header">
				<img id="marketpapa-logo`+preview+`" src="" />
			</div>
			<div id="marketpapa-content`+preview+`" class="marketpapa-content">
				<div id="marketpapa-chart-filter-wrapper`+preview+`">` + mpFilterTemplate() + `</div>
				<div class="marketpapa-chart" id="marketpapa-chart`+preview+`"></div>
				<div class="marketpapa-buttons">
					<button class="marketpapa-button marketpapa-period-filter" data-period="month">30 дней</button>
					<button class="marketpapa-button marketpapa-period-filter marketpapa-button-outline" data-period="week">7 дней</button>
					<button class="marketpapa-button marketpapa-period-filter marketpapa-button-outline" data-period="twoWeeks">14 дней</button>
				</div>
			</div>
			` + mpFooterTemplate() + `
		</div>
		`;
	}

	var marketPapaChart = false;

	function getChartFilters() {
		if (!mpData) return false;

	    var _series = [];
	    var _colors = [];
	    var _yaxis = [];
	    var axis;
	    // console.log(mpData);
	    if (filters.includes('revenue')) {
	    	axis = mpData.revenueChart.axis;
	    	axis.labels.formatter = function(val) { return toRuble(val); };
	        _series = [ mpData.revenueChart.series ];
	        _colors = [ mpData.revenueChart.color ];
	        _yaxis = [ axis ];
	    }
	    if (filters.includes('sales')) {
	    	axis = mpData.salesChart.axis;
	    	axis.labels.formatter = function(val) { return formatNumber(val); };
	        _series = [ ..._series, mpData.salesChart.series ];
	        _colors = [ ..._colors, mpData.salesChart.color ];
	        _yaxis = [ ..._yaxis, axis ];
	    }
	    if (filters.includes('lost-revenue')) {
	    	axis = mpData.lostRevenueChart.axis;
	    	axis.labels.formatter = function(val) { return toRuble(val); };
	        _series = [ ..._series, mpData.lostRevenueChart.series ];
	        _colors = [ ..._colors, mpData.lostRevenueChart.color ];
	        _yaxis = [ ..._yaxis, axis ];
	    }
	    if (filters.includes('orders')) {
	    	axis = mpData.ordersChart.axis;
	    	axis.labels.formatter = function(val) { return formatNumber(val); };
	        _series = [ ..._series, mpData.ordersChart.series ];
	        _colors = [ ..._colors, mpData.ordersChart.color ];
	        _yaxis = [ ..._yaxis, axis ];
	    }
	    if (filters.includes('last-qty')) {
	    	axis = mpData.lastQtyChart.axis;
	    	axis.labels.formatter = function(val) { return formatNumber(val); };
	        _series = [ ..._series, mpData.lastQtyChart.series ];
	        _colors = [ ..._colors, mpData.lastQtyChart.color ];
	        _yaxis = [ ..._yaxis, axis ];
	    }
	    if (filters.includes('price')) {
	    	axis = mpData.avgSalePriceChart.axis;
	    	axis.labels.formatter = function(val) { return toRuble(val); };
	        _series = [ ..._series, mpData.avgSalePriceChart.series ];
	        _colors = [ ..._colors, mpData.avgSalePriceChart.color ];
	        _yaxis = [ ..._yaxis, axis ];
	    }

	    mpData.chartOptions.series = _series;
	    mpData.chartOptions.colors = _colors;
	    mpData.chartOptions.yaxis = _yaxis;
	    mpData.chartOptions.xaxis.labels.formatter = function(val, timestamp, opts) { return xAxisLabeFormatter(val, timestamp, opts); };
	    mpData.chartOptions.tooltip.x.formatter = function(val, timestamp) { return tooltipDateFormat(val, timestamp); };
		marketPapaChart.updateOptions(mpData.chartOptions, false, false, true);
	}

	function onFilterClick(e, item) {
		if (item.classList.contains('marketpapa-filter-active')) {
			item.classList.remove('marketpapa-filter-active');
		} else {
			item.classList.add('marketpapa-filter-active');
		}
		filters = [];
		document.querySelectorAll('#marketpapa-chart-filter-wrapper' + preview + ' .marketpapa-chart-filter.marketpapa-filter-active').forEach(function(filterItem) {
			filters.push(filterItem.getAttribute('data-filter'));
		});
		getChartFilters();
	}

	function setChartFilterListeners() {
		document.querySelectorAll('#marketpapa-chart-filter-wrapper' + preview + ' .marketpapa-chart-filter').forEach(function(item) {
			item.addEventListener('click', function(event) { onFilterClick(event, item); });
		});
	}

	function onPeriodFilterClick(e, item) {
		document.querySelectorAll('#marketpapa-content'+ preview +' .marketpapa-period-filter').forEach(function(filterItem) {
			filterItem.classList.add('marketpapa-button-outline');
		});
		item.classList.remove('marketpapa-button-outline');
		period = item.getAttribute('data-period');

		document.getElementById('marketpapa-chart-filter-wrapper' + preview).innerHTML = mpFilterTemplate();
		setChartFilterListeners();

	    mpData.revenueChart.series.data = [ ...mpData.amountFboData[period] ];
	    mpData.salesChart.series.data = [ ...mpData.realSalesFboData[period] ];
	    mpData.lostRevenueChart.series.data = [ ...mpData.amountLostSalesFboData[period] ];
	    mpData.ordersChart.series.data = [ ...mpData.salesFboData[period] ];
	    mpData.lastQtyChart.series.data = [ ...mpData.lastQtyFboData[period] ];
	    mpData.avgSalePriceChart.series.data = [ ...mpData.avgSalePriceData[period] ];

		getChartFilters();
	}

	function renderChart() {
		document.getElementById('marketpapa-chart' + preview).innerHTML = '';
		marketPapaChart = new ApexCharts(document.querySelector("#marketpapa-chart" + preview), mpData.chartOptions);
		marketPapaChart.render();
		getChartFilters();
	}

/*
	var div = document.createElement("div");
	console.log(preview)
	div.setAttribute("id", "marketpapa-widget" + preview);
	div.setAttribute("class", "marketpapa-widget");
	div.innerHTML = marketPapaTemplate();

	target.prepend(div);
*/
	target.innerHTML = marketPapaTemplate();

	setBrandSupplierLink(productId);


	setChartFilterListeners();

	document.querySelectorAll('#marketpapa-content'+ preview +' .marketpapa-period-filter').forEach(function(item) {
		item.addEventListener('click', function(event) { onPeriodFilterClick(event, item); });
	});

	// console.log(document.querySelectorAll('.marketpapa-wrapper'));

	document.getElementById("marketpapa-logo" + preview).setAttribute('src', logoSrc);

	renderChart();

}

function initCatalogTemplate(response) {
	return tpl = `
		<div class="marketpapa-catalog-item">
			<div>
				<img src="`+logoSrc+`" class="marketpapa-catalog-logo" />
			</div>
			<div class="marketpapa-catalog-item-info">
				<div class="marketpapa-catalog-info-line"><span>Выручка</span><span>` + toRuble(response.amount) + ` ₽</span></div>
				<div class="marketpapa-catalog-info-line"><span>Продажи</span><span>` + formatNumber(response.real_sales) + ` шт</span></div>
				<div class="marketpapa-catalog-info-line"><span>Остаток</span><span>` + formatNumber(response.last_qty) + ` шт</span></div>
			</div>
		</div>
	`;
}

function _initCatalog(id) {
	var card = document.querySelectorAll('.product-card[data-popup-nm-id="'+id+'"] .product-card__main');
	if (!card || card.length == 0) return false;
	// console.log('initCatalog', id)

	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-catalog-widget-" + id);
	div.setAttribute("class", "marketpapa-catalog-widget");

	var targetDiv = document.getElementById('marketpapa-catalog-widget-' + id);
	if (targetDiv && targetDiv.length > 0) {
		// console.log(targetDiv);
		targetDiv.remove();
		// document.getElementById('marketpapa-catalog-widget-' + id).innerHTML = '';
	}

	card[0].append(div);
}

var authToken = '', accessToken = '';

function initCatalog(id) {
	// console.log('get_catalog_item ' + id);
	// get_catalog_item

	chrome.runtime.sendMessage({
		msg: 'get_catalog_item_' + id,
		id: id,
		authToken: authToken,
		accessToken: accessToken
	}, function(response) {
		// console.log('get_catalog_item ' + id, response);
		_initCatalog(id);
		/*
		var initInterval = setInterval(function() {
			// clearInterval(initInterval);
			if (!document.getElementById('marketpapa-catalog-widget-' + id)) {
				console.log('----------------------');
				_initCatalog(id);
				document.getElementById('marketpapa-catalog-widget-' + id).innerHTML = initCatalogTemplate(response);
			}
		}, 300);*/
	});
/*
	_initCatalog(id);

	var initInterval = setInterval(function() {
		if (document.getElementsByClassName('marketpapa-catalog-widget').length !=
				document.querySelectorAll('#catalog-content .product-card').length) {
			_initCatalog(id);
		}
	}, 1000);*/
}

// console.log(document.cookie);

function getCookie(name) {
	const value = '; ' + document.cookie;
	const parts = value.split('; ' + name + '=');
	var cookie = '';
	if (parts.length === 2)
		cookie = parts.pop().split(';').shift();
	return cookie;
}

function isAuth() {
	var _token = getCookie('mpapa_plugin_token');
	authToken = _token;

	return _token.trim() != '' && _token.trim() != 'false';
}

function isAccessTokenExists() {
	return true;
	var _accessToken = getCookie('marketPapaAccessToken');
	accessToken = _accessToken;
	return _accessToken.trim() != '';
}

function getData(target, id) {
	// console.log('getData', id, target);
	
	chrome.runtime.sendMessage({
		msg: 'init_mp',
		id: id,
		authToken: authToken,
		accessToken: accessToken
	}, function(response) {
		// console.log(response);
		if (!response.ready) return false;

		var _target = document.getElementById('marketpapa-widget-' + id);
		if (_target) {
			initTemplate(id, '', _target, response);
		}
		/*if (target) {
			initTemplate(productId, preview, target, response);
		} else {
			var initInterval = setInterval(function() {
				if (document.getElementsByClassName('same-part-kt__delivery-advantages').length > 0) {
					clearInterval(initInterval);
					
					target = document.getElementsByClassName('same-part-kt__delivery-advantages')[0];
					console.log(target)
					initTemplate(productId, preview, target, response);
				}
			}, 1000);
		}*/
	});
}

function getToken(callback) {
	callback();
	return true;
	chrome.runtime.sendMessage({ msg: 'get_token' }, function(response) {
		accessToken = response;
    	document.cookie = "marketPapaAccessToken=" + response;
    	// console.log('getToken');
		callback();
	});
}

function checkAccess(target, id) {
	if (isAuth()) {
		if (isAccessTokenExists()) {
			// console.log('ALL READY')
			// get data and render
			getData(target, id);
		} else {
			// console.log('NO TOKEN')
			getToken(function() { getData(target, id); });

			// get data and render
		}
	} else {
		// console.log('NOT AUTH')
		// render login
	}
}

function auth(id, phone, password) {
	chrome.runtime.sendMessage({
		msg: 'auth',
		phone: phone,
		password: password
	}, function(response) {
		console.log(response);
		authToken = response;
    	document.cookie = "mpapa_plugin_token=" + response + '; path=/;';
		getToken(function() { getData(false, id); });
	});
}

function getAuthTpl(productId) {
	return `
		<div class="marketpapa-wrapper">
			<div class="marketpapa-header">
				<img id="marketpapa-logo-`+productId+`" src="" />
			</div>
			<div class="marketpapa-auth-text">
				Для получения доступа к данным<br />
				необходимо войти в аккаунт<br />
				Market Papa 
			</div>
			<div class="marketpapa-auth-form">
				<input type="text" name="phone" placeholder="Номер телефона" class="marketpapa-auth-input" />
				<input type="password" name="password" placeholder="Пароль" class="marketpapa-auth-input" />
			</div>
			<button class="marketpapa-button marketpapa-button-primary marketpapa-button-auth" data-id="`+productId+`">Войти</button>
		</div>
	`;
}

var authListener = function(event) {
	var id = event.target.getAttribute('data-id');
	var phoneTarget = document.querySelectorAll('.marketpapa-widget[data-id="' + id + '"] .marketpapa-auth-input[name="phone"]');
	var passwordTarget = document.querySelectorAll('.marketpapa-widget[data-id="' + id + '"] .marketpapa-auth-input[name="password"]');
	if (!phoneTarget || phoneTarget.length === 0 || !passwordTarget || passwordTarget.length === 0) return false;
	var phoneValue = phoneTarget[0].value;
	var passwordValue = passwordTarget[0].value;
	if (phoneValue.trim() == '' || passwordValue.trim() == '') return false;
	auth(id, phoneValue.trim(), passwordValue.trim());
}

function authClickListener() {
	document.querySelectorAll('.marketpapa-button-auth').forEach(function(item) {
		item.removeEventListener('click', authListener);
		item.addEventListener('click', authListener);
	});
}

var sizeModal;

function openModal() {
	sizeModal.style.display = "block";
	document.body.classList.add('marketpapa-widget-modal-open');
}

function closeModal() {
	sizeModal.style.display = "none";
	document.body.classList.remove('marketpapa-widget-modal-open');
}

var sizeLinkListener = function(event) {
	var sizeTable = document.getElementById('mp-size-table');
	if (sizeTable) {
		sizeTable.classList.add('mp-loader');
		sizeTable.setAttribute('style', `background-image: url(`+ loader +`);`);
		sizeTable.innerHTML = '';
	}

	openModal();

	var id = event.target.getAttribute('data-id');
	var sizeModalLink = document.getElementById('mp-size-modal-link');
	if (sizeModalLink) sizeModalLink.setAttribute('href', `https://marketpapa.ru/item/${ id }`);
	
	var sizeSwitchWrap = document.getElementById("mp-size-switch");
    if (sizeSwitchWrap) sizeSwitchWrap.setAttribute('data-active', 'left');

	chrome.runtime.sendMessage({
		msg: 'get_item_data',
		id: id,
		authToken: authToken
	}, function(response) {
		if (sizeTable) {
			sizeTable.classList.remove('mp-loader');
			sizeTable.setAttribute('style', '');
			sizeTable.innerHTML = mp_tableTemplate(mp_sizeTableColumns(true), response);
		}
	});
}

function sizeLinkClickListener() {
	document.querySelectorAll('.marketpapa-widget-size-link').forEach(function(item) {
		item.removeEventListener('click', authListener);
		item.addEventListener('click', sizeLinkListener);
	});
}

function initSizeTemplate(productId, target, popup) {
	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-widget-size-link-" + productId);
	div.setAttribute("class", `marketpapa-widget-size-link${ popup ? ' mp-size-popup-link' : ' mp-size-articul-link' }`);
	div.setAttribute("data-id", productId);
	div.setAttribute("style", "margin-top:20px;");
	div.innerHTML = `<div data-id="${ productId }">Аналитика по размеру</div>`;
	
	target[0].append(div);
	
	sizeLinkClickListener();
}

function initEmptyTemplate(productId, target) {
	var productWidget = document.getElementById("marketpapa-widget-" + productId);
	if (productWidget) productWidget.remove();
	
	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-widget-" + productId);
	div.setAttribute("class", "marketpapa-widget marketpapa-widget-auth");
	div.setAttribute("data-id", productId);
	div.setAttribute("style", "margin-top:20px;");
	div.innerHTML = getAuthTpl(productId);
	// target.prepend(div);
	target.append(div);

	authClickListener();
}

function initPopupEmptyTemplate(productId, target) {
	document.querySelectorAll('.j-product-popup .same-part-kt__delivery-advantages .marketpapa-widget')
			.forEach(function(item) {
		item.remove();
	});

	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-widget-" + productId);
	div.setAttribute("class", "marketpapa-widget marketpapa-widget-auth");
	div.setAttribute("data-id", productId);
	div.setAttribute("style", "margin-top:20px;");
	div.innerHTML = getAuthTpl(productId);
	// target.prepend(div);
	target.append(div);

	authClickListener();
}

var popupInterval = false, popupProductId;
var productInterval = false, pageProductId;

function initPopupMP(productId) {
	var _wrapper, popupTarget, _popupTarget;
	var sizeLinkTarget, _sizeLinkTarget;

	if (popupProductId != productId && popupInterval) {
		clearInterval(popupInterval);
	}
	popupProductId = productId;

	popupInterval = setInterval(function() {
		popupTarget = document.querySelectorAll('.product__info-wrap');
		_popupTarget = document.getElementById("marketpapa-widget-" + productId);
		if (popupTarget.length > 0 && !_popupTarget) {
			popupTarget = popupTarget[0];
			// console.log('popup', _popupTarget);
			initPopupEmptyTemplate(productId, popupTarget);
			document.getElementById("marketpapa-logo-" + productId).setAttribute('src', logoSrc);
			_wrapper = document.getElementsByClassName('marketpapa-wrapper');
			if (_wrapper && _wrapper.length > 0) {
				_wrapper[0].setAttribute('style', `background-image: url(`+ bgSrc +`);`);
			}

			checkAccess(popupTarget, popupProductId);
		}

		document.querySelectorAll('.mp-size-popup-link').forEach(item => item.remove());

		sizeLinkTarget = document.getElementsByClassName('product__sizes');
		_sizeLinkTarget = document.getElementById("marketpapa-widget-size-link-" + productId);
		if (sizeLinkTarget.length > 0 && !_sizeLinkTarget) {
			initSizeTemplate(productId, sizeLinkTarget, true);
		}
	}, 1000);
}

function initMP(productId) {
	var _wrapper, productTarget, _productTarget;
	var sizeLinkTarget, _sizeLinkTarget;

	if (pageProductId != productId && productInterval) {
		clearInterval(productInterval);
	}
	pageProductId = productId;

	productInterval = setInterval(function() {
		
		productTarget = document.getElementsByClassName('product-page__aside-sticky');
		// productTarget = document.getElementsByClassName('same-part-kt__delivery-advantages');
		_productTarget = document.getElementById("marketpapa-widget-" + productId);
		if (productTarget.length > 0 && !_productTarget) {
			productTarget = productTarget[0];
			// console.log('aa', _productTarget);
			initEmptyTemplate(productId, productTarget);
			document.getElementById("marketpapa-logo-" + productId).setAttribute('src', logoSrc);
			_wrapper = document.getElementsByClassName('marketpapa-wrapper');
			if (_wrapper && _wrapper.length > 0) {
				_wrapper[0].setAttribute('style', `background-image: url(`+ bgSrc +`);`);
			}

			checkAccess(productTarget, pageProductId);
		}
		
		document.querySelectorAll('.mp-size-articul-link').forEach(item => item.remove());

		sizeLinkTarget = document.getElementsByClassName('product-page__sizes-wrap');
		_sizeLinkTarget = document.getElementById("marketpapa-widget-size-link-" + productId);
		if (sizeLinkTarget.length > 0 && !_sizeLinkTarget) {
			initSizeTemplate(productId, sizeLinkTarget, false);
		}
	}, 1000);
}
/*
function initCatalogItemTemplate(productId, target) {
	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-widget-" + productId);
	div.setAttribute("class", "marketpapa-widget marketpapa-widget-auth");
	div.setAttribute("data-id", productId);
	div.innerHTML = getAuthTpl(productId);
	target.prepend(div);

	authClickListener();
}
*/
function renderCatalogWidgets(catalogIds) {
	for (var i=0; i<catalogIds.length; i++) {
		initCatalog(catalogIds[i]);
	}
}

function isDetailPage(pathname) {
	var matches = pathname.replace(/^\//, '').match(/^catalog\/\d+/g)
	if (matches && matches.length > 0) {
		var marketPapaProductId = matches[0].match(/\d+/)[0]
		return marketPapaProductId;
	}
	return false;
}

function isCatalogPage(pathname) {
	var matches = pathname.replace(/^\//, '').match(/^catalog\/[A-Za-z]/g);
	return matches && matches.length > 0;
}

var catalogIds = [];

function getCatalogIds(pathname) {
	var id, idMatch;
	document.querySelectorAll('#catalog-content .product-card').forEach(function(item) {
		id = item.getAttribute('id');
		if (id) {
			idMatch = id.match(/\d+/g);
			if (idMatch && idMatch.length > 0) {
				catalogIds.push(idMatch[0]);
			}
		}
	});
}

/*
 * START BRAND
 */
var brandId = '';
var brandName = '';
var brandData = false;

function initBrandTemplate() {
	if (!brandData)
		return false;

	var target = document.querySelectorAll('.brand-logo');
	if (!target || target.length == 0)
		return false;

	target = target[0];
	// console.log(target.outerHTML);

	var brand_tpl = `
		<div id="marketpapa-brand-widget" class="marketpapa-brand-widget">
			<div class="marketpapa-wrapper marketpapa-brand-wrapper">
				<div class="marketpapa-header">
					<img src="${ logoSrc }" alt="" />
				</div>
				<div class="marketpapa-content">
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Выручка</span>
						<span class="marketpapa-brand-value">${ toRuble(brandData.amount_real_sales_fbo_total) } ₽</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Упущ. выручка</span>
						<span class="marketpapa-brand-value">${ toRuble(brandData.amount_lost_real_sales_fbo) } ₽</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Продажи</span>
						<span class="marketpapa-brand-value">${ formatNumber(brandData.real_sales_fbo_total) } шт</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Заказы</span>
						<span class="marketpapa-brand-value">${ formatNumber(brandData.sales_fbo_total) } шт</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">% Выкупа</span>
						<span class="marketpapa-brand-value">${ brandData.real_sales_rate_fbo } %</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Средняя цена</span>
						<span class="marketpapa-brand-value">${ toRuble(brandData._avg__last_sale_price_u) } ₽</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Остаток</span>
						<span class="marketpapa-brand-value">${ formatNumber(brandData.last_qty_fbo_total) } шт</span>
					</div>
					<a href="https://marketpapa.ru/brand?brand_id=${ brandId }&brand_name=${ encodeURIComponent(brandName) }"
							target="_blank"
							class="marketpapa-button marketpapa-button-primary">
						Подробнее
					</a>
				</div>
			</div>
		</div>
	`;
	/*
	function marketPapaTemplate() {
		if (!mpData) return '';
		return `
		<div class="marketpapa-wrapper">
			<div class="marketpapa-header">
				<img id="marketpapa-logo`+preview+`" src="" />
			</div>
			<div id="marketpapa-content`+preview+`" class="marketpapa-content">
				<div id="marketpapa-chart-filter-wrapper`+preview+`">` + mpFilterTemplate() + `</div>
				<div class="marketpapa-chart" id="marketpapa-chart`+preview+`"></div>
				<div class="marketpapa-buttons">
					<button class="marketpapa-button marketpapa-period-filter" data-period="month">30 дней</button>
					<button class="marketpapa-button marketpapa-period-filter marketpapa-button-outline" data-period="week">7 дней</button>
					<button class="marketpapa-button marketpapa-period-filter marketpapa-button-outline" data-period="twoWeeks">14 дней</button>
				</div>
			</div>
			` + mpFooterTemplate() + `
		</div>
	*/
	target.innerHTML = target.outerHTML + brand_tpl;
}

function getBrandData(brand_id, brand_name) {
	chrome.runtime.sendMessage({
		msg: 'get_brand',
		brand_id: brand_id,
		brand_name: brand_name,
		authToken: authToken,
		accessToken: accessToken
	}, function(response) {
		brandData = response;
		initBrandTemplate();
	});
}

function isBrandPage(pathname) {
	var matches = pathname.replace(/^\//, '').match(/^brands\/.+/g);
	var isBrand = matches && matches.length > 0;
	if (!isBrand) return false;

	var brandsKey = matches[0].replace('brands/', '').replace(/\?.+/, '').replace(/\/.+/, '');
	// https://www.wildberries.ru/webapi/brands/data/ardanix
	fetch(new Request('https://www.wildberries.ru/webapi/brands/data/'+brandsKey,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		}
	))
	.then(res => res.json())
	.then(res => {
		if (res && res.value && res.value.data && res.value.data.model && res.value.data.model.brandInfo && res.value.data.model.brandInfo.name) {
			brandId = res.value.data.model.brandInfo.brandCod;
			brandName = res.value.data.model.brandInfo.name;
			if (isAuth()) {
				if (isAccessTokenExists()) {
					getBrandData(brandId, brandName);
				} else {
				}
			} else {
			}
		}
	})
	.catch(error => {
	});

	/*var repeats = 0;
	var brandInterval = setInterval(function() {
		var brandLogo = document.querySelectorAll('.brand-logo img');

		if (brandLogo && brandLogo.length > 0) {
			clearInterval(brandInterval);

			_brandName = brandLogo[0].getAttribute('alt');
			if (_brandName.trim() != '') {
				// brand detected
				brandName = _brandName.trim();

				if (isAuth()) {
					if (isAccessTokenExists()) {
						// console.log('ALL READY')
						// get data and render
						getBrandData(brandName);
					} else {
						// console.log('NO TOKEN')
						// getToken(function() { getData(target, id); });

						// get data and render
					}
				} else {
					// console.log('NOT AUTH')
					// render login
				}
			}
		}

		repeats += 1;
		if (repeats == 5) clearInterval(brandInterval);

	}, 1000);*/
}

/*
 * END BRAND
 */

/*
 * START SUPPLIER
 */
var supplierId = '';
var supplierName = '';
var supplierData = false;

function initSupplierTemplate() {
	if (!supplierData)
		return false;

	var target = document.querySelectorAll('.sidemenu-overflow');
	if (!target || target.length == 0)
		return false;

	target = target[0];

	var supplier_tpl = `
		<div id="marketpapa-supplier-widget" class="marketpapa-brand-widget">
			<div class="marketpapa-wrapper marketpapa-brand-wrapper">
				<div class="marketpapa-header">
					<img src="${ logoSrc }" alt="" />
				</div>
				<div class="marketpapa-content">
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Выручка</span>
						<span class="marketpapa-brand-value">${ toRuble(supplierData.amount_real_sales_fbo_total) } ₽</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Упущ. выручка</span>
						<span class="marketpapa-brand-value">${ toRuble(supplierData.amount_lost_real_sales_fbo) } ₽</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Продажи</span>
						<span class="marketpapa-brand-value">${ formatNumber(supplierData.real_sales_fbo_total) } шт</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Заказы</span>
						<span class="marketpapa-brand-value">${ formatNumber(supplierData.sales_fbo_total) } шт</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">% Выкупа</span>
						<span class="marketpapa-brand-value">${ supplierData.real_sales_rate_fbo } %</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Средняя цена</span>
						<span class="marketpapa-brand-value">${ toRuble(supplierData._avg__last_sale_price_u) } ₽</span>
					</div>
					<div class="marketpapa-brand-data-row">
						<span class="marketpapa-brand-label">Остаток</span>
						<span class="marketpapa-brand-value">${ formatNumber(supplierData.last_qty_fbo_total) } шт</span>
					</div>
					<a href="https://marketpapa.ru/supplier?supplier_id=${ supplierId }&supplier_name=${ encodeURIComponent(supplierName) }"
							target="_blank"
							class="marketpapa-button marketpapa-button-primary">
						Подробнее
					</a>
				</div>
			</div>
		</div>
	`;
	target.innerHTML = supplier_tpl + target.outerHTML;
}

function getSupplierData(supplier_id, supplier_name) {
	chrome.runtime.sendMessage({
		msg: 'get_supplier',
		supplier_id: supplier_id,
		supplier_name: supplier_name,
		authToken: authToken,
		accessToken: accessToken
	}, function(response) {
		supplierData = response;
		initSupplierTemplate();
	});
}

function isSupplierPage(pathname) {
	var matches = pathname.replace(/^\//, '').match(/^seller\/.+/g);
	var isSupplier = matches && matches.length > 0;
	if (!isSupplier) return false;

	var sellerId = matches[0].replace('seller/', '').replace(/\?.+/, '').replace(/\/.+/, '');
	fetch(new Request('https://www.wildberries.ru/webapi/seller/data/'+sellerId,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		}
	))
	.then(res => res.json())
	.then(res => {
		if (res && res.value && res.value.data && res.value.data.model && res.value.data.model.sellerInfo && res.value.data.model.sellerInfo.name) {
			supplierId = res.value.data.model.sellerInfo.id;
			supplierName = res.value.data.model.sellerInfo.name;
			if (isAuth()) {
				if (isAccessTokenExists()) {
					getSupplierData(supplierId, supplierName);
				} else {
				}
			} else {
			}
		}
	})
	.catch(error => {
	});
}

/*
 * END SUPPLIER
 */

loadAssets();

mp_sizeModal();

var mpLocation = document.location.pathname;
// product page
var prevProductId = '',
	productId = isDetailPage(mpLocation);
if (productId) {
	prevProductId = productId;
	initMP(productId);
}

// check brand on init
isBrandPage(mpLocation);

// check supplier on init
isSupplierPage(mpLocation);

var mpPreviewWrap, mpPreviewId, _mpPreviewId, _mpPrevieMatches;

var checkLocationInterval = setInterval(function() {

	// listen product quick view popup
	mpPreviewWrap = document.querySelectorAll('.product__header.j-product-title');
	if (mpPreviewWrap.length > 0) {
		_mpPreviewId = mpPreviewWrap[0].getAttribute('href');

		_mpPrevieMatches = _mpPreviewId.match(/catalog\/\d+/g)
		if (_mpPrevieMatches && _mpPrevieMatches.length > 0) {
			_mpPreviewId = _mpPrevieMatches[0].match(/\d+/)[0]

			if (_mpPreviewId != mpPreviewId) {
				initPopupMP(_mpPreviewId);
			}
			mpPreviewId = _mpPreviewId;
		}
	}

	if (document.location.pathname != mpLocation) {
		mpLocation = document.location.pathname;
		// listen product page
		productId = isDetailPage(mpLocation);
		if (productId) {
			var widgets = document.getElementsByClassName('marketpapa-widget');
			for (var i=0; i<widgets.length; i++) {
				widgets[i].remove();
			}
			initMP(productId);
		}

		// listen brand page
		isBrandPage(mpLocation);

		// listen supplier page
		isSupplierPage(mpLocation);
	}

	// listen catalog page
	if (isCatalogPage(mpLocation) && catalogIds.length === 0
			|| document.location.pathname != mpLocation) {
		getCatalogIds(mpLocation);
		if (catalogIds.length > 0) {
			chrome.runtime.sendMessage({
				msg: 'get_catalog_items',
				id: catalogIds,
				authToken: authToken,
				accessToken: accessToken
			}, function(response) {
				// console.log('get_catalog_items', response);
			});
			// TODO // renderCatalogWidgets(catalogIds);
		}
	}

	// переход из товара в каталог - не рендерит
}, 1000);
