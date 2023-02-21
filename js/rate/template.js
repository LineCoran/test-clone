function mp_initRateTemplate(rate) {
	return tpl = `
		<div class="marketpapa-rate-line">
			<div class="marketpapa-rate-text">Актуальная ставка</div>
			<i class="marketpapa-icon marketpapa-icon-info" style="background-image: url(${ window.marketPapaWidget.images.iconInfoHovered });"></i>
			<div class="marketpapa-rate-value">${ rate } ₽</div>
		</div>
	`;
}