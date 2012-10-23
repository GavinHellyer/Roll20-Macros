/*
 * Database Setup
 * 
 * Setup the database
 * 
 */
define(['model/databaseMigrator'], function(databaseMigrator) {
    var dbSetup = function() {
        /*
         * Default Class Variables
         */
        this.databaseMigrator = new databaseMigrator();
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
            
        /*
         * Sync the schema
         * Loops through the schema changes and
         * implements all the versioning changes
         * 
         * @return status bool
         */
        this.sync = function() {
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
                        
                        this.databaseMigrator.migration(update);
                    }
                }
            }
            
            this.databaseMigrator.execute();
            
            return;
        };
    };
    
    return dbSetup;
});
