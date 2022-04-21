var marketPapaProductId;
var mpData = false;
var period = 'month';
var filters = ['revenue'];

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
			<a href="https://marketpapa.ru/item/` + marketPapaProductId + `" target="_blank" class="marketpapa-button marketpapa-button-detail">
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
			<img id="marketpapa-logo" src="" />
		</div>
		<div class="marketpapa-content">
			<div id="marketpapa-chart-filter-wrapper">` + mpFilterTemplate() + `</div>
			<div class="marketpapa-chart" id="marketpapa-chart"></div>
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
/*
var revenueChart = {
	color: '#3dbf9b',
	series: {},
	axis: {
		show: false,
	    labels: {
	        style: { colors: '#3dbf9b' },
	        offsetX: 0,
	        formatter: function(val) {
	            return val / 100
	        },
	    },
	    axisBorder: { show: false },
	    axisTicks: { show: false }
	}
};
var salesChart = {
	color: '#e96a87',
	series: {},
	axis: {
		show: false,
	    labels: {
	        style: { colors: '#e96a87' },
	        offsetX: 0,
	        formatter: function(val) {
	            return val
	        },
	    },
	    axisBorder: { show: false },
	    axisTicks: { show: false }
	}
};
var lostRevenueChart = {
	color: '#e19f52',
	series: {},
	axis: {
		show: false,
	    labels: {
	        style: { colors: '#e19f52' },
	        offsetX: 0,
	        formatter: function(val) {
	            return val / 100
	        },
	    },
	    axisBorder: { show: false },
	    axisTicks: { show: false }
	}
};
var ordersChart = {
	color: '#fdde3b',
	series: {},
	axis: {
		show: false,
	    labels: {
	        style: { colors: '#fdde3b' },
	        offsetX: 0,
	        formatter: function(val) {
	            return val
	        },
	    },
	    axisBorder: { show: false },
	    axisTicks: { show: false }
	}
};
var lastQtyChart = {
	color: '#6170ff',
	series: {},
	axis: {
		show: false,
	    labels: {
	        style: { colors: '#6170ff' },
	        offsetX: 0,
	        formatter: function(val) {
	            return val
	        },
	    },
	    axisBorder: { show: false },
	    axisTicks: { show: false }
	}
};
*/
var marketPapaChart = false;
var logoSrc;
/*
var chartOptions = {
	series: [],
    grid: {
        show: true,
        position: 'back',
        xaxis: {
            lines: { show: true }
        },
        yaxis: {
            lines: { show: true }
        }
    },
    chart: {
        id: 'apexchart',
        type: 'area',
        height: 134,
        parentHeightOffset: 0,
        toolbar: { show: false }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 1 },
    colors: ['#3dbf9b'], // , '#e96a87', '#e19f52', '#fdde3b', '#6170ff'
	fill: { type: 'solid' },
    markers: {
        size: 3,
        strokeWidth: 0,
        hover: { size: 3 }
    },
    yaxis: [ revenueChart.axis ], // , salesAxis, lostRevenueAxis, ordersAxis, lastQtyAxis
    xaxis: {
        type: 'datetime',
        tickAmount: 'dataPoints',
        labels: {
            rotate: 360,
            rotateAlways: true,
            formatter: function(val, timestamp) {
            	var d = new Date(val * 1000);
                return d.getDate();
            },
            style: { fontSize: '8px' }
        },
		tooltip: { enabled: false }
    },
    tooltip: {
    	shared: true,
		x: {
			show: true,
			formatter: function(val, timestamp) {
            	var d = new Date(val * 1000);
            	var day = d.getDate();
            	if (day < 10) day = '0' + day;
            	var month = d.getMonth() + 1;
            	if (month < 10) month = '0' + month;
                return day + '.' + month + '.' + d.getFullYear();
            }
		},
		// y: {
		// 	title: {
		// 		formatter: function(val, timestamp) {
	 //            	var d = new Date(val * 1000);
	 //                return d.getDate() + '.' + d.getMonth();
	 //            }
		// 	}
		// },
    }
}
*/

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
	document.querySelectorAll('.marketpapa-chart-filter.marketpapa-filter-active').forEach(function(filterItem) {
		filters.push(filterItem.getAttribute('data-filter'));
	});
	getChartFilters();
}

function setChartFilterListeners() {
	document.querySelectorAll('.marketpapa-chart-filter').forEach(function(item) {
		item.addEventListener('click', function(event) { onFilterClick(event, item); });
	});
}

function onPeriodFilterClick(e, item) {
	document.querySelectorAll('.marketpapa-period-filter').forEach(function(filterItem) {
		filterItem.classList.add('marketpapa-button-outline');
	});
	item.classList.remove('marketpapa-button-outline');
	period = item.getAttribute('data-period');

	document.getElementById('marketpapa-chart-filter-wrapper').innerHTML = mpFilterTemplate();
	setChartFilterListeners();
	// console.log(mpData);
    mpData.revenueChart.series.data = [ ...mpData.amountFboData[period] ];
    mpData.salesChart.series.data = [ ...mpData.realSalesFboData[period] ];
    mpData.lostRevenueChart.series.data = [ ...mpData.amountLostSalesFboData[period] ];
    mpData.ordersChart.series.data = [ ...mpData.salesFboData[period] ];
    mpData.lastQtyChart.series.data = [ ...mpData.lastQtyFboData[period] ];
    mpData.avgSalePriceChart.series.data = [ ...mpData.avgSalePriceData[period] ];


	getChartFilters();
/*
	chrome.runtime.sendMessage({ msg: 'change_mp_period', period: item.getAttribute('data-period') }, function(response) {
		console.log(response);
		// mpData = response;

        mpData.revenueChart.series = [ ...response.amountFboData ];
        mpData.salesChart.series = [ ...response.realSalesFboData ];
        mpData.lostRevenueChart.series = [ ...response.amountLostSalesFboData ];
        mpData.ordersChart.series = [ ...response.salesFboData ];
        mpData.lastQtyChart.series = [ ...response.lastQtyFboData ];

        getChartFilters();
		// marketPapaChart.updateOptions(mpData.chartOptions, false, false, true);
	});*/
}

function renderChart() {
	document.getElementById('marketpapa-chart').innerHTML = '';
	marketPapaChart = new ApexCharts(document.querySelector("#marketpapa-chart"), mpData.chartOptions);
	marketPapaChart.render();
	getChartFilters();
}

function loadAssets() {
	logoSrc = chrome.runtime.getURL("images/logo.svg");
	document.getElementById("marketpapa-logo").setAttribute('src', logoSrc);
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

/*
var marketPapaReceivedData = {};
var dataReceived = false;
var templatePrepared = false;

// week, twoWeeks, month
function onMarketPapaDataReceived(period) {
	var amountFbo = 0; // выручка
	var realSalesFbo = 0; // продажи
	var realSalesRateFbo = 0; // % выкупа
	var amountLostSalesFbo = 0; // упущ. выручка
	var salesFbo = 0; // заказы
	var lastQtyFbo = 0; // остаток
	var sizeLastQtyFbo;

	var dayData = {};

	var today = new Date();
	var lastWeek = new Date();
	lastWeek.setHours(0);
	lastWeek.setMinutes(0);
	lastWeek.setSeconds(0);
	lastWeek.setMilliseconds(0);

	var lastTwoWeeks = new Date();
	lastTwoWeeks.setHours(0);
	lastTwoWeeks.setMinutes(0);
	lastTwoWeeks.setSeconds(0);
	lastTwoWeeks.setMilliseconds(0);

	lastWeek.setDate(today.getDate()-7);
	lastTwoWeeks.setDate(today.getDate()-14);

	lastWeek = Math.floor(lastWeek.getTime() / 1000);
	lastTwoWeeks = Math.floor(lastTwoWeeks.getTime() / 1000);

	// цикл по размерам
	Object.entries(marketPapaReceivedData).forEach(function([key, value]) {
		sizeLastQtyFbo = 0;
		// цикл по датам
		value.data.map(function(item) {

			if (period == 'week' && item.timestamp >= lastWeek) {
				if (dayData[item.timestamp]) {
					dayData[item.timestamp] = {
						amount_fbo: dayData[item.timestamp].amount_fbo + item.amount_fbo,
						real_sales_fbo: dayData[item.timestamp].real_sales_fbo + item.real_sales_fbo,
						amount_lost_sales_fbo: dayData[item.timestamp].amount_lost_sales_fbo + item.amount_lost_sales_fbo,
						sales_fbo: dayData[item.timestamp].sales_fbo + item.sales_fbo,
						last_qty_fbo: dayData[item.timestamp].last_qty_fbo + item.last_qty_fbo
					}
    			} else {
    				dayData[item.timestamp] = {
						amount_fbo: item.amount_fbo,
						real_sales_fbo: item.real_sales_fbo,
						amount_lost_sales_fbo: item.amount_lost_sales_fbo,
						sales_fbo: item.sales_fbo,
						last_qty_fbo: item.last_qty_fbo
					}
    			}
				amountFbo += item.amount_fbo;
				realSalesFbo += item.real_sales_fbo;
				amountLostSalesFbo += item.amount_lost_sales_fbo
				salesFbo += item.sales_fbo
				sizeLastQtyFbo = item.last_qty_fbo
			}

			if (period == 'twoWeeks' && item.timestamp >= lastTwoWeeks) {
				if (dayData[item.timestamp]) {
					dayData[item.timestamp] = {
						amount_fbo: dayData[item.timestamp].amount_fbo + item.amount_fbo,
						real_sales_fbo: dayData[item.timestamp].real_sales_fbo + item.real_sales_fbo,
						amount_lost_sales_fbo: dayData[item.timestamp].amount_lost_sales_fbo + item.amount_lost_sales_fbo,
						sales_fbo: dayData[item.timestamp].sales_fbo + item.sales_fbo,
						last_qty_fbo: dayData[item.timestamp].last_qty_fbo + item.last_qty_fbo
					}
    			} else {
    				dayData[item.timestamp] = {
						amount_fbo: item.amount_fbo,
						real_sales_fbo: item.real_sales_fbo,
						amount_lost_sales_fbo: item.amount_lost_sales_fbo,
						sales_fbo: item.sales_fbo,
						last_qty_fbo: item.last_qty_fbo
					}
    			}
				amountFbo += item.amount_fbo;
				realSalesFbo += item.real_sales_fbo;
				amountLostSalesFbo += item.amount_lost_sales_fbo
				salesFbo += item.sales_fbo
				sizeLastQtyFbo = item.last_qty_fbo
			}

			if (period == 'month') {
				if (dayData[item.timestamp]) {
					dayData[item.timestamp] = {
						// ...dayData[item.timestamp],
						amount_fbo: dayData[item.timestamp].amount_fbo + item.amount_fbo,
						real_sales_fbo: dayData[item.timestamp].real_sales_fbo + item.real_sales_fbo,
						amount_lost_sales_fbo: dayData[item.timestamp].amount_lost_sales_fbo + item.amount_lost_sales_fbo,
						sales_fbo: dayData[item.timestamp].sales_fbo + item.sales_fbo,
						last_qty_fbo: dayData[item.timestamp].last_qty_fbo + item.last_qty_fbo
					}
				} else {
					dayData[item.timestamp] = {
						amount_fbo: item.amount_fbo,
						real_sales_fbo: item.real_sales_fbo,
						amount_lost_sales_fbo: item.amount_lost_sales_fbo,
						sales_fbo: item.sales_fbo,
						last_qty_fbo: item.last_qty_fbo
						// real_sales_rate_fbo: 0
					}
				}
				amountFbo += item.amount_fbo;
				realSalesFbo += item.real_sales_fbo;
				amountLostSalesFbo += item.amount_lost_sales_fbo
				salesFbo += item.sales_fbo
				sizeLastQtyFbo = item.last_qty_fbo
			}

			return item
		})
		lastQtyFbo += sizeLastQtyFbo
	});
	if (salesFbo != 0) realSalesRateFbo = 100 * realSalesFbo / salesFbo;

	document.getElementById('marketpapa-revenue').innerHTML = parseInt(amountFbo / 100) + ' ₽';
	document.getElementById('marketpapa-sales').innerHTML = realSalesFbo + ' шт';
	document.getElementById('marketpapa-sales-rate').innerHTML = Math.round(realSalesRateFbo);
	document.getElementById('marketpapa-lost-revenue').innerHTML = parseInt(amountLostSalesFbo / 100) + ' ₽';
	document.getElementById('marketpapa-orders').innerHTML = salesFbo + ' шт';
	document.getElementById('marketpapa-last-qty').innerHTML = lastQtyFbo + ' шт';

	// данные для графика
	var amountFboData = [];
	var realSalesFboData = []; // продажи
	var amountLostSalesFboData = []; // упущ. выручка
	var salesFboData = []; // заказы
	var lastQtyFboData = []; // остаток
	Object.entries(dayData).forEach(function([key, value]) {
		amountFboData = [ ...amountFboData, [ parseInt(key), value.amount_fbo ] ];
		realSalesFboData = [ ...realSalesFboData, [ parseInt(key), value.real_sales_fbo ] ];
		amountLostSalesFboData = [ ...amountLostSalesFboData, [ parseInt(key), value.amount_lost_sales_fbo ] ];
		salesFboData = [ ...salesFboData, [ parseInt(key), value.sales_fbo ] ];
		lastQtyFboData = [ ...lastQtyFboData, [ parseInt(key), value.last_qty_fbo ] ];
	});
	
	revenueChart.series = { data: amountFboData, type: 'line', name: 'Выручка' };
	salesChart.series = { data: realSalesFboData, type: 'line', name: 'Продажи' };
	lostRevenueChart.series = { data: amountLostSalesFboData, type: 'line', name: 'Упущ. выручка' };
	ordersChart.series = { data: salesFboData, type: 'line', name: 'Заказы' };
	lastQtyChart.series = { data: lastQtyFboData, type: 'line', name: 'Остаток' };

	chartOptions.series = [ revenueChart.series ];


	renderChart();
}

var token = '';
var brandName = '';
var supplierName = '';

function fetchInfo() {
    fetch(new Request('https://api.marketpapa.ru/api/plugin/item/info/' + marketPapaProductId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token })
    }))
    .then(res => res.json())
    .then(res => {
    	if (!res.hasOwnProperty('id')) return false;
    	brandName = res.brand.name
    	supplierName = res.supplier.name
    	document.getElementById('marketpapa-brand-detail').setAttribute('href', 'https://marketpapa.ru/brand?brand_name=' + brandName);
    	document.getElementById('marketpapa-supplier-detail').setAttribute('href', 'https://marketpapa.ru/supplier?supplier_name=' + supplierName);
    	// document.getElementById('marketpapa-product-detail').setAttribute('href', 'https://marketpapa.ru/item/' + marketPapaProductId);
    })
    .catch(error => {})
}

function fetchData() {
    fetch(new Request('https://api.marketpapa.ru/api/plugin/item/data/' + marketPapaProductId, {
        // headers: { 'Http-Plugin-Token': token },
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token })
    }))
    .then(res => {
        // if (res.status === 404) {
        //     throw new Error(res.statusText)
        // } else if (res.status !== 200) {
        //     throw new Error(res.statusText)
        // }
        return res.json()
    })
    .then(res => {
    	marketPapaReceivedData = res;
		dataReceived = true;
		if (templatePrepared) {
			onMarketPapaDataReceived('month');
		}

    })
    .catch(error => {})
}

function getToken() {
    fetch(new Request('https://api.marketpapa.ru/api/plugin/get_token'))
    .then(res => res.json())
    .then(res => {
    	token = res.token;
    	fetchInfo();
    	fetchData();
    })
    .catch(error => {})
}
*/
function initTemplate() {

	var div = document.createElement("div");
	div.setAttribute("id", "marketpapa-widget");
	div.innerHTML = marketPapaTemplate();

	var initInterval = setInterval(function() {
		if (document.getElementsByClassName('same-part-kt__delivery-advantages').length > 0) {
			clearInterval(initInterval);
			

			document.getElementsByClassName('same-part-kt__delivery-advantages')[0].prepend(div);
			/*templatePrepared = true;
			if (dataReceived) {
		    	document.getElementById('marketpapa-brand-detail').setAttribute('href', 'https://marketpapa.ru/brand?brand_name=' + brandName);
		    	document.getElementById('marketpapa-supplier-detail').setAttribute('href', 'https://marketpapa.ru/supplier?supplier_name=' + supplierName);

				onMarketPapaDataReceived('month');
			}*/
			setChartFilterListeners();

			document.querySelectorAll('.marketpapa-period-filter').forEach(function(item) {
				item.addEventListener('click', function(event) { onPeriodFilterClick(event, item); });
			});

			document.getElementById("marketpapa-logo").setAttribute('src', logoSrc);


			loadAssets();

			renderChart();
			// var chaeckInterval = setInterval(function() {
			// 	if (!document.getElementById('marketpapa-widget')) {
			// 		clearInterval(chaeckInterval);
			// 		initTemplate();
			// 	}
			// }, 1000);

		}
	}, 1000);

}

function initMP() {
	mpData = false;
	period = 'month';
	filters = ['revenue'];
	if (document.getElementById('marketpapa-widget'))
		document.getElementById('marketpapa-widget').innerHTML = '';
	
	chrome.runtime.sendMessage({ msg: 'init_mp', id: marketPapaProductId }, function(response) {
		mpData = response;
		initTemplate();
	});
}

function initPreviewMP(id) {
	var initTarget = document.querySelectorAll('.j-product-popup .same-part-kt__delivery-advantages');
	if (initTarget.length === 0) return false;
	// initTarget[0]
}

function isDetailPage(pathname) {
	var matches = pathname.replace(/^\//, '').match(/^catalog\/\d+/g)
	if (matches && matches.length > 0) {
		marketPapaProductId = matches[0].match(/\d+/)[0]
		return true;
	}
	return false;
}

if (isDetailPage(document.location.pathname)) initMP();

var mpLocation = document.location.pathname;
var mpPreviewWrap, mpPreviewId, _mpPreviewId, _mpPrevieMatches;

var checkLocationInterval = setInterval(function() {

	mpPreviewWrap = document.querySelectorAll('.same-part-kt__header.j-product-title');
	if (mpPreviewWrap.length > 0) {
		_mpPreviewId = mpPreviewWrap[0].getAttribute('href');

		_mpPrevieMatches = _mpPreviewId.match(/catalog\/\d+/g)
		if (_mpPrevieMatches && _mpPrevieMatches.length > 0) {
			_mpPreviewId = _mpPrevieMatches[0].match(/\d+/)[0]

			if (_mpPreviewId != mpPreviewId) {
				console.log('mpPreviewId', _mpPreviewId);
				initPreviewMP(_mpPreviewId);
			}
			mpPreviewId = _mpPreviewId;
		}
	}

	if (document.location.pathname != mpLocation) {
		mpLocation = document.location.pathname;
		if (isDetailPage(mpLocation)) initMP();
	}
}, 500);