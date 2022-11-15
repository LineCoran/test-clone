var sizeData;

function mp_tableTemplate(columns, data) {
    sizeData = data;
    var thead = '', tbody = '', i, j, cell = '', cellStyle;
    for (i=0; i<columns.length; i++) {
        thead += `<th>${ columns[i].headerName }</th>`;
    }
    for (i=0; i<data.length; i++) {
        cell = '';
        for (j=0; j<columns.length; j++) {
            cellStyle = '';
            if (columns[j].hasOwnProperty('cellStyle')) {
                cellStyle = columns[j].cellStyle
            }
            cell += `<td${ cellStyle == '' ? '' : ` style="${ cellStyle }"` }>
                        ${ columns[j].hasOwnProperty('cellRenderer') ? columns[j].cellRenderer(data[i][columns[j].field]) : data[i][columns[j].field] }
                    </td>`;
        }
        tbody += `<tr>${ cell }</tr>`;
    }
    return `
        <table class="marketpapa-table">
            <thead><tr>${ thead }</tr></thead>
            <tbody>${ tbody }</tbody>
        </table>
    `;
}

function sizeFboChange(active) {
    var sizeTable = document.getElementById('mp-size-table');
    if (sizeTable) sizeTable.innerHTML = mp_tableTemplate(mp_sizeTableColumns(active.key === 'fbo'), sizeData);
}

function mp_sizeModal() {
	sizeModal = document.createElement("div");
	// sizeModal.setAttribute("id", "marketpapa-widget-size-modal");
	sizeModal.setAttribute("class", "marketpapa-widget-modal");
	sizeModal.innerHTML = `
		<div class="marketpapa-widget-modal-content">
			<div class="marketpapa-widget-modal-header">
				<img class="mwm-header-image" src="${ logoSrc }" alt="" />
				<span class="marketpapa-widget-modal-close"></span>
			</div>
			<div class="marketpapa-widget-modal-body">
				
				<div class="mp-size-header">
					<div>
						<div class="mp-title">Аналитика по размеру</div>
						<div class="mp-actual-date">Данные на ` + mp_dateToString(new Date(), 'DD.MM.YYYY HH:II') + `</div>
					</div>
					<div id="mp-size-switch-wrap"></div>
				</div>

				<div id="mp-size-table"></div>

			</div>
			<div class="marketpapa-widget-modal-footer">
                <a id="mp-size-modal-link" href="https://marketpapa.ru/find" target="_blank" class="marketpapa-button marketpapa-button-inline marketpapa-button-primary">
                    Подробная аналитика
                </a>
			</div>
		</div>
	`;
	document.body.append(sizeModal);

	var sizeSwitchWrap = document.getElementById("mp-size-switch-wrap");
    if (sizeSwitchWrap) {
        var switchOptions = {
            left: {
                key: 'fbo',
                text: 'FBO'
            },
            right: {
                key: 'fbs',
                text: 'FBS'
            }
        };
        sizeSwitchWrap.append(mp_switchTemplate("mp-size-switch", switchOptions, sizeFboChange));
    }

	var close = document.getElementsByClassName("marketpapa-widget-modal-close");

	if (close.length) close[0].setAttribute('style', `background-image: url(`+ imgCloseModal +`);`);

	window.onclick = function(event) {
		if (event.target == sizeModal || event.target == close[0]) {
			closeModal();
		}
	}
}
