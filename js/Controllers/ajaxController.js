define(['tpl!view/ajaxLoader.tpl'], function(ajaxLoaderView) {
    var ajax = function() {
        this.renderLoader = function() {
            return ajaxLoaderView();
        };
    };
    
    return ajax;
});