function mp_toRuble(price) {
    if (!price) price = '0'
    price += ''
    if (price.length === 1) { price = '00' + price }
    else if (price.length === 2) { price = '0' + price }
    else if (price.length === 0) { price = '000' }

    let intPart = price.slice(0,-2)
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function mp_formatNumber(number) {
    if (!number) number = ''
    number += ''
    if (number.trim() === '') return 0
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function mp_dateToString(d, format) {
    let day = d.getDate()
    if (day < 10) day = '0'+day
    let month = d.getMonth()+1
    if (month < 10) month = '0'+month
    let year = d.getFullYear()
    let hours = d.getHours()
    if (hours < 10) hours = '0'+hours
    let minutes = d.getMinutes()
    if (minutes < 10) minutes = '0'+minutes
    let seconds = d.getSeconds()
    if (seconds < 10) seconds = '0'+seconds
    if (format === 'DD.MM.YYYY HH:II') return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
    return date
}

function mp_getCookie(name) {
	const value = '; ' + document.cookie;
	const parts = value.split('; ' + name + '=');
	var cookie = '';
	if (parts.length === 2)
		cookie = parts.pop().split(';').shift();
	return cookie;
}

function mp_isAuth() {
	var _token = mp_getCookie('mpapa_plugin_token');
	return _token.trim() != '' && _token.trim() != 'false' ? _token : false;
}