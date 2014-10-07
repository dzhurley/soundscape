requirejs([
    'constants',
    'app'
], function(Constants, App) {
    window.App = new App();
    window.App.init(Constants);
});
