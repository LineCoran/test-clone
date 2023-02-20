function mp_checkCatalogInterval(assets) {
    function mp_initCatalogItem(product) {
        var card = document.querySelectorAll('.product-card[data-nm-id="'+product.product_id+'"] .product-card__main');
        if (!card || card.length == 0) return false;
    
        var div = document.createElement("div");
        div.setAttribute("id", "marketpapa-catalog-widget-" + product.product_id);
        div.setAttribute("class", "marketpapa-catalog-widget");
        div.innerHTML = mp_initCatalogTemplate(assets.logoSrc, product);
    
        var targetDiv = document.getElementById('marketpapa-catalog-widget-' + product.product_id);
        if (targetDiv && targetDiv.length > 0) {
            targetDiv.remove();
        }
    
        card[0].append(div);
    }
    
    function mp_isCatalogPage(pathname) {
        var matches = pathname.replace(/^\//, '').match(/^catalog\/([A-Za-z]|0)/g);
        var promotions = pathname.replace(/^\//, '').match(/^promotions\/[A-Za-z]/g);
        var brands = pathname.replace(/^\//, '').match(/^brands\/[A-Za-z]/g);
        var seller = pathname.replace(/^\//, '').match(/^seller\/[0-9]/g);
        return matches && matches.length
            || promotions && promotions.length
            || brands && brands.length
            || seller && seller.length;
    }
    
    var catalogLocation = document.location.pathname;
    var catalogLocationSearch = false;
    var lastPageIds = [];
    var catalogIds = [];
    
    function mp_getCatalogIds(pathname) {
        catalogIds = [];
        var id, idMatch;
        document.querySelectorAll('.catalog-page .product-card').forEach(function(item) {
            id = item.getAttribute('id');
            if (id) {
                idMatch = id.match(/\d+/g);
                if (idMatch && idMatch.length > 0) {
                    catalogIds.push(idMatch[0]);
                }
            }
        });
    }
    
    /**
     * { 123456: {}, ... }
     */
    var loadedIds = {};
    
    /**
     * 
     * @param {object} products - loadedIds
     */
    function mp_initCatalog(products) {
        Object.entries(products).forEach(function([product_id, product]) {
            mp_initCatalogItem(product);
        });
    }
    
    function mp_getItemsRequest() {
        var authToken = mp_isAuth();
        if (!authToken) return false;
    
        console.log(catalogIds);
        console.log(loadedIds);
        var requestIds = [];
        var existIds = {};
        catalogIds.map(item => {
            if (!loadedIds[item]) {
                requestIds = [ ...requestIds, item ];
            } else {
                existIds = {
                    ...existIds,
                    [item]: loadedIds[item]
                }
            }
            return item;
        });
        
        mp_initCatalog(existIds);
        
        if (!requestIds.length) {
            return false;
        }
    
        chrome.runtime.sendMessage({
            msg: 'get_catalog_items',
            id: requestIds,
            authToken: authToken
        }, function(response) {
            if (!response || !Array.isArray(response)) {
                return false;
            }
    
            var responseIds = {};
            response.map(item => {
                loadedIds = {
                    ...loadedIds,
                    [item.product_id]: item
                };
                responseIds = {
                    ...responseIds,
                    [item.product_id]: item
                };
                return item;
            });
            mp_initCatalog(responseIds);
        });
    }
    
    var catalogLoadInterval;
    // var pageArticuls = [];
    
    function mp_checkCatalogIds() {
        catalogLocation = document.location.pathname;
        catalogLocationSearch = document.location.search;
        lastPageIds = [ ...catalogIds ];
    
        // pageArticuls = [];
        if (catalogLoadInterval) clearInterval(catalogLoadInterval);
    
        catalogLoadInterval = setInterval(function() {
    
            // id меняются
            // - смена урл
            // - подгрузка
            // 
            // хранить все на подгрузку
    
            mp_getCatalogIds(mpLocation);
            if (catalogIds.length > 0 && JSON.stringify(lastPageIds) !== JSON.stringify(catalogIds)) {
                lastPageIds = [ ...catalogIds ];
                clearInterval(catalogLoadInterval);
                mp_getItemsRequest();
            }
        }, 1000);
    }
    
    setInterval(function() {
        const { pathname, search } = document.location
        if (mp_isCatalogPage(pathname) && (pathname != catalogLocation || search !== catalogLocationSearch)) {
            // clear page articul array
            // pageArticuls = [];

            mp_checkCatalogIds();
        }
    }, 1000);
}