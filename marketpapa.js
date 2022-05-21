
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

var logoSrc, bgSrc;

function loadAssets() {
	logoSrc = chrome.runtime.getURL("images/logo.svg");
	bgSrc = chrome.runtime.getURL("images/bg.png");
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
		// console.log(mpData)
		var brandLink = !mpData.hasOwnProperty('brandName') ?
			'https://marketpapa.ru/find'
			: 'https://marketpapa.ru/brand?brand_name=' + encodeURIComponent(mpData.brandName);
		var supplierLink = !mpData.hasOwnProperty('supplierName') ?
			'https://marketpapa.ru/find'
			: 'https://marketpapa.ru/supplier?supplier_name=' + encodeURIComponent(mpData.supplierName);
		return `
			<div class="marketpapa-footer">
				<div class="marketpapa-footer-link">
					<a href="` + brandLink + `" target="_blank">Аналитика по бренду</a>
				</div>
				<div class="marketpapa-footer-link">
					<a href="` + supplierLink + `" target="_blank">Аналитика по поставщику</a>
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
		// _initCatalog(id);
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
	var _token = getCookie('marketPapaToken');
	authToken = _token;

	return _token.trim() != '';
}

function isAccessTokenExists() {
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
		// console.log(response);
		authToken = response;
    	document.cookie = "marketPapaToken=" + response;
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

function initEmptyTemplate(productId, target) {
	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-widget-" + productId);
	div.setAttribute("class", "marketpapa-widget marketpapa-widget-auth");
	div.setAttribute("data-id", productId);
	div.innerHTML = getAuthTpl(productId);
	target.prepend(div);

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
	div.innerHTML = getAuthTpl(productId);
	target.prepend(div);

	authClickListener();
}

var popupInterval = false, popupProductId;
var productInterval = false, pageProductId;

function initPopupMP(productId) {
	var _wrapper, popupTarget, _popupTarget;

	if (popupProductId != productId && popupInterval) {
		clearInterval(popupInterval);
	}
	popupProductId = productId;

	popupInterval = setInterval(function() {
		popupTarget = document.querySelectorAll('.j-product-popup .same-part-kt__delivery-advantages');
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

	}, 1000);
}

function initMP(productId) {
	var _wrapper, productTarget, _productTarget;

	if (pageProductId != productId && productInterval) {
		clearInterval(productInterval);
	}
	pageProductId = productId;

	productInterval = setInterval(function() {
		productTarget = document.getElementsByClassName('same-part-kt__delivery-advantages');
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
		// initCatalog(catalogIds[i]);
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

loadAssets();

var mpLocation = document.location.pathname;

// product page
var prevProductId = '',
	productId = isDetailPage(mpLocation);
if (productId) {
	prevProductId = productId;
	initMP(productId);
}

var mpPreviewWrap, mpPreviewId, _mpPreviewId, _mpPrevieMatches;

var checkLocationInterval = setInterval(function() {

	// listen product quick view popup
	mpPreviewWrap = document.querySelectorAll('.same-part-kt__header.j-product-title');
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

	// listen product page
	if (document.location.pathname != mpLocation) {
		mpLocation = document.location.pathname;
		productId = isDetailPage(mpLocation);
		if (productId) {
			var widgets = document.getElementsByClassName('marketpapa-widget');
			for (var i=0; i<widgets.length; i++) {
				widgets[i].remove();
			}
			initMP(productId);
		}
	}

	// listen catalog page
	if (isCatalogPage(mpLocation) && catalogIds.length === 0
			|| document.location.pathname != mpLocation) {
		getCatalogIds(mpLocation);
		if (catalogIds.length > 0) renderCatalogWidgets(catalogIds);
	}
}, 1000);

// переход из товара в каталог - не рендерит