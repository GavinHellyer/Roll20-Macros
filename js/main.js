require.config({
    paths: {
        tpl: 'lib/tpl/tpl',
        controller: 'Controllers',
        model: 'Models',
        view: 'Views',
        app: 'lib/application'
    }
});

require(
    [
        'app/config',
        'model/databaseAdapter',
        'model/databaseSetup'
    ],
    function(config, databaseAdapter, databaseSetup) {
        // Initialise the Global app and add its config
        window.app = { config: config };
        // Initialise the database and add to app
        app.dbAdapter = new databaseAdapter();
        
        // Get the schema and sync with local
        var schema = new databaseSetup();
        schema.sync();
    }
);