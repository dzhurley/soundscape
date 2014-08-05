requirejs([
    'app'
], function(App) {
    window.App = new App();
    window.App.init();
});
