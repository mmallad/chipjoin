function _ChipJoin(){}
var ChipJoin;
Usergrid.organizations = new Usergrid.Organization();
if (Usergrid.apiUrl) {
    Usergrid.ApiClient.setApiUrl(Usergrid.apiUrl);
}
function keys(o) {
    var a = [];
    for (var propertyName in o) {
        a.push(propertyName);
    }
    return a;
}
var applicationData = {};
var queryPath = '';
var current_username = '';
var current_group = '';
var current_role = '';

function get_gravatar(email, size) {
    var size = size || 50;
    return 'https://secure.gravatar.com/avatar/' + MD5(email) + '?s=' + size + encodeURI("&d=http://apigee.com/usergrid/images/user_profile.png");
}
(function(){

    ChipJoin = function(){return new _ChipJoin();};
    _ChipJoin.prototype.APIURL = 'http://localhost:8080/';
    _ChipJoin.prototype.AppControllerModel = null;
    _ChipJoin.prototype.ErrorMsg = function(m){
        return '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>'+m+'</div>';
    };
    _ChipJoin.prototype.SuccMsg = function(m){
        return '<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>'+m+'</div>';
    };
    _ChipJoin.prototype.InfoMsg = function(m){
        return '<div class="alert alert-Info"><button type="button" class="close" data-dismiss="alert">&times;</button>'+m+'</div>';
    };
    _ChipJoin.prototype.runManagementQuery = function(_queryObj) {
        var obj = _queryObj || queryObj;
        Usergrid.ApiClient.runManagementQuery(obj);
        return false;
    }
    _ChipJoin.prototype.runAppQuery = function(_queryObj){
        var obj = _queryObj || queryObj;
        Usergrid.ApiClient.runAppQuery(obj);
        return false;
    };
    _ChipJoin.prototype.activateQueryRowJSONButton = function() {
        $("#button-query-show-row-JSON").removeClass('disabled').addClass('active');
        $("#button-query-show-row-content").removeClass('active').addClass('disabled');
    };

    _ChipJoin.prototype.activateQueryRowContentButton = function() {
        $("#button-query-show-row-JSON").removeClass('active').addClass('disabled');
        $("#button-query-show-row-content").removeClass('disabled').addClass('active');
    };
    //TODO Show Messages :)
    _ChipJoin.prototype.showMsg = function(m){
        $("#holdMsg").html();
        $("#holdMsg").show();
        $("#holdMsg").html(m);
        window.setTimeout(function(){$("#holdMsg").hide();},5000);
    };
    _ChipJoin.prototype.compare = function(a,b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    };
    _ChipJoin.prototype.get_replacementGravatar = function(picture) {
        picture = picture.replace(/^http:\/\/www.gravatar/i, 'https://secure.gravatar');
        //note: changing this to use the image on apigee.com - since the gravatar default won't work on any non-public domains such as localhost
        //this_data.picture = this_data.picture + encodeURI("?d="+window.location.protocol+"//" + window.location.host + window.location.pathname + "images/user_profile.png");
        //TODO Change Default Image URL
        picture = picture + encodeURI("?d=http://apigee.com/usergrid/images/user_profile.png");
        return picture;
    };
    _ChipJoin.prototype.buildContentArea = function(obj2) {
        function getProperties(obj, depth){
            depth = 1;
            var output = '';
            for (var property in obj) {
                if (depth ==1) { output += '<tr>';}
                if (obj.hasOwnProperty(property)){
                    if (obj[property].constructor == Object || obj[property] instanceof Array) {

                        var prop = (obj[property] instanceof Array)?property:'';
                        //console.log('**Object -> '+property+': ');
                        output += '<td>'+prop+'</td><td style="padding: 0"><table><tr>';
                        output += getProperties(obj[property], depth);
                        output += '</td></tr></table>';
                    }
                    else {
                        //console.log(property + " " + obj[property]);
                        output += '<td>'+property+'</td><td>'+obj[property]+'</td>';
                    }
                }
                if (depth ==1) { output += '</tr>';}
            }
            return output;
        }
        var output = getProperties(obj2, '', 0);
        return '<table>' + output + '</table>';
    };
    //Cookies Set and Get
    _ChipJoin.prototype.setCookie = function(n,v,e)
    {
        var exdate = new Date();
        exdate.setDate(exdate.getDate()+e);
        document.cookie = n+"="+v;
    };
    _ChipJoin.prototype.checkLength2 = function(input, min, max) {
        if (input.val().length > max || input.val().length < min) {
            return false;
        }

        return true;
    };

    _ChipJoin.prototype.checkRegexp2 = function(input, regexp, tip) {
        if (! (regexp.test(input.val()))) {
            return false;
        }
        return true;
    };
    _ChipJoin.prototype.runCollectionQuery = function(){
        var method;


        //Select method to use
        if($('#button-query-get').prop('checked') ){
            method = 'GET';
        } else if($('#button-query-post').prop('checked')){
            method = 'POST';
        } else if($('#button-query-put').prop('checked')){
            method = 'PUT';
        } else if($('#button-query-delete').prop('checked')){
            method = 'DELETE';
        } else {
            //TODO Show Error
            alert("Please select a method.");
            return;
        }


        //If jsonBody is empty fill it with empty brackets
        if($('#query-source').val() === '') {
            $("#query-source").val('{"name":"value"}');
        }
        ChipJoin().getCollection(method);
    };
    _ChipJoin.prototype.checkTrue2 = function(input, exp, tip) {
        if (!exp) {
            return false;
        }

        return true;
    };
    _ChipJoin.prototype.getCookie = function(v){
        var ck = document.cookie;
        var cStart = ck.indexOf(" "+v+"=");
        if(cStart==-1)
        {
            cStart = ck.indexOf(v+"=");
        }
        if(cStart==-1)
        {
            ck = null;
        }
        else
        {
            cStart = ck.indexOf("=",cStart)+1;
            var cEnd = ck.indexOf(";",cStart);
            if(cEnd == -1)
            {
                cEnd = ck.length;
            }
            return ck.substring(cStart,cEnd);
        }
        return ck;
    };
    //TODO Switch Panels
    _ChipJoin.prototype.switchPanel = function(panel,name){
        $("#"+panel).show();
        $("#panelDashBoard").hide();
        $("#navCurrent").html(name);
    };

    //TODO Show User Edit Panel.
    _ChipJoin.prototype.showEditProfilePanel = function(){
        ChipJoin().switchPanel("panelUserDetailEdit","Edit User");
        $("#panelUserDetailView").hide();
    };

    //TODO Hide User Edit Panel.
    _ChipJoin.prototype.hideEditProfilePanel = function(){
        ChipJoin().switchPanel("panelUserDetailView","User Detail");
        $("#panelUserDetailEdit").hide();
    };


    //TODO Show Group Edit Panel.
    _ChipJoin.prototype.showEditGroupPanel = function(){

        ChipJoin().switchPanel("panelGroupDetailEdit","Edit Group");
        $("#panelGroupDetailView").hide();
    };
     //TODO Delete
    _ChipJoin.prototype.deleteEntity = function(e) {
        e.preventDefault();
        var items = $('#query-response-table input[class=listItem]:checked');
        if(!items.length){
            alert("Please, first select the entities you want to delete.");
            return;
        }
        var itemsCount = items.size();
        if(confirm("Are you sure you want to delete?")){
            items.each(function() {
                var path = $(this).attr('name');
                ChipJoin().runAppQuery(new Usergrid.Query("DELETE", path, null, null,
                    function() {
                        itemsCount--;
                        if(itemsCount==0){
                            ChipJoin().getCollection('GET');
                        }},
                    function() {
                        //TODO Show Error
                        alert("Unable to delete: " + path); }
                ));
            });
        }
    };
    //TODO Hide Group Edit Panel.
    _ChipJoin.prototype.hideEditGroupPanel = function(){
        ChipJoin().switchPanel("panelGroupDetailView","Group Detail");
        $("#panelUserDetailEdit").hide();
    };
    _ChipJoin.prototype.requestIndexes = function(path){
        var data = {};
        ChipJoin().runAppQuery(new Usergrid.Query("GET", path + "/indexes", null, null,
            function(response) {
                if(response && response.data) {
                    data = response;
                }
                ChipJoin().buildIndexDropdown('query-collections-indexes-list', data);

            }));
    };
    //TODO Save Updated Group.
    _ChipJoin.prototype.saveEditGroup = function(){

        var uuid = $("#groupIDupdate").val();
        var groupPath = $("#inputGroupPath").val();
        var groupTitle = $("#inputGroupTitle").val();
        var data = {
                    "path":groupPath,
                    "title":groupTitle
        };
        ChipJoin().runAppQuery(new Usergrid.Query("PUT", "groups/"+uuid, data, null,
            function(){
                ChipJoin().showMsg("Group update success. You may require to reload the page.");
            },
            function() {
                //TODO Show error.
                ChipJoin().showMsg("Could not update group.");
            }
        ));

    };
    _ChipJoin.prototype.validateJson = function() {
        try {
            var result = JSON.parse($('#query-source').val());
            if (result) {
                $('#query-source').val(
                    JSON.stringify(result, null, "  "));
                return result;
            }
        } catch(e) {
        }
        return false;
    };
    _ChipJoin.prototype.getCollection = function(method, path){
        //get the data to run the query
        if(!path){
            var path = $("#query-path").val();
        }
        if(method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'DELETE'){
            var data = $("#query-source").val();
            try{
                ChipJoin().validateJson();
                data = JSON.parse(data);
            } catch (e) {
                //TODO Show Error
                alert("There is a problem with your JSON.");
                return false;
            }
        }

        var params = {};
        var ql = $("#query-ql").val();
        params.ql = ql;
        if(method.toUpperCase() === 'GET'){
            var limit = $("#query-limit").val();
            params.limit = limit;
        }
        var queryPath = path;

        var queryObj = new Usergrid.Query(method, path, data, params, ChipJoin().getCollectionCallback, function(response) {
            //TODO Show Error
            alert(response) });
        ChipJoin().runAppQuery(queryObj);
    };
    //TODO Get Collections
    _ChipJoin.prototype.getCollections = function() {
        //clear out the table before we start
        var output = $('#collections-table');
        output.empty();
        var section =$('#application-collections');
        section.empty().html('<div class="alert alert-info">Loading....</div>');

        var queryObj = new Usergrid.Query("GET",'', null, null, ChipJoin().getCollectionsCallback,
            function() {
                //TODO Show Error
                ChipJoin().showMsg("There was an error getting the collections"); }
        );

        ChipJoin().runAppQuery(queryObj);
        return false;
    };
    _ChipJoin.prototype.getCollectionCallback = function(response) {
        $('#query-response-area').show();
        if (response.action == 'post') {
            //pageSelectCollections();
        }

        var path = response.path || "";
        path = "" + path.match(/[^?]*/);
        var path_no_slashes = "";
        try {
            path_no_slashes = response.path.replace(/\//g,'');
        } catch(e) {}

        $("#collections-link-buttons li").removeClass('active');
        $("#collections-link-button-"+path_no_slashes).addClass('active');

        if(response.action === ("delete")){
            ChipJoin().getCollection("GET", path);
            return;
        }
        var slashes = (queryPath.split("/").length -1)
        if (response.entities.length == 1 && slashes > 1){
            //generateBackToCollectionButton(response.path);
        } else {
            $('#back-to-collection').hide();
        }
        if (!slashes && queryPath.length > 0) {
            queryPath = "/" + queryPath;
        }

        $('#query-path').val(queryPath);

        $("#collection-type-field").html(response.path);
        var output = $('#query-response-table');
        if (response.entities) {
            if (response.entities.length < 1) {
                output.replaceWith('<table id="query-response-table" class="table"><tbody><tr class="zebraRows users-row"><td>No entities found</td></tr></table>');
            } else {
                //Inform the user of a valid query
               // showQueryStatus('Done');

                var entity_type = response.entities [0].type;

                var table = '<table id="query-response-table" class="table"><tbody><tr class="zebraRows users-row">' +
                    '<td class="checkboxo"><input type="checkbox" onclick="ChipJoin().selectAllEntities(this);" /></td>';
                if (entity_type === 'user') {
                    table += '<td class="gravatar50-td">&nbsp;</td>'+
                        '<td class="user-details bold-header">username</td>'+
                        '<td class="user-details bold-header">Display Name</td>';
                } else if (entity_type === 'group') {
                    table += '<td class="user-details bold-header">Path</td>'+
                        '<td class="user-details bold-header">Title</td>';
                } else if (entity_type === 'role') {
                    table += '<td class="user-details bold-header">Title</td>'+
                        '<td class="user-details bold-header">Rolename</td>';
                } else {
                    table += '<td class="user-details bold-header">Name</td>';
                }
                table += '<td class="view-details">&nbsp;</td>' +
                    '</tr></tbody></table>';
                output.replaceWith(table);
                for (i = 0; i < response.entities.length; i++) {
                    var this_data = {}
                    this_data.r = response.entities [i];

                    //next get a table view of the object
                    this_data.content = ChipJoin().buildContentArea(response.entities [i]);


                    //get a json representation of the object
                    this_data.json = JSON.stringify(response.entities [i], null, 2);

                    if (this_data.type === 'user') {
                        if (!this_data.r.picture) {
                            this_data.r.picture = window.location.protocol+ "//" + window.location.host + window.location.pathname + "images/user-photo.png"
                        } else {
                            this_data.r.picture = ChipJoin().get_replacementGravatar(this_data.r.picture);
                        }
                    } else {
                        if (!this_data.r.name) {
                            this_data.r.name = '[No value set]';
                        }
                    }
                    $("#uiForXYZ").tmpl(this_data).appendTo('#query-response-table');
                }

            }
        } else {
            output.replaceWith('<table id="query-response-table" class="table"><tbody><tr class="zebraRows users-row"><td>No entities found</td></tr></table>');
        }

        //showPagination('query-response');
    };
    //TODO Open Page Query Explorer.
    _ChipJoin.prototype.pageOpenQueryExplorer = function(collection) {

        collection = collection || "";
        //showPanel("#collections-panel");
        //hideMoreQueryOptions();
        //reset the form fields
        $("#query-path").val("");
        $("#query-source").val("");
        $("#query-ql").val("");
        //showQueryCollectionView();
        var query_history = [];
        //Prepare Collection Index Dropdown Menu
        ChipJoin().requestIndexes(collection);
        //bind events for previous and next buttons
        //bindPagingEvents('query-response');
        //clear out the table before we start
        var output = $('#query-response-table');
        output.empty();
        //if a collection was provided, go ahead and get the default data
        if (collection) {
            ChipJoin().getCollection('GET', collection);
        }
    };
   //TODO Get Collection Callback
    _ChipJoin.prototype.getCollectionsCallback = function(response) {
        //$('#collections-pagination').hide();
       // $('#collections-next').hide();
        //$('#collections-previous').hide();
        //showEntitySelectButton();
        if (response.entities && response.entities[0] && response.entities[0].metadata && response.entities[0].metadata.collections) {
            applicationData.Collections = response.entities[0].metadata.collections;
            //updateApplicationDashboard();
            //updateQueryAutocompleteCollections();
        }

        var data = response.entities[0].metadata.collections;
        var output = $('#collections-table');

        var elements = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                elements.push(data[key]);
            }
        }
        elements.sort(ChipJoin().compare);
        var r = {};
        if ($.isEmptyObject(data)) {
            output.replaceWith('<div id="collections-table" class="collection-panel-section-message">No collections found.</div>');
        } else {
            output.replaceWith('<table id="collections-table" class="table"><tbody></tbody></table>');
            var leftMenuContent = '<ul id="collections-link-buttons" class="nav nav-list" style="margin-bottom: 5px;">';
            for (var i=0;i<elements.length;i++) {
                r.name = elements[i];
                r.count = data[elements[i].count];
                $("#uiForCollectionWHichDoNot").tmpl(r).appendTo('#collections-table');

                var link = "ChipJoin().pageOpenQueryExplorer('"+elements[i].name+"'); return false;";
                leftMenuContent += '<li id="collections-link-button-'+elements[i].name+'"><a href="javascript:" onclick="'+link+'" class="collection-nav-links"><span class="nav-menu-text">/'+elements[i].name+'</span></a></li>';


            }
            /*
             for (var i in data) {
             var this_data = data[i];
             $.tmpl('apigee.ui.collections.table_rows.html', this_data).appendTo('#collections-table');

             var link = "Usergrid.console.pageOpenQueryExplorer('"+data[i].name+"'); return false;";
             leftMenuContent += '<li id="collections-link-button-'+data[i].name+'"><a href="#" onclick="'+link+'" class="collection-nav-links"><span class="nav-menu-text">/'+data[i].name+'</span></a></li>';
             }*/
            leftMenuContent += '</ul>';
            $('#left-collections-content').html(leftMenuContent);
        }
    };
    //TODO Update Users
    _ChipJoin.prototype.saveUserProfile = function(){

        var email = $('#inputEmail');
        var username = $('#inputUsername');
        var fullname = $('#inputName');
        var tel = $('#inputPhone');
        var adr1 = $('#inputStreet1');
        var adr2 = $('#inputStreet2');
        var city = $('#inputCity');
        var state = $('#inputState');
        var zip = $('#inputZip');
        var country = $('#inputCountry');
        //TODO DO some validation.
        if (!(usernameRegex.test(username.val()))) {
            alert("Invalid username.");
        }
        else if (!$.trim(fullname.val()).length) {
            alert("Invalid name.");
        }
        else if (!(emailRegex.test(email.val()))) {
            alert("Invalid email.");
        }
        else
        {
            var data = {
                "username":username.val(),
                "name":fullname.val(),
                "title":"",
                "url":"",
                "email":email.val(),
                "tel":tel.val(),
                "bday":"",
                "adr":{
                    "addr1":adr1.val(),
                    "addr2":adr2.val(),
                    "city":city.val(),
                    "state":state.val(),
                    "zip":zip.val(),
                    "country":country.val()
                }};
            ChipJoin().runAppQuery(new Usergrid.Query("PUT", "users/"+$("#userIDupdate").val(), data, null,
                function(){
                    alert("Update success.");
                },
                function() {
                    //TODO SHOW ERROR
                    alert("Update failed.");
                }
            ));
        }

    };
    //TODO Delete Users
    _ChipJoin.prototype.deleteUsers = function(e) {
        e.preventDefault();

        var items = $('#users-table input[class^=listItem]:checked');
        if(!items.length){
            alert("Please, first select the users you want to delete.");
            return;
        }

        if(confirm("Are you sure you want to delete?")){
            items.each(function() {
                var userId = $(this).attr("value");
                ChipJoin().runAppQuery(new Usergrid.Query("DELETE", 'users/' + userId, null, null,
                    ChipJoin().getAllUsers,
                    function() {
                        //TODO Show Error
                        alert("Unable to delete user - " + userId) }
                ));
            });
        }
    };
    //TODO Get All Users.
    _ChipJoin.prototype.getAllUsers = function(){
        var query = {"ql" : "order by username"};
        ChipJoin().runAppQuery(new Usergrid.Query("GET", "users", null, query,
            function(response){
                var output = $('#users-table');
                var s = '';
                if (response.entities.length < 1) {
                    output.html('<div id="users-table" class="panel-section-message">No users found.</div>');
                } else {
                    s = '<table id="users-table" class="table table-bordered table-striped"><thead><tr class="zebraRows users-row"><th class="checkboxo"><input type="checkbox" onclick="ChipJoin().selectAllEntities(this);" /></th><th class="gravatar50-td">&nbsp;</th><th class="user-details bold-header">Username</th><th class="user-details bold-header">Display Name</th><th class="view-details">&nbsp;</th></tr></thead><tbody>';
                    for (i = 0; i < response.entities.length; i++) {
                        var this_data = response.entities[i];
                        if (!this_data.picture) {
                            this_data.picture = window.location.protocol+ "//" + window.location.host + window.location.pathname + "images/user-photo.png"
                        }
                        //alert(this_data.picture);
                        s += '<tr class="zebraRows users-row"><td><input class="listItem" type="checkbox" name="'+this_data.name+'" value="'+this_data.uuid+'" /></td><td><img width="50" height="50" src="'+this_data.picture+'"//></td><td>'+this_data.name+'</td><td>'+this_data.username+'</td><td><a href="javascript:" onclick="ChipJoin().openUserProfile(\''+this_data.username+'\');">View Details<a/></td></tr>';
                    }
                    s += '</tbody></table>';
                    output.html(s);
                    ChipJoin().getAllGroups();
                    ChipJoin().getAllRoles();
                }
            },
            function(response){
                //TODO Show Error Message.
                alert("Oops could not load any users.");
            }
        )
        );
    };
     //TODO Delete Roles
    _ChipJoin.prototype.deleteRoles = function(e) {
        e.preventDefault();

        var items = $('#roles-table input[class^=listItem]:checked');
        if(!items.length){
            alert("Please, first select the roles you want to delete.")
            return;
        }
        if(confirm("Are you sure you want to delete?")){
            items.each(function() {
                var roleName = $(this).attr("value");
                ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "roles/" + roleName, null, null,
                    ChipJoin().getAllRoles,
                    function() {
                        //TODO Show Error
                        alert("Unable to delete role"); }
                ));
            });
        }
    };
    //TODO Get All Roles
    var roleLetter = '*';
    var roleSortBy = 'title';
    _ChipJoin.prototype.getAllRoles = function(){
        var query = {};
        if (roleLetter != "*") query = {"ql" : roleSortBy + "='" + groupLetter + "*'"};
        var queryObj = new Usergrid.Query("GET", "roles", null, query,
            function(response){
                var grpHolder = $("#roles-table");
                var s = '';
                if (response.entities < 1) {
                    grpHolder.html("Could not load groups.");
                }
                else
                {
                    s = '<table id="users-table" class="table table-bordered table-striped"><thead><tr class="zebraRows users-row"><th class="checkboxo"><input type="checkbox" onclick="ChipJoin().selectAllEntities(this);" /></th><th class="user-details bold-header">Title</th><th class="user-details bold-header">Role Name</th><th class="view-details">&nbsp;</th></tr></thead><tbody>';
                    for (var i = 0; i < response.entities.length; i++) {
                        var this_data = response.entities[i];
                        s += '<tr class="zebraRows users-row"><td><input type="checkbox" class="listItem" value="'+this_data.uuid+'" /></td><td>'+this_data.title+'</td><td>'+this_data.roleName+'</td><td><a href="javascript:" onclick="ChipJoin().openRoleProfile(\''+this_data.roleName+'\',\''+this_data.title+'\');">View Details<a/></td></tr>';
                    }
                    s += '</tbody></table>';
                    grpHolder.html(s);
                }
            }
            , function() {
                //TODO Show Error
                alert("Oops could not load roles.");
            });
        ChipJoin().runAppQuery(queryObj);
    };

    //TODO Select All Check Box Entities
    _ChipJoin.prototype.selectAllEntities = function(checkbox){
        if (checkbox.checked) {
            $('[class=listItem]').attr('checked', true);
        } else {
            $('[class=listItem]').attr('checked', false);
        }
    };

    //TODO Deleted Groups
    _ChipJoin.prototype.deleteGroups = function(e) {
        e.preventDefault();

        var items = $('#groups-table input[class^=listItem]:checked');
        if (!items.length) {
            alert("Please, first select the groups you want to delete.")
            return;
        }

        if(confirm("Are you sure you want to delete?")){
            items.each(function() {
                var groupId = $(this).attr('value');
                ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "groups/" + groupId, null, null,
                    ChipJoin().getAllGroups,
                    function() {
                        //TODO Show Error
                        alert("Unable to delete group"); }
                ));
            });
        }
    };
    //TODO Get All Groups
    var groupLetter = "*";
    var groupSortBy = "path";
    _ChipJoin.prototype.getAllGroups = function(){
        var query = {"ql" : "order by " + groupSortBy};
        ChipJoin().runAppQuery(new Usergrid.Query("GET", "groups", null, query,
            function(response){
                var grpHolder = $("#groups-table");
                var s = '';
                if(response.entities.length < 1)
                {
                   grpHolder.html("No groups found.");
                }
                else
                {
                    s = '<table id="users-table" class="table table-bordered table-striped"><thead><tr class="zebraRows users-row"><th class="checkboxo"><input type="checkbox" onclick="ChipJoin().selectAllEntities(this);"/></th><th class="user-details bold-header">Path</th><th class="user-details bold-header">Title</th><th class="view-details">&nbsp;</th></tr></thead><tbody>';
                    for (var i = 0; i < response.entities.length; i++) {
                        var this_data = response.entities[i];
                        s += '<tr class="zebraRows users-row"><td><input class="listItem" type="checkbox" value="'+this_data.uuid+'" /></td><td>'+this_data.path+'</td><td>'+this_data.title+'</td><td><a href="javascript:" onclick="ChipJoin().openGroupProfile(\''+this_data.path+'\');">View Details<a/></td></tr>';
                    }
                    s += '</tbody></table>';
                    grpHolder.html(s);
                }
            },
            function(response){
                //TODO Show Error.
                alert("Could not load groups.");
            }
        ));

    };
    _ChipJoin.prototype.fillEditProfile = function(response){
        response.data.gravatar = get_gravatar(response.data.email, 50);
        $('#update-account-username').val(response.data.username);
        $('#update-account-name').val(response.data.name);
        $('#update-account-email').val(response.data.email);
        $('#update-account-picture-img').attr('src', response.data.gravatar);
        $('#update-account-bday').attr('src', response.data.gravatar);
    };
    _ChipJoin.prototype.loadAdmins = function(response){
        var sectionAdmins = $('#organization-admins-table');
        sectionAdmins.empty();
        if (response.data) {
            var admins = response.data;
            admins = admins.sort();
            var rData = [];
            for (var i in admins) {
                var admin = admins[i];
                admin.gravatar = get_gravatar(admin.email, 20);
                rData.push({"name":admin.name,"email":admin.email,"username":admin.username,"image":admin.gravatar});
                //$.tmpl('apigee.ui.admins.table_rows.html', admin).appendTo(sectionAdmins);
            }
            return rData;
        }
        return null;
    };
    _ChipJoin.prototype.displayApplications = function(response){
        var applications = {};
        var applications_by_id = {};

        if (response.data) {
            applications = response.data;
            var applicationNames = keys(applications).sort();
            var count = 0;
            var data = [];
            for (var i in applicationNames) {
                var name = applicationNames[i];
                var uuid = applications[name];
                data.push({uuid:uuid, name:name.split("/")[1]});
                count++;
                applications_by_id[uuid] = name.split("/")[1];
            }
            var appName = Usergrid.ApiClient.getApplicationName();
            //and make sure we it is in one of the current orgs
            var rData = [];
            var app = Usergrid.organizations.getItemByName(appName);
            if(appName && app) {
                Usergrid.ApiClient.setApplicationName(appName);
            } else {
                //we need to select an app, so get the current org name
                var orgName = Usergrid.ApiClient.getOrganizationName();
                //get a reference to the org object by using the name
                var org = Usergrid.organizations.getItemByName(orgName);
                //get a handle to the first app in the org
                app = org.getFirstItem();
                var list = org.getList();
                for(var d in list)
                {
                        rData.push({"name":list[d].getName(),"id":list[d].getUUID()});
                    //app = org.getFirstItem();
                    //alert(app.getName());
                }
                //store the new app in the client
                if(ChipJoin().getCookie("appName") == "*****" || !ChipJoin().getCookie("appName"))
                {
                    Usergrid.ApiClient.setApplicationName(app.getName());

                }
                else
                {
                    Usergrid.ApiClient.setApplicationName(ChipJoin().getCookie("appName"));
                }
                $("#currAppShow").html(Usergrid.ApiClient.getApplicationName());

                //TODO Load All Users
                ChipJoin().getAllUsers();
                ChipJoin().runAppQuery(new Usergrid.Query("GET","credentials", null, null,
                    function(response) {
                        $("#userCred").html('<tr><td>'+response.credentials.client_id+'</td><td>'+response.credentials.client_secret+'</td></tr>');
                    },
                    function(response) {

                        //TODO Show Error
                        $("#userCred").html('<tr><td colspan="2">'+ChipJoin().ErrorMsg("Could not load credentials.")+'</td></tr>');
                    }
                ));
                ChipJoin().getCollections();

            }
            return rData;

        }
        else
        {
            //TODO Show Error Message. :)
        }
    };

})();
var emailRegex = new RegExp("^(([0-9a-zA-Z]+[_\+.-]?)+@[0-9a-zA-Z]+[0-9,a-z,A-Z,.,-]*(.){1}[a-zA-Z]{2,4})+$");
var emailAllowedCharsMessage = 'eg. example@apigee.com';

var passwordRegex = new RegExp("^([0-9a-zA-Z@#$%^&!?<>;:.,'\"~*=+_\[\\](){}/\\ |-])+$");
var passwordAllowedCharsMessage = 'This field only allows: A-Z, a-z, 0-9, ~ @ # % ^ & * ( ) - _ = + [ ] { } \\ | ; : \' " , . < > / ? !';
var passwordMismatchMessage = 'Password must match';

var usernameRegex = new RegExp("^([0-9a-zA-Z\.\_-])+$");
var usernameAllowedCharsMessage = 'This field only allows : A-Z, a-z, 0-9, dot, underscore and dash';

var organizationNameRegex = new RegExp ("^([0-9a-zA-Z.-])+$");
var organizationNameAllowedCharsMessage = 'This field only allows : A-Z, a-z, 0-9, dot, and dash';

//Regex declared differently from al the others because of the use of ". Functions exacly as if it was called from new RegExp
var nameRegex = /[0-9a-zA-ZáéíóúÁÉÍÓÚÑñ@#$%\^&!\?;:\.,'\"~\*-=\+_\(\)\[\]\{\}\|\/\\]+/;
var nameAllowedCharsMessage = "This field only allows: A-Z, a-z, áéíóúÁÉÍÓÚÑñ, 0-9, ~ @ # % ^ & * ( ) - _ = + [ ] { } \\ | ; : \' \" , . / ? !";

var titleRegex = new RegExp("[a-zA-Z0-9.!-?]+[\/]?");
var titleAllowedCharsMessage = 'Title field only allows : space, A-Z, a-z, 0-9, dot, dash, /, !, and ?';

var alphaNumRegex = new RegExp("[0-9a-zA-Z]+");
var alphaNumAllowedCharsMessage = 'Collection name only allows : a-z A-Z 0-9';

var pathRegex = new RegExp("^[^\/]*([a-zA-Z0-9\.-]+[\/]{0,1})+[^\/]$");
var pathAllowedCharsMessage = 'Path only allows : /, a-z, 0-9, dot, and dash, paths of the format: /path, path/, or path//path are not allowed';

var roleRegex = new RegExp("^([0-9a-zA-Z./-])+$");
var roleAllowedCharsMessage = 'Role only allows : /, a-z, 0-9, dot, and dash';

var intRegex = new RegExp("^([0-9])+$");