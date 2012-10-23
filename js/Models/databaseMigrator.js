/*
 * Database Migrator
 * 
 * Setup the database
 * 
 */
define(function() {
    var databaseMigrator = function() {
        // Pending migrations to run
        var migrations = [];
        // Callbacks to run when migrations done
        var whenDone = [];

        var state = 0;

        // Use this method to actually add a migration.
        // You'll probably want to start with 1 for the migration number.
        this.migration = function(update) {
            migrations.push(update);
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
                executeWhenDoneCallbacks();
            }
        };

        this.execute = function() {
            if (state > 0) {
                throw "Migrator is only valid once -- create a new one if you want to do another migration.";
            }
            
            state = 1;
            try {
                doMigration();
            } catch(e) {
                error(e);
            }
            
            return this;
        };

        // Called when the migration has completed.  If the migration has already completed,
        // executes immediately.  Otherwise, waits.
        this.whenDone = function(func) {
            if (typeof func !== "array") {
                func = [func];
            }
            for(var f in func) {
                whenDone.push(func[f]);
            }
            if (state > 1) {
                executeWhenDoneCallbacks();
            }
        };

        var executeWhenDoneCallbacks = function() {
            for(var f in whenDone) {
                whenDone[f]();
            }
        }
    }
    
    return databaseMigrator;
});