const mp_sizeTableColumns = fbo => [
    {
        field: 'sizeName',
        headerName: 'Российский размер'
    },
    {
        field: 'sizeOrigName',
        headerName: 'Размер производителя'
    },
    {
        field: fbo ? 'amount_real_sales_fbo' : 'amount_real_sales_fbs',
        headerName: fbo ? 'Выручка FBO' : 'Выручка FBS',
        cellStyle: 'background: rgba(61, 191, 155, 0.25);',
        cellRenderer: data => mp_toRuble(data)
    },
    {
        field: fbo ? 'real_sales_fbo' : 'real_sales_fbs',
        headerName: fbo ? 'Продажи FBO' : 'Продажи FBS',
        cellStyle: 'background: rgba(233, 106, 135, 0.25);',
        cellRenderer: data => mp_formatNumber(data)
    },
    {
        field: fbo ? 'sales_fbo' : 'sales_fbs',
        headerName: fbo ? 'Заказы FBO' : 'Заказы FBS',
        cellStyle: 'background: rgba(253, 222, 59, 0.25);',
        cellRenderer: data => mp_formatNumber(data)
    },
    {
        field: fbo ? 'last_qty_fbo' : 'last_qty_fbs',
        headerName: fbo ? 'Остаток FBO' : 'Остаток FBS',
        cellStyle: 'background: rgba(97, 112, 255, 0.25);',
        cellRenderer: data => mp_formatNumber(data)
    }
];
