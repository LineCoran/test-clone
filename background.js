(() => {
    var token = '', productId = '', dataObj = {}, parsedData = {};
    var _sendResponse;

    var revenueChart = {
        color: '#3dbf9b',
        series: { data: [], type: 'line', name: 'Выручка' },
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
        series: { data: [], type: 'line', name: 'Продажи' },
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
        series: { data: [], type: 'line', name: 'Упущ. выручка' },
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
        series: { data: [], type: 'line', name: 'Заказы' },
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
        series: { data: [], type: 'line', name: 'Остаток' },
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
    var avgSalePriceChart = {
        color: '#c727ff',
        series: { data: [], type: 'line', name: 'Цена' },
        axis: {
            show: false,
            labels: {
                style: { colors: '#c727ff' },
                offsetX: 0,
                formatter: function(val) {
                    return val
                },
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        }
    };

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
                style: { fontSize: '10px' }
            },
            tooltip: { enabled: false }
        },
        tooltip: {
            shared: true,
            x: { show: true }
        }
    }

    /* week, twoWeeks, month */
    function onMarketPapaDataReceived() {
        var amountFbo = {month:0,twoWeeks:0,week:0}; // выручка
        var avgSalePriceMin = {month:false,twoWeeks:false,week:false}; // история цены
        var avgSalePriceMax = {month:false,twoWeeks:false,week:false}; // история цены
        var realSalesFbo = {month:0,twoWeeks:0,week:0}; // продажи
        var realSalesRateFbo = {month:0,twoWeeks:0,week:0}; // % выкупа
        var amountLostSalesFbo = {month:0,twoWeeks:0,week:0}; // упущ. выручка
        var salesFbo = {month:0,twoWeeks:0,week:0}; // заказы
        var lastQtyFbo = {month:0,twoWeeks:0,week:0}; // остаток
        var sizeLastQtyFbo;

        var dayData = {};
        var weekData = {};
        var twoWeeksData = {};

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
        Object.entries(dataObj).forEach(function([key, value]) {
            sizeLastQtyFbo = {month:0,twoWeeks:0,week:0};
            // цикл по датам
            value.data.map(function(item) {
                amountFbo.month += item.amount_fbo;
                realSalesFbo.month += item.real_sales_fbo;
                amountLostSalesFbo.month += item.amount_lost_sales_fbo;
                salesFbo.month += item.sales_fbo;
                sizeLastQtyFbo.month = item.last_qty_fbo;
                avgSalePriceMin.month = !avgSalePriceMin.month ? item.avg_sale_price : Math.min(avgSalePriceMin.month, item.avg_sale_price);
                avgSalePriceMax.month = !avgSalePriceMax.month ? item.avg_sale_price : Math.max(avgSalePriceMax.month, item.avg_sale_price);

                if (/*period == 'week' && */item.timestamp >= lastWeek) {
                    amountFbo.week += item.amount_fbo;
                    realSalesFbo.week += item.real_sales_fbo;
                    amountLostSalesFbo.week += item.amount_lost_sales_fbo;
                    salesFbo.week += item.sales_fbo;
                    sizeLastQtyFbo.week = item.last_qty_fbo;
                    avgSalePriceMin.week = !avgSalePriceMin.week ? item.avg_sale_price : Math.min(avgSalePriceMin.week, item.avg_sale_price);
                    avgSalePriceMax.week = !avgSalePriceMax.week ? item.avg_sale_price : Math.max(avgSalePriceMax.week, item.avg_sale_price);

                    if (weekData[item.timestamp]) {
                        weekData[item.timestamp] = {
                            amount_fbo: weekData[item.timestamp].amount_fbo + item.amount_fbo,
                            real_sales_fbo: weekData[item.timestamp].real_sales_fbo + item.real_sales_fbo,
                            amount_lost_sales_fbo: weekData[item.timestamp].amount_lost_sales_fbo + item.amount_lost_sales_fbo,
                            sales_fbo: weekData[item.timestamp].sales_fbo + item.sales_fbo,
                            last_qty_fbo: weekData[item.timestamp].last_qty_fbo + item.last_qty_fbo,
                            avg_sale_price: parseInt((weekData[item.timestamp]._sum_avg_sale_price + item.avg_sale_price) / (weekData[item.timestamp]._count + 1)),
                            _sum_avg_sale_price: weekData[item.timestamp]._sum_avg_sale_price + item.avg_sale_price,
                            _count: weekData[item.timestamp]._count + 1
                        }
                    } else {
                        weekData[item.timestamp] = {
                            amount_fbo: item.amount_fbo,
                            real_sales_fbo: item.real_sales_fbo,
                            amount_lost_sales_fbo: item.amount_lost_sales_fbo,
                            sales_fbo: item.sales_fbo,
                            last_qty_fbo: item.last_qty_fbo,
                            avg_sale_price: item.avg_sale_price,
                            _sum_avg_sale_price: item.avg_sale_price,
                            _count: 1
                        }
                    }
                }

                if (/*period == 'twoWeeks' && */item.timestamp >= lastTwoWeeks) {
                    amountFbo.twoWeeks += item.amount_fbo;
                    realSalesFbo.twoWeeks += item.real_sales_fbo;
                    amountLostSalesFbo.twoWeeks += item.amount_lost_sales_fbo;
                    salesFbo.twoWeeks += item.sales_fbo;
                    sizeLastQtyFbo.twoWeeks = item.last_qty_fbo;
                    avgSalePriceMin.twoWeeks = !avgSalePriceMin.twoWeeks ? item.avg_sale_price : Math.min(avgSalePriceMin.twoWeeks, item.avg_sale_price);
                    avgSalePriceMax.twoWeeks = !avgSalePriceMax.twoWeeks ? item.avg_sale_price : Math.max(avgSalePriceMax.twoWeeks, item.avg_sale_price);

                    if (twoWeeksData[item.timestamp]) {
                        twoWeeksData[item.timestamp] = {
                            amount_fbo: twoWeeksData[item.timestamp].amount_fbo + item.amount_fbo,
                            real_sales_fbo: twoWeeksData[item.timestamp].real_sales_fbo + item.real_sales_fbo,
                            amount_lost_sales_fbo: twoWeeksData[item.timestamp].amount_lost_sales_fbo + item.amount_lost_sales_fbo,
                            sales_fbo: twoWeeksData[item.timestamp].sales_fbo + item.sales_fbo,
                            last_qty_fbo: twoWeeksData[item.timestamp].last_qty_fbo + item.last_qty_fbo,
                            avg_sale_price: parseInt((twoWeeksData[item.timestamp]._sum_avg_sale_price + item.avg_sale_price) / (twoWeeksData[item.timestamp]._count + 1)),
                            _sum_avg_sale_price: twoWeeksData[item.timestamp]._sum_avg_sale_price + item.avg_sale_price,
                            _count: twoWeeksData[item.timestamp]._count + 1
                        }
                    } else {
                        twoWeeksData[item.timestamp] = {
                            amount_fbo: item.amount_fbo,
                            real_sales_fbo: item.real_sales_fbo,
                            amount_lost_sales_fbo: item.amount_lost_sales_fbo,
                            sales_fbo: item.sales_fbo,
                            last_qty_fbo: item.last_qty_fbo,
                            avg_sale_price: item.avg_sale_price,
                            _sum_avg_sale_price: item.avg_sale_price,
                            _count: 1
                        }
                    }
                }

                // if (period == 'month') {
                    if (dayData[item.timestamp]) {
                        dayData[item.timestamp] = {
                            // ...dayData[item.timestamp],
                            amount_fbo: dayData[item.timestamp].amount_fbo + item.amount_fbo,
                            real_sales_fbo: dayData[item.timestamp].real_sales_fbo + item.real_sales_fbo,
                            amount_lost_sales_fbo: dayData[item.timestamp].amount_lost_sales_fbo + item.amount_lost_sales_fbo,
                            sales_fbo: dayData[item.timestamp].sales_fbo + item.sales_fbo,
                            last_qty_fbo: dayData[item.timestamp].last_qty_fbo + item.last_qty_fbo,
                            avg_sale_price: parseInt((dayData[item.timestamp]._sum_avg_sale_price + item.avg_sale_price) / (dayData[item.timestamp]._count + 1)),
                            _sum_avg_sale_price: dayData[item.timestamp]._sum_avg_sale_price + item.avg_sale_price,
                            _count: dayData[item.timestamp]._count + 1
                        }
                    } else {
                        dayData[item.timestamp] = {
                            amount_fbo: item.amount_fbo,
                            real_sales_fbo: item.real_sales_fbo,
                            amount_lost_sales_fbo: item.amount_lost_sales_fbo,
                            sales_fbo: item.sales_fbo,
                            last_qty_fbo: item.last_qty_fbo,
                            avg_sale_price: item.avg_sale_price,
                            _sum_avg_sale_price: item.avg_sale_price,
                            _count: 1
                        }
                    }
                // }

                return item
            })
            lastQtyFbo.month += sizeLastQtyFbo.month
            lastQtyFbo.twoWeeks += sizeLastQtyFbo.twoWeeks
            lastQtyFbo.week += sizeLastQtyFbo.week
        });
        if (salesFbo.month != 0) realSalesRateFbo.month = 100 * realSalesFbo.month / salesFbo.month;
        if (salesFbo.week != 0) realSalesRateFbo.week = 100 * realSalesFbo.week / salesFbo.week;
        if (salesFbo.twoWeeks != 0) realSalesRateFbo.twoWeeks = 100 * realSalesFbo.twoWeeks / salesFbo.twoWeeks;
        /*
        document.getElementById('marketpapa-revenue').innerHTML = parseInt(amountFbo / 100) + ' ₽';
        document.getElementById('marketpapa-sales').innerHTML = realSalesFbo + ' шт';
        document.getElementById('marketpapa-sales-rate').innerHTML = Math.round(realSalesRateFbo);
        document.getElementById('marketpapa-lost-revenue').innerHTML = parseInt(amountLostSalesFbo / 100) + ' ₽';
        document.getElementById('marketpapa-orders').innerHTML = salesFbo + ' шт';
        document.getElementById('marketpapa-last-qty').innerHTML = lastQtyFbo + ' шт';
        */
        // данные для графика
        var amountFboData = {month:[],twoWeeks:[],week:[]};//[];
        var realSalesFboData = {month:[],twoWeeks:[],week:[]};//[]; // продажи
        var amountLostSalesFboData = {month:[],twoWeeks:[],week:[]};//[]; // упущ. выручка
        var salesFboData = {month:[],twoWeeks:[],week:[]};//[]; // заказы
        var lastQtyFboData = {month:[],twoWeeks:[],week:[]};//[]; // остаток
        var avgSalePriceData = {month:[],twoWeeks:[],week:[]};//[]; // история цены
        Object.entries(dayData).forEach(function([key, value]) {
            amountFboData.month = [ ...amountFboData.month, [ parseInt(key), value.amount_fbo ] ];
            realSalesFboData.month = [ ...realSalesFboData.month, [ parseInt(key), value.real_sales_fbo ] ];
            amountLostSalesFboData.month = [ ...amountLostSalesFboData.month, [ parseInt(key), value.amount_lost_sales_fbo ] ];
            salesFboData.month = [ ...salesFboData.month, [ parseInt(key), value.sales_fbo ] ];
            lastQtyFboData.month = [ ...lastQtyFboData.month, [ parseInt(key), value.last_qty_fbo ] ];
            avgSalePriceData.month = [ ...avgSalePriceData.month, [ parseInt(key), value.avg_sale_price ] ];
        });
        Object.entries(weekData).forEach(function([key, value]) {
            amountFboData.week = [ ...amountFboData.week, [ parseInt(key), value.amount_fbo ] ];
            realSalesFboData.week = [ ...realSalesFboData.week, [ parseInt(key), value.real_sales_fbo ] ];
            amountLostSalesFboData.week = [ ...amountLostSalesFboData.week, [ parseInt(key), value.amount_lost_sales_fbo ] ];
            salesFboData.week = [ ...salesFboData.week, [ parseInt(key), value.sales_fbo ] ];
            lastQtyFboData.week = [ ...lastQtyFboData.week, [ parseInt(key), value.last_qty_fbo ] ];
            avgSalePriceData.week = [ ...avgSalePriceData.week, [ parseInt(key), value.avg_sale_price ] ];
        });
        Object.entries(twoWeeksData).forEach(function([key, value]) {
            amountFboData.twoWeeks = [ ...amountFboData.twoWeeks, [ parseInt(key), value.amount_fbo ] ];
            realSalesFboData.twoWeeks = [ ...realSalesFboData.twoWeeks, [ parseInt(key), value.real_sales_fbo ] ];
            amountLostSalesFboData.twoWeeks = [ ...amountLostSalesFboData.twoWeeks, [ parseInt(key), value.amount_lost_sales_fbo ] ];
            salesFboData.twoWeeks = [ ...salesFboData.twoWeeks, [ parseInt(key), value.sales_fbo ] ];
            lastQtyFboData.twoWeeks = [ ...lastQtyFboData.twoWeeks, [ parseInt(key), value.last_qty_fbo ] ];
            avgSalePriceData.twoWeeks = [ ...avgSalePriceData.twoWeeks, [ parseInt(key), value.avg_sale_price ] ];
        });
        
        revenueChart.series.data = [ ...amountFboData.month ];
        salesChart.series.data = [ ...realSalesFboData.month ];
        lostRevenueChart.series.data = [ ...amountLostSalesFboData.month ];
        ordersChart.series.data = [ ...salesFboData.month ];
        lastQtyChart.series.data = [ ...lastQtyFboData.month ];
        avgSalePriceChart.series.data = [ ...avgSalePriceData.month ];

        chartOptions.series = [ revenueChart.series ];

        parsedData = {
            amountFbo: amountFbo,// parseInt(amountFbo / 100) + ' ₽',
            realSalesFbo: realSalesFbo,//realSalesFbo + ' шт',
            realSalesRateFbo: realSalesRateFbo,//Math.round(realSalesRateFbo),
            amountLostSalesFbo: amountLostSalesFbo,//parseInt(amountLostSalesFbo / 100) + ' ₽',
            salesFbo: salesFbo,//salesFbo + ' шт',
            lastQtyFbo: lastQtyFbo,//lastQtyFbo + ' шт',
            avgSalePriceMin: avgSalePriceMin,
            avgSalePriceMax: avgSalePriceMax,

            chartOptions: chartOptions,
            revenueChart: revenueChart,
            salesChart: salesChart,
            lostRevenueChart: lostRevenueChart,
            ordersChart: ordersChart,
            lastQtyChart: lastQtyChart,
            avgSalePriceChart: avgSalePriceChart,
            
            amountFboData: amountFboData,
            realSalesFboData: realSalesFboData,
            amountLostSalesFboData: amountLostSalesFboData,
            salesFboData: salesFboData,
            lastQtyFboData: lastQtyFboData,
            avgSalePriceData: avgSalePriceData
        };
        /*
        renderChart();
        */
    }

    function fetchInfo() {
        fetch(new Request('https://api.marketpapa.ru/api/plugin/item/info/' + productId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token })
        }))
        .then(res => res.json())
        .then(res => {
            if (!res.hasOwnProperty('id')) {
                _sendResponse({ ...parsedData })
                return false;
            }
            var infoObj = {
                brandName: res.brand.name,
                supplierName: res.supplier.name
            };
            _sendResponse({ ...infoObj, ...parsedData })
        })
        .catch(error => {
            _sendResponse({ ...parsedData })
        })
    }

    function fetchData() {
        fetch(new Request('https://api.marketpapa.ru/api/plugin/item/data/' + productId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token })
        }))
        .then(res => res.json())
        .then(res => {
            dataObj = { ...res };
            onMarketPapaDataReceived();
            fetchInfo();
        })
        .catch(error => {})
    }

    function getToken() {
        fetch(new Request('https://api.marketpapa.ru/api/plugin/get_token'))
        .then(res => res.json())
        .then(res => {
            token = res.token;
            fetchData();
        })
        .catch(error => {})
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.msg) {
            case 'init_mp':
                productId = request.id;
                _sendResponse = sendResponse;
                getToken();
                return true;
                break;
            default: break;
        }
    });
})();