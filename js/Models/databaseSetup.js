/*
 * Database Setup
 * 
 * Setup the database
 * 
 */
define([], function() {
    var dbSetup = function() {
        /*
         * Default Class Variables
         */
        this._version = 1.1;
        this._schema = {
            1: {
                0: [
                    'CREATE TABLE macros(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, macro TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0, visible BOOLEAN NOT NULL DEFAULT true);',
                    'CREATE TABLE variables(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, variable TEXT NOT NULL);',
                    'CREATE TABLE characters(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);',
                ]
            }
        };
        
        // Pending migrations to run
        var migrations = [];
        // Callbacks to run when migrations done
        var done = [];
        var state = 0;

        /*
         * Sync the schema
         * Loops through the schema changes and
         * implements all the versioning changes
         * 
         * @return status bool
         */
        this.sync = function() {
            if (state > 0) {
                throw "Migrator is only valid once -- create a new one if you want to do another migration.";
            }
            
            // Get current database version
            var currentVersion = parseFloat(app.dbAdapter.db.version);
            
            for (ver in this._schema) {
                for (sub in this._schema[ver]) {
                    var version = parseFloat(parseInt(ver) + '.' + parseInt(sub));
                    var nextVersion = parseFloat(parseInt(ver) + '.' + (parseInt(sub) + 1));
                    
                    if (currentVersion <= version && version < this._version) {
                        var schema = this._schema[ver][sub];
                        var update = {
                            version: version,
                            nextVersion: nextVersion,
                            execute: function(t) {
                                for (var i = 0; i < schema.length; i++) {
                                    t.executeSql(schema[i]);
                                }
                                
                                console.log('Updating Database ' + app.config.db.name + ' from v' + version + ' to v' + nextVersion);
                            }
                        };
                        
                        migrations.push(update);
                    }
                }
            }
            
            state = 1;
            try {
                doMigration();
            }
            catch(e) {
                error(e);
            }
            
            return;
        };
        
        // Called when the migration has completed.  If the migration has already completed,
        // executes immediately.  Otherwise, waits.
        this.done = function(func) {
            if (typeof func !== "array") {
                func = [func];
            }
            
            for(var f in func) {
                done.push(func[f]);
            }
            
            if (state > 1) {
                executeDoneCallbacks();
            }
        };

        // Execute a migration
        var doMigration = function() {
            if (migrations[0]) {
                app.dbAdapter.db.transaction(function(t) {
                    var update = migrations[0];
                    app.dbAdapter.db.changeVersion(update.version, update.nextVersion, function(t) {
                        update.execute(t);
                    }, function (err) {
                        console.log(err.message);
                    });
                    delete(migrations[0]);
                    doMigration();
                }, function (err) {
                    console.log(err.message);
                });
            } else {
                state = 2;
                executeDoneCallbacks();
            }
        };

        var executeDoneCallbacks = function() {
            for(var f in done) {
                done[f]();
            }
        }
    };
    
    return dbSetup;
});
