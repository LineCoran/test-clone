function mp_initCatalogTemplate(logoSrc, product) {
	
	function catalogFboChange(active, product_id) {
		console.log(active, product_id);
		// var sizeTable = document.getElementById('mp-size-table');
		// if (sizeTable) sizeTable.innerHTML = mp_tableTemplate(mp_sizeTableColumns(active.key === 'fbo'), sizeData);
	}

	var catalogSwitchWrap;
	var catalogFboSwitchOptions = {
		left: {
			key: 'fbo',
			text: 'FBO'
		},
		right: {
			key: 'fbs',
			text: 'FBS'
		}
	};
	var interval = setInterval(() => {
		catalogSwitchWrap = document.getElementById(`mp-catalog-switch-wrap-${ product.product_id }`);
		if (catalogSwitchWrap) clearInterval(interval);
		catalogSwitchWrap.append(
			mp_switchTemplate(`mp-catalog-switch-${ product.product_id }`, catalogFboSwitchOptions, active => catalogFboChange(active, product.product_id))
		);
	}, 500);

	return tpl = `
		<div class="marketpapa-catalog-item">
			<div class="marketpapa-catalog-head">
				<img src="${ window.marketPapaWidget.images.logoSrc }" class="marketpapa-catalog-logo" />
				<div>${ mp_initRateTemplate(1140) }</div>
			</div>
			<div class="marketpapa-catalog-item-info">
				<div class="marketpapa-catalog-scheme-wrapper">
					<div class="marketpapa-catalog-scheme">
						Схема сотрудничества
					</div>
					<div id="mp-catalog-switch-wrap-${ product.product_id }"></div>
				</div>
				<div class="marketpapa-catalog-info">
					<div class="marketpapa-catalog-info-left">
						<div class="marketpapa-catalog-info-line">
							Выручка
							<i class="marketpapa-icon" style="background-image: url(${ window.marketPapaWidget.images.iconSale });"></i>
							<i class="marketpapa-icon" style="background-image: url(${ window.marketPapaWidget.images.iconChevronDown });"></i>
							<div class="marketpapa-catalog-dropdown">
								<div class="marketpapa-catalog-info-left">
									<div class="marketpapa-catalog-info-line">
										Выручка
										<i class="marketpapa-icon" style="background-image: url(${ window.marketPapaWidget.images.iconSale });"></i>
									</div>
									<div class="marketpapa-catalog-info-line">
										Выручка
										<i class="marketpapa-icon" style="background-image: url(${ window.marketPapaWidget.images.iconOrder });"></i>
									</div>
								</div>
								<div class="marketpapa-catalog-info-right">
									<div class="marketpapa-catalog-info-line">
										${ mp_toRuble(product.amount_real_sales_fbo) } ₽
									</div>
									<div class="marketpapa-catalog-info-line">
										- ₽
									</div>
								</div>
							</div>
						</div>
						<div class="marketpapa-catalog-info-line">
							Продажи
							<i class="marketpapa-icon" style="background-image: url(${ window.marketPapaWidget.images.iconChevronDown });"></i>
							<div class="marketpapa-catalog-dropdown">
								<div class="marketpapa-catalog-info-left">
									<div class="marketpapa-catalog-info-line">
										Продажи
									</div>
									<div class="marketpapa-catalog-info-line">
										Заказы
									</div>
									<div class="marketpapa-catalog-info-line">
										% выкупа
									</div>
								</div>
								<div class="marketpapa-catalog-info-right">
									<div class="marketpapa-catalog-info-line">
										${ mp_formatNumber(product.real_sales_fbo) } шт
									</div>
									<div class="marketpapa-catalog-info-line">
										- шт
									</div>
									<div class="marketpapa-catalog-info-line">
										-%
									</div>
								</div>
							</div>
						</div>
						<div class="marketpapa-catalog-info-line">
							Остаток
						</div>
					</div>
					<div class="marketpapa-catalog-info-right">
						<div class="marketpapa-catalog-info-line">
							${ mp_toRuble(product.amount_real_sales_fbo) } ₽
						</div>
						<div class="marketpapa-catalog-info-line">
							${ mp_formatNumber(product.real_sales_fbo) } шт
						</div>
						<div class="marketpapa-catalog-info-line">
							${ mp_formatNumber(product.last_qty_fbo) } шт
						</div>
					</div>
				</div>
			</div>
		</div>

	`;
}