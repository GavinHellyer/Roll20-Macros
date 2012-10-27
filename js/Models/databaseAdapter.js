/*
 * Database Adapter
 * 
 * Allows for basic use of select, insert, update
 * 
 */
define(function() {
    var db = function() {
        /*
         * Default Class Variables
         */
        this.db = openDatabase(app.config.db.name, app.config.db.version, app.config.db.description, app.config.db.size);
        this._error = null;
        this._query = '';
        this._result = false;
        this._type = null;
        this._select = [];
        this._from = '';
        this._join = [];
        this._where = [];
        this._order = [];
        this._insert = '';
        this._columns = [];
        this._values = [];
        this._update = '';
        this._set = [];
        
        /*
         * Select statement
         * 
         * @param select string|array items to select from db
         * @return db object
         */
        this.select = function(select) {
            // Set the transaction type
            this._type = 'select';
            this._error = null;
            this._result = false;
            
            // Check if the item passed through is an array of selects
            if (typeof(select) == 'object') {
                // Loop through the items and store them for the query builder
                for(var i = 0; i < select.length; i++) {
                    this._select.push(select[i]);
                }
            }
            else if (select) {
                this._select.push(select);
            }
            else {
                // If select has not been passed through set it to everything
                this._select.push('*')
            }
            
            return this;
        };
        
        /*
         * Insert statement
         * 
         * @param into string the table to insert data into
         * @return db object
         */
        this.insert = function(into) {
            // Set the transaction type
            this._type = 'insert';
            this._error = null;
            this._result = false;
            
            this._insert = into;
            
            return this;
        };
        
        /*
         * Update statement
         * 
         * @param table string the table to update data in
         * @return db object
         */
        this.update = function(table) {
            // Set the transaction type
            this._type = 'update';
            this._error = null;
            this._result = false;
            
            this._update = table;
            
            return this;
        };
        
        /*
         * Select statement
         * Set the from table
         * 
         * @param table string the table to select data from
         * @return db object
         */
        this.from = function(table) {
            this._from = table;
            
            return this;
        };
        
        /*
         * Select statement
         * Set the table joins
         * 
         * @param table string the table to join onto the select
         * @param on string condition for the join
         * @return db object
         */
        this.join = function(table, on) {
            this._join.push(table + ' ON ' + on);
            
            return this;
        };
        
        /*
         * Select|Update statement
         * Set the where clause
         * 
         * @param where string the where clause
         * @return db object
         */
        this.where = function(where) {
            this._where.push(where);
            
            return this;
        };
        
        /*
         * Select statement
         * Set the order by
         * 
         * @param by string the column to order by
         * @return db object
         */
        this.order = function(by) {
            this._order.push(by);
            
            return this;
        };
        
        /*
         * Insert statement
         * Set the insert column(s)
         * 
         * @param columns string|array the column(s) to insert into
         * @return db object
         */
        this.columns = function(columns) {
            // Check if a single item has been passed through
            if (typeof(columns) == 'string') {
                this._columns.push(columns);
            }
            else if (typeof(columns) == 'object') {
                for(var i = 0; i < columns.length; i++) {
                    this._columns.push(columns[i]);
                }
            }
            else {
                // This is a required field. Set and error if it fails
                this._error = 'Missing Column(s) for Insert';
            }
            
            return this;
        };
        
        /*
         * Insert statement
         * Set the insert value(s)
         * 
         * @param values string|array the value(s) to insert into
         * @return db object
         */
        this.values = function(values) {
            var valuesArray = [];
            // Check if a single item has been passed through
            if (typeof(values) == 'string') {
                valuesArray.push(this.encapsulate(values));
                this._values.push(valuesArray);
            }
            else if (typeof(values) == 'object') {
                // Join the values into a string
                valuesArray.push(this.joinQuery(values, ', ', '', true, false, true));
                this._values.push(valuesArray);
            }
            else {
                // This is a required field. Set and error if it fails
                this._error = 'No Values to Insert';
            }
            
            return this;
        };
        
        /*
         * Update statement
         * Set the column and value to update
         * 
         * @param column string the column to update
         * @param value string the value to update
         * @return db object
         */
        this.set = function(column, value) {
            this._set.push(column + ' = ' + this.encapsulate(value));
            
            return this;
        };
        
        /*
         * Custom statement
         * Set a custom query to execute
         * 
         * @param query string the whole query to execute
         * @return db object
         */
        this.setQuery = function(query) {
            this._query = query;
            this._error = null;
            this._result = false;
            
            return this;
        };
        
        /*
         * Query builder
         * Builds the query based on what has been inputted previously
         * 
         * @return db object
         */
        this.query = function() {
            // Build the query type
            switch(this._type) {
                case 'select':
                    this._query = 'SELECT';
                    if (this._select.length) {
                        this._query += ' ' + this.joinQuery(this._select, ', ', ' ', true) + ' ';
                    }
                    else {
                        this._query += ' * ';
                    }

                    this._query += 'FROM';
                    if (this._from.length) {
                        this._query += ' ' + this._from + ' ';
                    }
                    else {
                        this._error = 'Missing From';
                    }

                    if (this._join.length) {
                        this._query += ' ' + this.joinQuery(this._join, ' JOIN ') + ' ';
                    }

                    if (this._where.length) {
                        this._query += 'WHERE';
                        this._query += ' ' + this.joinQuery(this._where, ' AND ', ' ', true) + ' ';
                    }

                    if (this._order.length) {
                        this._query += 'ORDER BY';
                        this._query += ' ' + this.joinQuery(this._order, ', ', ' ', true) + ' ';
                    }
                break;
                case 'insert':
                    this._query = 'INSERT INTO';
                    if (this._insert.length) {
                        this._query += ' ' + this._insert + ' ';
                    }
                    else {
                        this._error = 'Missing Table to Insert into';
                    }

                    if (this._columns.length) {
                        this._query += ' (' + this.joinQuery(this._columns, ', ', '', true, true) + ') ';
                    }
                    else {
                        this._error = 'Missing Columns to Insert into';
                    }
                    
                    if (this._values.length) {
                        this._query += 'VALUES';
                        this._query += ' ' + this.joinQuery(this._values, '(', '), ').replace(/\,\s$/, '') + ' ';
                    }
                    else {
                        this._error = 'No Values to Insert';
                    }
                break;
                case 'update':
                    this._query = 'UPDATE';
                    if (this._update.length) {
                        this._query += ' ' + this._update + ' ';
                    }
                    else {
                        this._error = 'Missing Table to Update';
                    }
                    
                    this._query += 'SET';
                    if (this._set.length) {
                        this._query += ' ' + this.joinQuery(this._set, ', ', '', true) + ' ';
                    }
                    else {
                        this._error = 'Missing Columns/Values to Update';
                    }

                    if (this._where.length) {
                        this._query += 'WHERE';
                        this._query += ' ' + this.joinQuery(this._where, ' AND ', ' ', true) + ' ';
                    }
                break;
            }
            
            // Remote items from the query builder
            this.flush();
            
            // Clean the query
            return this.cleanQuery();
        };
        
        /*
         * Query builder
         * Get the completed query
         * 
         * @return db query
         */
        this.sql = function() {
            return this._query;
        };
        
        /*
         * Query builder
         * Execute the query and return the results on a callback
         * 
         * @param callback function the function to run once the query execution completes
         * @return callback function
         */
        this.execute = function(callback) {
            // If there is an error, no point in executing
            if (this._error == null) {
                // Begin the transaction to allow rollback if execution fails
                this.db.transaction(function (tx) {
                    // Execute the query and return the callback
                    tx.executeSql(app.dbAdapter._query, [], function (tx, results) {
                        app.dbAdapter._query = '';
                        app.dbAdapter._result = results;
                        callback(results);
                    }, function (tx, err) {
                        app.dbAdapter._query = '';
                        app.dbAdapter._error = err.message;
                        callback(false);
                    });
                }, function (err) {
                    app.dbAdapter._query = '';
                    app.dbAdapter._error = err.message;
                    callback(false);
                });
            }
            else {
                this._query = '';
                callback(false);
            }
        };
        
        /*
         * Database Error
         * Get any error messages that have been created
         * 
         * @return error string
         */
        this.error = function() {
            return this._error;
        };
        
        /*
         * Join Query
         * Joins Query items for the Query Builder
         * 
         * @param items array items to be joined together
         * @param pre string added at the begining of each item
         * @param post string added at the end of each item
         * @param skipFirst boolen check if must add pre on first item
         * @param skipLast boolen check if must add post on last item
         * @param encapsulate boolen checks the item type and encapsulates
         * @return result string the joined items
         */
        this.joinQuery = function(items, pre, post, skipFirst, skipLast, encapsulate) {
            var result = '';
            
            // Loop through items
            for(var i = 0; i < items.length; i++) {
                // Check if first item
                if (i == 0) {
                    // If must not skip, then add pre
                    if (!skipFirst) {
                        result += ((pre != null) ? pre : ' ');
                    }
                }
                else {
                    result += ((pre != null) ? pre : ' ');
                }
                
                // Check if item needs to be encapsulated
                result += (encapsulate) ? this.encapsulate(items[i]) : items[i];
                
                // Check if last item
                if (i == (items.length-1)) {
                    // If must not skip, then add post
                    if (!skipLast) {
                        result += ((post != null) ? post : ' ');
                    }
                }
                else {
                    result += ((post != null) ? post : ' ');
                }
            }
            
            return result;
        };
        
        /*
         * Encapsulate Item
         * Checks and item's type and encapsulates accordingly
         * 
         * @param item mixed item to check
         * @return item mixed the encapsulated item
         */
        this.encapsulate = function(item) {
            if (typeof(item) == 'string') {
                item = "'" + item + "'";
            }
            
            return item;
        };
        
        /*
         * Clean Query
         * Cleans the query of any double spaces and trims it
         * 
         * @return db object
         */
        this.cleanQuery = function() {
            this._query = this._query.replace(/\s+/g, ' ').trim();
            
            return this;
        };
        
        /*
         * Flush Query
         * Resets the db object to default, excludes query, result, error
         * 
         * @return db object
         */
        this.flush = function() {
            this._type = null;
            this._select = [];
            this._from = '';
            this._join = [];
            this._where = [];
            this._order = [];
            this._insert = '';
            this._columns = [];
            this._values = [];
            this._update = '';
            this._set = [];
            
            return this;
        };
    };
    
    return db;
});
