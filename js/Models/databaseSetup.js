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
        this._version = 1.0;
        this._schema = {
            0: {
                1: [
                    'CREATE TABLE cms_macros(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, macro TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0, visible BOOLEAN NOT NULL DEFAULT true);',
                    'CREATE TABLE cms_variables(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, variable TEXT NOT NULL);',
                    'CREATE TABLE cms_characters(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);',
                    'CREATE TABLE link_character_macro(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, character_id INTEGER NOT NULL, macro_id INTEGER NOT NULL);',
                    'CREATE TABLE link_character_variable(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, character_id INTEGER NOT NULL, variable_id INTEGER NOT NULL);'
                ]
            }
        };
        
        // Pending migrations to run
        var migrations = [];
        var currentMigration = 0;
        // Callbacks to run when migrations done
        var syncDone = [];
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
                notify('Migrator is only valid once -- create a new one if you want to do another migration.', 'notice');
            }
            state = 1;
            
            // Get current database version
            var currentVersion = parseFloat(app.dbAdapter.db.version) ? parseFloat(app.dbAdapter.db.version) : 0;
            var freshInstall = (currentVersion) ? false : true;
            
            for (ver in this._schema) {
                for (sub in this._schema[ver]) {
                    var nextVersion = parseFloat(parseInt(ver) + '.' + parseInt(sub));
                    
                    if ((currentVersion < nextVersion || freshInstall) && nextVersion < this._version) {
                        freshInstall = false;
                        var version = (currentVersion) ? currentVersion : '';
                        var schema = this._schema[ver][sub];
                        var update = {
                            version: version,
                            currentVersion: currentVersion,
                            nextVersion: nextVersion,
                            schema: schema,
                            execute: function(t) {
                                for (var i = 0; i < this.schema.length; i++) {
                                    t.executeSql(this.schema[i]);
                                }
                                
                                notify('Updating Database ' + app.config.db.name + ' from v' + this.currentVersion + ' to v' + this.nextVersion, 'notice');
                            }
                        };
                        
                        currentVersion = nextVersion;
                        
                        migrations.push(update);
                    }
                }
            }
            
            doMigration();
            
            return;
        };
        
        // Called when the migration has completed.  If the migration has already completed,
        // executes immediately.  Otherwise, waits.
        this.syncDone = function(func) {
            if (typeof func !== "array") {
                func = [func];
            }
            
            for(var f in func) {
                syncDone.push(func[f]);
            }
            
            if (state == 2) {
                executeSyncDoneCallbacks();
            }
        };
        
        // Execute a migration
        var doMigration = function() {
            if (migrations[currentMigration]) {
                app.dbAdapter.db.transaction(function(t) {
                    var update = migrations[currentMigration];
                    app.dbAdapter.db.changeVersion(update.version, update.nextVersion, function(t) {
                        update.execute(t);
                        executeSyncDoneCallbacks();
                    }, function (err) {
                        notify(err.message, 'error');
                        executeSyncDoneCallbacks();
                    });
                    currentMigration++;
                    doMigration();
                }, function (err) {
                    notify(err.message, 'error');
                    executeSyncDoneCallbacks();
                });
            }
            else {
                state = 2;
            }
        };
        
        var executeSyncDoneCallbacks = function() {
            if (state == 2) {
                for(var f in syncDone) {
                    syncDone[f]();
                }
            }
        }
    };
    
    return dbSetup;
});