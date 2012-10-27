<div class="tab-pane" id="<%= characterLink %>">
    <h3><%= characterName %></h3>
    <ul class="nav nav-pills">
        <li class="active"><a href="#macros" data-toggle="pill">Macros</a></li>
        <li><a href="#variables" data-toggle="pill">Variables</a></li>
        <li><a href="#add" data-toggle="pill">Add</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="macros">Your Macros</div>
        <div class="tab-pane" id="variables">Your Variables</div>
        <div class="tab-pane" id="add">
            <div class="form-actions">
                <div class="input-prepend input-append">
                    <span class="add-on">Name</span>
                    <input class="span2" id="letter" maxlength="1" type="text" placeholder="Macro/Variable Name" />
                </div>

                <div class="input-prepend input-append">
                    <span class="add-on">Macro/Var</span>
                    <textarea class="span2" placeholder="Enter Macro/Variable"></textarea>
                </div>
                <div class="btn-toolbar">
                    <div class="btn-group" id="controls">
                        <button class="btn btn-success" id="addMacro">Add Macro</button>
                        <button class="btn btn-info" id="addVariable">Add Variable</button>
                        <button class="btn btn-danger" id="deleteItem">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>