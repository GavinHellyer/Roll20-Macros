require.config({
    paths: {
        tpl: 'lib/tpl/tpl',
        controller: 'Controllers',
        model: 'Models',
        view: 'Views',
        app: 'lib/application',
        bootstrap: 'lib/bootstrap/bootstrap'
    }
});

require(
    [
        'bootstrap',
        'app/config',
        'app/functions',
        'model/databaseAdapter',
        'model/databaseSetup'
    ],
    function(bootstrap, config, functions, databaseAdapter, databaseSetup) {
        // Initialise the Global app and add its config
        window.app = { config: config };
        // Initialise the database and add to app
        app.dbAdapter = new databaseAdapter();
        
        // Get the schema and sync with local
        var schema = new databaseSetup();
        schema.sync();
        
        schema.syncDone(function() {
            notify('Database Sync Complete.', 'notice');
            $(function() {
                $('#myTab a').click(function (e) {
                    e.preventDefault();
                    $(this).tab('show');
                })
            });
        });
    }
);