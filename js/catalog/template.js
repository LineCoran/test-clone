function mp_initCatalogTemplate(logoSrc, product) {
	return tpl = `
		<div class="marketpapa-catalog-item">
			<div>
				<img src="`+logoSrc+`" class="marketpapa-catalog-logo" />
			</div>
			<div class="marketpapa-catalog-item-info">
				<div class="marketpapa-catalog-info-line"><span>Выручка</span><span>` + mp_toRuble(product.amount_real_sales_fbo) + ` ₽</span></div>
				<div class="marketpapa-catalog-info-line"><span>Продажи</span><span>` + mp_formatNumber(product.real_sales_fbo) + ` шт</span></div>
				<div class="marketpapa-catalog-info-line"><span>Остаток</span><span>` + mp_formatNumber(product.last_qty_fbo) + ` шт</span></div>
			</div>
		</div>
	`;
}