define(['tpl!view/character.tpl', 'tpl!view/characterList.tpl'], function(characterView, characterListView) {
    var character = function(id, name, characterList, characterOutput) {
        this._id = id;
        this._name = name;
        this._characterList = characterList;
        this._characterOutput = characterOutput;
        
        this.load = function() {
            this.renderCharacterList();
            this.renderCharacter();
        };
        
        this.getClassName = function() {
            var className = lcfirst(ucwords(this._name.toLowerCase()).replace(' ', ''));
            
            return className;
        };
        
        this.renderCharacterList = function() {
            this._characterList.prepend(
                characterListView(
                    {
                        characterLink: this.getClassName(),
                        characterName: this._name
                    }
                )
            );
        };
        
        this.renderCharacter = function() {
            this._characterOutput.prepend(
                characterView(
                    {
                        characterLink: this.getClassName(),
                        characterName: this._name
                    }
                )
            );
        };
    };
    
    return character;
});