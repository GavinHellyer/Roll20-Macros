define(['controller/characterController'], function(characterController) {
    var characters = function(characterList, characterOutput) {
        this._characters = [];
        this._characterList = characterList;
        this._characterOutput = characterOutput;
        
        this.create = function(name) {
            
        };
        
        this.loadAll = function() {
            var characterModel = this;
            app.dbAdapter.select().from('cms_characters').query().execute(function(results) {
                if (results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var id = results.rows.item(i).id;
                        var name = results.rows.item(i).name;
                        var character = new characterController(
                            id,
                            name,
                            characterModel._characterList,
                            characterModel._characterOutput
                        );
                        
                        character.load();
                        
                        characterModel._characters.push(character);
                    }
                }
            });
        };
    };
    
    return characters;
});