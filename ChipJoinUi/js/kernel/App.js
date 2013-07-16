angular.module('chipjoin',['dashBoardServices']).config(['$routeProvider', function($routeProvider){$routeProvider.when('/login',
    {templateUrl:'templates/login.html',
        controller:ChipJoin().LoginController}).when('/dashboard',{templateUrl:'templates/dashboard.html',
        controller:ChipJoin().AppController}).when('/register',{
        templateUrl:'templates/register.html',
        controller:ChipJoin().RegisterController
    }).otherwise({redirectTo:'/login'});
}]);

//TODO Delete Current Organization
_ChipJoin.prototype.deleteCurrentOrg = function(UUID){
    if(confirm("Are you sure you want to leave this organization?"))
    {
        ChipJoin().runManagementQuery(new Usergrid.Query("DELETE","users/" + Usergrid.userSession.getUserUUID() + "/organizations/" + UUID, null, null,
            function(response){
                ChipJoin().showMsg("Organization removed successfully. You may require to reload the page.");
            },
            function(response) {
                ChipJoin().showMsg("Could not remove organization");
            }));
    }
};
//TODO Switch Organization
_ChipJoin.prototype.switchOrg = function(orgName){
    //Set Organization :)
    ChipJoin().setCookie("orgName",orgName,null);
    var org = Usergrid.organizations.getItemByName(orgName);
    app = org.getFirstItem();
    ChipJoin().setCookie("appName",app.getName(),null);
    window.location.reload();
};
//TODO Switch Application
_ChipJoin.prototype.switchApp = function(appName)
{
    ChipJoin().setCookie("appName",appName,null);
    window.location.reload();
};
 //TODO Redraw Panel
_ChipJoin.prototype.redrawPanel = function(panelDiv, panelTemplate, data){
    $("#"+panelDiv).html("");
    $("#"+panelTemplate).tmpl(data).appendTo($("#"+panelDiv));
};
//TODO Redraw Membership
_ChipJoin.prototype.redrawUserMemberships = function(data, curl){
    ChipJoin().redrawPanel('user-panel-memberships', 'userPanelMemberShip', data);
    ChipJoin().updateAutocomplete('groups', ChipJoin().updateGroupsAutocompleteCallback, "Unable to retrieve Groups.");
};
//TODO Make Group Membership UI
_ChipJoin.prototype.redrawGroupMemberships = function(data, curl){
    ChipJoin().redrawPanel('group-panel-memberships', 'uiForGroupMemberShip', data);

};
//TODO Remove User From Group
_ChipJoin.prototype.removeUserFromGroup = function(userId){
    var items = $('#user-panel-memberships input[class^=listItem]:checked');
    if(!items.length){
        ChipJoin().showMsg("Please, first select the groups you want to delete for this user.")
        return;
    }
    if(confirm("Are you sure you want remove?")){
        items.each(function() {
            var groupId = $(this).attr("value");
            ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/groups/" + groupId + "/users/" + userId, null, null,
                function() {
                    ChipJoin().showMsg("Removed successfully. You may require to reload the page.");
                    ChipJoin().openUserProfile(current_username);
                },
                function() {
                    //TODO Show Error
                    ChipJoin().showMsg("Unable to remove user from group");
                }
            ));
        });
    }
};
//TODO Make User Activities
_ChipJoin.prototype.redrawUserActivities = function(data, curl){
    ChipJoin().redrawPanel('user-panel-activities', 'uiForUserActivities', data);
};
//TODO Make User Graph
_ChipJoin.prototype.redrawUserGraph = function(data, curlFollowing, curlFollowers){
    ChipJoin().redrawPanel('user-panel-graph', 'uiForUserPanelGraph', data);
    ChipJoin().updateAutocomplete('users/',ChipJoin().updateFollowUserAutocompleteCallback,"Unable to retrieve Users.");
};

//TODO Make Roles and Permission
_ChipJoin.prototype.redrawUserPermissions = function(data, curlRoles, curlPermissions){
    ChipJoin().redrawPanel('user-panel-permissions', 'uiForUserPanelPermissions', data);
    ChipJoin().updateAutocomplete('roles', ChipJoin().updateRolesAutocompleteCallback, "Unable to retrieve Roles.");
    ChipJoin().updateCollectionTypeahead('user-permission-path-entry-input');
};
//TODO Make Group Activities UI
_ChipJoin.prototype.redrawGroupActivities = function(data, curl){
    ChipJoin().redrawPanel('group-panel-activities', 'uiForGroupActivities', data);
};
//TODO Make Group Roles & Permission
_ChipJoin.prototype.redrawGroupPermissions = function(data, curlRoles, curlPermissions){
    if (data.roles && data.roles.length == 0) {
        delete data.roles
    }
    ChipJoin().redrawPanel('group-panel-permissions', 'uiForGroupRolesandPermission', data);
    ChipJoin().updateAutocomplete('roles', ChipJoin().updateRolesForGroupsAutocompleteCallback, "Unable to retrieve Roles.");
};
//TODO Load Organization Credentials
_ChipJoin.prototype.newOrganizationCredentials = function() {
    $("#userCred").html('<tr><td colspan="2">Loading....</td></tr>');
    ChipJoin().runManagementQuery(new Usergrid.Query("POST",'organizations/' + Usergrid.ApiClient.getOrganizationName()   + "/credentials",null, null,
        function(response) {
            $("#userCred").html('<tr><th>Client ID</th><th>Client Secret</th></tr><tr><td>'+response.credentials.client_id+'</td><td>'+response.credentials.client_secret+'</td></tr>');
            organization_keys = {client_id : response.credentials.client_id, client_secret : response.credentials.client_secret};
        },
        function() {
            $("#userCred").html('<tr><td colspan="2">'+ChipJoin().ErrorMsg("Could not load credentials.")+'</td></tr>');
        }
    ));
};
//TODO Open User's Profile
_ChipJoin.prototype.openUserProfile = function(username){
    ChipJoin().showMsg("Loading....");
    current_username = username;
    ChipJoin().switchPanel("panelUserDetailView","User Detail");
    $("#panelUserManagement").hide();
    $("#panelRoleDetailView").hide();
    $("#panelGroupDetailView").hide();
    $("#panelGroupDetailEdit").hide();
    $("#panelUserDetailEdit").hide();
    $("#panelDataExplorer").hide();
    $("#panelqueryShell").hide();
    //TODO Request For User Details
    ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/'+username, null, null,
        function(response){
            var hold = $("#loaduserProfileDetails");
            hold.html("Loading....");
            if (response.entities && (response.entities.length > 0)) {
                var entity = response.entities[0];
                var path = response.path || "";
                path = "" + path.match(/[^?]*/);
                var username = entity.username;
                var name = entity.uuid + " : " + entity.type;
                if (entity.username) {
                    name = entity.username;
                }

                if (entity.name) {
                    name = name + " : " + entity.name;
                }
                var collections = $.extend({ }, (entity.metadata || { }).collections, (entity.metadata || { }).connections);
                if ($.isEmptyObject(collections)){
                    collections = null;
                }

                var entity_contents = $.extend( false, { }, entity);
                delete entity_contents['metadata'];

                var metadata = entity.metadata;
                if ($.isEmptyObject(metadata)){
                    metadata = null;
                }

                var entity_path = (entity.metadata || {}).path;
                if ($.isEmptyObject(entity_path)) {
                    entity_path = path + "/" + entity.uuid;
                }
                var picture = window.location.protocol+ "//" + window.location.host + window.location.pathname + "images/user_profile.png";
                if (entity.picture) {
                    entity.picture = entity.picture.replace(/^http:\/\/www.gravatar/i, 'https://secure.gravatar');
                    //note: changing this to use the image on apigee.com - since the gravatar default won't work on any non-public domains such as localhost
                    //this_data.picture = this_data.picture + encodeURI("?d="+window.location.protocol+"//" + window.location.host + window.location.pathname + "images/user_profile.png");
                    picture = entity.picture + encodeURI("?d=http://apigee.com/usergrid/images/user_profile.png");
                }

                //TODO we can send this data to a function later :)
                var data = {
                    entity: entity_contents,
                    picture: picture,
                    name: name,
                    username: username,
                    path: entity_path,
                    collections: collections,
                    metadata: metadata,
                    uri: (entity.metadata || { }).uri,
                    followingCurl: "",
                    followersCurl: "",
                    rolesCurl: "",
                    permissionsCurl: ""
                };


                ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/' + entity.username + '/groups', null, null,
                    function(response) {
                        if (data && response.entities && (response.entities.length > 0)) {
                            data.memberships = response.entities;
                        }
                        ChipJoin().redrawUserMemberships(data, this.getCurl());
                    },
                    function() { ChipJoin().showMsg("Unable to retrieve user's groups."); }
                ));

                //TODO Load Activities

                ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/' + entity.username + '/activities', null, null,
                    function(response) {
                        if (data && response.entities && (response.entities.length > 0)) {
                            data.activities = response.entities;
                            data.curl = this.getCurl();
                            $('span[id^=activities-date-field]').each( function() {
                                var created = dateToString(parseInt($(this).html()))
                                $(this).html(created);
                            });
                        }
                        ChipJoin().redrawUserActivities(data, this.getCurl());
                    },
                    function() { ChipJoin().showMsg("Unable to retrieve user's activities.");}
                ));

                //TODO Load Followers

                ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/' + entity.username + '/following', null, null,
                    function(response) {
                        data.followingCurl = this.getCurl();
                        if (data && response.entities && (response.entities.length > 0)) {
                            data.following = response.entities;
                        }
                        //Requests /Followers after the /following response has been handled.
                        ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/' + entity.username + '/followers', null, null,
                            function(response) {

                                if (data && response.entities && (response.entities.length > 0)) {
                                    data.followers = response.entities;
                                }
                                data.followersCurl = this.getCurl();
                                ChipJoin().redrawUserGraph(data, data.followingCurl, data.followersCurl);
                            },
                            function() {
                                //TODO Show Error
                                ChipJoin().showMsg("Unable to retrieve user's followers.");
                            }
                        ));
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to retrieve user's following.");}
                ));
                 //TODO Load Roles and Permission
                ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/' + entity.username + '/roles', null, null,
                    function(response) {
                        if (data && response.entities && (response.entities.length > 0)) {
                            data.roles = response.entities;
                        } else {
                            data.roles = null;
                        }
                        data.rolesCurl = this.getCurl();
                        //Run Permissions query after roles query has been handled
                        ChipJoin().runAppQuery(new Usergrid.Query("GET", 'users/' + entity.username + '/permissions', null, null,
                            function(response) {
                                var permissions = {};
                                if (data && response.data && (response.data.length > 0)) {

                                    if (response.data) {
                                        var perms = response.data;
                                        var count = 0;

                                        for (var i in perms) {
                                            count++;
                                            var perm = perms[i];
                                            var parts = perm.split(':');
                                            var ops_part = "";
                                            var path_part = parts[0];

                                            if (parts.length > 1) {
                                                ops_part = parts[0];
                                                path_part = parts[1];
                                            }

                                            ops_part.replace("*", "get,post,put,delete")
                                            var ops = ops_part.split(',');
                                            permissions[perm] = {ops : {}, path : path_part, perm : perm};

                                            for (var j in ops) {
                                                permissions[perm].ops[ops[j]] = true;
                                            }
                                        }

                                        if (count == 0) {
                                            permissions = null;
                                        }
                                        data.permissions = permissions;
                                    }
                                }
                                data.permissionsCurl = this.getCurl();
                                ChipJoin().redrawUserPermissions(data, data.rolesCurl, data.permissionsCurl);
                            },
                            function() { ChipJoin().showMsg("Unable to retrieve user's permissions.");}
                        ));
                    },
                    function() { ChipJoin().showMsg("Unable to retrieve user's roles.");}
                ));
                //TODO Let us create UI FROM above data.

                var str = '<div style="margin-bottom: 10px;"><a href="javascript:" onclick="ChipJoin().showEditProfilePanel();" class="btn">Edit Profile</a> </div>';
                str += '<table class="table table-bordered">';
                str += '<tr>';
                str += '<th>UUID</th>';
                str += '<th>'+data.entity["uuid"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Type</th>';
                str += '<th>'+data.entity["type"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Username</th>';
                str += '<th>'+data.entity["username"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Name</th>';
                str += '<th>'+data.entity["name"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Email</th>';
                str += '<th>'+data.entity["email"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Activated</th>';
                str += '<th>'+data.entity["activated"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Created</th>';
                var createdDate = new Date(data.entity["created"]);
                str += '<th>'+createdDate.toLocaleString()+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Modified</th>';
                var modDate = new Date(data.entity["modified"]);
                str += '<th>'+modDate.toLocaleString()+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Picture</th>';
                str += '<th>'+data.entity["picture"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Path</th>';
                str += '<th>'+path+'/'+data.entity["uuid"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Collections</th>';
                str += '<th>';
                str += '<table class="table">'
                for(var coll in data.collections)
                {
                     str += '<tr><th>'+coll+'</th><th>/users/'+data.entity["uuid"]+'/'+coll+'</th></tr>';
                }
                str += '</table>';
                str += '</th>';
                str += '</tr>'
                str += '</table>';
                hold.html(str);

                //TODO Also fill data for profile edit.
                var editSrt = '';
                editSrt += '<input type="hidden" autocomplete="false" id="userIDupdate" value="'+data.entity["uuid"]+'" />';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputUsername">Username</label>\
                    <div class="controls">\
                    <input type="text" id="inputUsername" placeholder="Username" value="'+data.entity["username"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputName">Name</label>\
                    <div class="controls">\
                    <input type="text" id="inputName" placeholder="Name" value="'+data.entity["name"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputEmail">Email</label>\
                    <div class="controls">\
                    <input type="text" id="inputEmail" placeholder="Email" value="'+data.entity["email"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputPhone">Phone</label>\
                    <div class="controls">\
                    <input type="text" id="inputPhone" placeholder="Phone" value="'+data.entity["tel"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputStreet1">Street 1</label>\
                    <div class="controls">\
                    <input type="text" id="inputStreet1" placeholder="Street 1" value="'+data.entity["adr"]["addr1"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputStreet2">Street 2</label>\
                    <div class="controls">\
                    <input type="text" id="inputStreet2" placeholder="Street 2" value="'+data.entity["adr"]["addr2"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputCity">City</label>\
                    <div class="controls">\
                    <input type="text" id="inputCity" placeholder="City" value="'+data.entity["adr"]["city"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputState">State</label>\
                    <div class="controls">\
                    <input type="text" id="inputState" placeholder="State" value="'+data.entity["adr"]["state"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputZip">Zip</label>\
                    <div class="controls">\
                    <input type="text" id="inputZip" placeholder="Zip" value="'+data.entity["adr"]["zip"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputCountry">Country</label>\
                    <div class="controls">\
                    <input type="text" id="inputCountry" placeholder="Country" value="'+data.entity["adr"]["country"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                    <div class="controls">\
                    <input type="button" class="btn-primary" value="Save" onclick="ChipJoin().saveUserProfile();" /> \
                    <input type="button" class="btn" value="Cancel" onclick="ChipJoin().hideEditProfilePanel();" /> \
                    </div>';
                $("#panelUserDetailEditHolder").html(editSrt);
            }
            else
            {
                hold.html(ChipJoin().ErrorMsg("Could not load user details."));
            }
        }
        ,
        function() {
            //TODO Show Error.
            ChipJoin().showMsg("Could not fetch user details.");
        }
    ));
};
//TODO Delete User Permission
_ChipJoin.prototype.deleteUserPermission = function(userName, permission) {
    var data = {"permission": permission};
    if(confirm("Do you really want to remove?")){
        ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/users/" + userName + "/permissions", null, data,
            function(){
                ChipJoin().openUserProfile(current_username);
                ChipJoin().showMsg("Permission removed. You may require to reload the page.");
            },
            function(){
                //TODO Show Error
                ChipJoin().showMsg("Unable to delete permission"); }
        ));
    }
};
 //TODO Add User Permission
_ChipJoin.prototype.addUserPermission = function(userName) {
    var path = $('#user-permission-path-entry-input').val();
    var ops = "";
    var s = "";
    if ($('#user-permission-op-get-checkbox').prop("checked")) {
        ops = "get";
        s = ",";
    }
    if ($('#user-permission-op-post-checkbox').prop("checked")) {
        ops = ops + s + "post";
        s = ",";
    }
    if ($('#user-permission-op-put-checkbox').prop("checked")) {
        ops =  ops + s + "put";
        s = ",";
    }
    if ($('#user-permission-op-delete-checkbox').prop("checked")) {
        ops =  ops + s + "delete";
        s = ",";
    }
    var data = {"permission": ops + ":" + path};
    if (ops) {

        ChipJoin().showMsg("Please wait....");
        ChipJoin().runAppQuery(new Usergrid.Query("POST", "/users/" + userName + "/permissions/", data, null,
            function() {
                ChipJoin().showMsg("Permission added successfully.");
                ChipJoin().openUserProfile(current_username);
            },
            function() { ChipJoin().showMsg("Unable to add permission"); }
        ));
    } else {
        ChipJoin().showMsg("Please select a verb");
    }
};
//TODO Delete Users From Rule.
_ChipJoin.prototype.deleteUsersFromRoles = function(username) {
    var items = $('#users-permissions-response-table input[class^=listItem]:checked');
    if(!items.length){
        ChipJoin().showMsg("Please, first select the roles you want to delete for this user.");
        return;
    }
    if(confirm("Do you really want to remove?")){
        items.each(function() {
            var roleName = $(this).attr("value");
            ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/roles/" + roleName + "/users/" + username, null, null,
                function() {
                    //TODO Reload Code
                    ChipJoin().openUserProfile(current_username);
                    ChipJoin().showMsg("Loading....");
                },
                function() {
                    //TODO Show Error
                    ChipJoin().showMsg("Unable to remove user from role"); }
            ));
        });
    }
};
 var current_roleName = null;
 var current_roleTitle = null;
//TODO Open Role's Profile
_ChipJoin.prototype.openRoleProfile = function(roleName,roleTitle)
{
    ChipJoin().showMsg("Loading....");
    current_roleName = roleName;
    current_roleTitle = roleTitle;
    ChipJoin().switchPanel("panelRoleDetailView","Group Detail");
    ChipJoin().displayRoleInactivity(roleName);
    ChipJoin().getRolePermissions(roleName);
    ChipJoin().getRoleUsers(roleName,roleTitle);
    ChipJoin().getRoleGroups(roleName);
    $("#panelUserManagement").hide();
    $("#panelUserDetailView").hide();
};
//TODO Display Role Inactivity
_ChipJoin.prototype.displayRoleInactivity = function(roleName){
    ChipJoin().runAppQuery(new Usergrid.Query("GET", "roles/" + roleName, null, null,
        function(response) {
            if ( response && response.entities && response.entities[0].inactivity ){
                var inactivity = response.entities[0].inactivity.toString();
            } else {
                inactivity = 0;
            }
            $('#role-inactivity-input').val(inactivity);
        },
        function() {
            //TODO Show Error
            ChipJoin().showMsg("Could not load inactivity data.");
        }
    ));
};

//TODO Get Role Permission
_ChipJoin.prototype.getRolePermissions = function(roleName){
    ChipJoin().runAppQuery(new Usergrid.Query("GET", "roles/" + roleName + "/permissions", null, null,
        function(response) { ChipJoin().displayPermissions(roleName, response, this.getCurl()); },
        function() {
            //TODO Show Error
            ChipJoin().showMsg("Oops something went wrong wile loading role permission.");
        }
    ));
};
//TODO Display Role Permission
_ChipJoin.prototype.displayPermissions = function(roleName, response, curl){
    var section = $('#role-permissions');
    section.empty();
    var t = "";
    var m = "";
    var permissions = {};
    var localPermission = {};
    if (response.data) {
        var perms = response.data;
        var count = 0;
        for (var i in perms) {
            count++;
            var perm = perms[i];
            var parts = perm.split(':');
            var ops_part = "";
            var path_part = parts[0];
            if (parts.length > 1) {
                ops_part = parts[0];
                path_part = parts[1];
            }
            ops_part.replace("*", "get,post,put,delete")
            var ops = ops_part.split(',');
            permissions[perm] = {ops : {}, path : path_part, perm : perm};
            for (var j in ops) {
                permissions[perm].ops[ops[j]] = true;
            }
        }
        if (count == 0) {
            permissions = null;
        }
        $("#checkBoxTemplate").tmpl({"role" : roleName, "permissions" : permissions}, {}).appendTo('#role-permissions');
    } else {
        section.html('<div class="alert">No permission information retrieved.</div>');
    }
    ChipJoin().displayRoleInactivity(roleName);
};
//TODO Update Auto Complete
_ChipJoin.prototype.updateAutocomplete = function(path, successCallback, failureMessage){
    ChipJoin().runAppQuery(new Usergrid.Query("GET", path, null, null, successCallback,
        function(){
            //TODO Show Error.
            ChipJoin().showMsg("Oops could not load data"+path);
        }
    ));
    return false
};
//TODO List Users to Input
 _ChipJoin.prototype.updateUsersTypeahead = function(response, inputId){
    var users = {};
    if (response.entities) {
        users = response.entities;
    }
    var pathInput = $('#'+inputId);
    var list = [];
    for (var i in users) {
        list.push(users[i].username);
    }
    pathInput.typeahead({source:list});
    pathInput.data('typeahead').source = list;
};
_ChipJoin.prototype.updateRolesTypeahead = function(response, inputId){
    var roles = {};
    if (response.entities) {
        roles = response.entities;
    }
    var pathInput = $('#'+inputId);
    var list = [];
    $.each(roles, function(key, value){
        list.push(value.roleName);
    })
    pathInput.typeahead({source:list});
    pathInput.data('typeahead').source = list;
};

_ChipJoin.prototype.updateCollectionTypeahead = function(inputId){
    var pathInput = $("#"+ inputId);
    var list = [];

    for (var i in applicationData.Collections) {
        list.push('/' + applicationData.Collections[i].name);
    }

    pathInput.typeahead({source:list});
    pathInput.data('typeahead').source = list;
};

//TODO Callback
_ChipJoin.prototype.updateUsersAutocompleteCallback = function(response){
    ChipJoin().updateUsersTypeahead(response, 'search-roles-user-name-input');
};

_ChipJoin.prototype.updateRolesForGroupsAutocompleteCallback = function(response) {
    ChipJoin().updateRolesTypeahead(response, 'search-groups-role-name-input');
};

_ChipJoin.prototype.updateGroupsForRolesAutocomplete =function(){
    ChipJoin().updateAutocomplete('groups', ChipJoin().updateGroupsForRolesAutocompleteCallback, "Unable to retrieve Groups.");
};

_ChipJoin.prototype.updateGroupsForRolesAutocompleteCallback = function(response) {
    ChipJoin().updateGroupsTypeahead(response, 'search-roles-group-name-input');
};

_ChipJoin.prototype.updateGroupsAutocompleteCallback = function(response) {
    ChipJoin().updateGroupsTypeahead(response, 'search-group-name-input');
};

_ChipJoin.prototype.updateFollowUserAutocompleteCallback = function(response){
    ChipJoin().updateUsersTypeahead(response, 'search-follow-username-input');
};

_ChipJoin.prototype.updateRolesAutocompleteCallback = function(response) {
    ChipJoin().updateRolesTypeahead(response, 'search-role-name-input');
};

_ChipJoin.prototype.updateUsersForGroupAutocompleteCallback = function(response) {
    ChipJoin().updateUsersTypeahead(response, 'search-user-name-input');
};

_ChipJoin.prototype.updateGroupsTypeahead = function(response, inputId){
    groups = {};
    if (response.entities) {
        groups = response.entities;
    }
    var pathInput = $('#'+inputId);
    var list = [];
    for (var i in groups) {
        list.push(groups[i].path);
    }
    pathInput.typeahead({source:list});
    pathInput.data('typeahead').source = list;
};
//TODO Delete Role From User
_ChipJoin.prototype.deleteRoleFromUser = function(roleName, roleTitle){
    var items = $('#role-users input[class^=listItem]:checked');
    if(!items.length){
        ChipJoin().showMsg("Please select at least one record to delete.");
        return;
    }
        if(confirm("Are you sure you want to delete?"))
        {
            items.each(function() {
                var username = $(this).attr("value");
                ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/roles/" + roleName + "/users/" + username, null, null,
                    function() {
                        ChipJoin().showMsg("Loading....");
                        ChipJoin().getRoleUsers(roleName,roleTitle);
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().getRoleUsers(roleName,roleTitle);
                        ChipJoin().showMsg("Unable to delete role from user.");
                    }
                ));
            });
        }
};
//TODO Delete Role From Group
_ChipJoin.prototype.removeGroupFromRole = function(roleName, roleTitle) {
    var items = $('#role-panel-groups input[class=listItem]:checked');
    if (!items.length) {
        ChipJoin().showMsg("Please, first select the groups you want to delete for this role.");
        return;
    }
    if(confirm("Are you sure you want to delete?")){
        $.each(items, function() {
            var groupId = $(this).val();
            ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/roles/" + roleName + "/groups/" + groupId, null, null,
                function() {
                    ChipJoin().showMsg("Loading....");
                    ChipJoin().getRoleGroups(roleName);
                },
                function() {
                    ChipJoin().showMsg("Unable to remove group from role: ");
                }
            ));
        });
    }
};
//TODO Edit Role Inactivity
_ChipJoin.prototype.editRoleInactivity = function(){
    var inactivity = $('#role-inactivity-input').val();
    var role_Name = current_roleName;
    if (intRegex.test(inactivity)) {
        data = { inactivity: inactivity };
        ChipJoin().runAppQuery(new Usergrid.Query("PUT", "/role/" + role_Name, data, null,
            function(){
                ChipJoin().openRoleProfile(current_roleName, current_roleTitle);
                ChipJoin().showMsg("Update success.");
            },
            function(){
                //TODO Show Error
                ChipJoin().showMsg("Something went wrong while updating.");
            }
        ));
    } else {
        //TODO Show Validation Error.
        ChipJoin().showMsg("Invalid data.");
    }
};
 //TODO Delete Role Permission
_ChipJoin.prototype.deleteRolePermission = function(roleName, permission){
    if(confirm("Are you sure you want to delete?"))
    {
        var data = {"permission":permission};
        ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "roles/" + roleName + "/permissions", null, data,
            function(){
                ChipJoin().showMsg("Loading....");
                ChipJoin().getRolePermissions(roleName);
            },
            function(){ChipJoin().getRolePermissions(roleName)}
        ));
    }
};
//TODO Display Role Users
_ChipJoin.prototype.displayRolesUsers = function(roleName, roleTitle, response, curl){
    $('#role-users').html('');
    var data = {};
    data.roleTitle = roleTitle;
    data.roleName = roleName;
    if (response.entities) {
        data.users = response.entities;
    }
    $("#uiForRolesUsers").tmpl({"data" : data}, {}).appendTo('#role-users');
};
 //TODO Display Role Groups
_ChipJoin.prototype.displayRoleGroups = function(response, curl) {
    response.roleName = current_roleName;
    response.roleTitle = current_roleTitle;
    $('#role-panel-groups').html($("#uiDisplayGroupRoles").tmpl(response).html());
    //ChipJoin().updateGroupsForRolesAutocomplete();
};
//TODO Get Roles For Groups
_ChipJoin.prototype.getRoleGroups= function(roleName) {
    ChipJoin().runAppQuery(new Usergrid.Query("GET", "roles/" + roleName + "/groups", null, null,
        function(response) {
            ChipJoin().displayRoleGroups(response, this.getCurl());
            ChipJoin().updateAutocomplete('groups', ChipJoin().updateGroupsForRolesAutocompleteCallback, "Unable to retrieve Groups.");
        },
        function() { $('#application-roles').html('<div class="alert">Unable to retrieve ' + roleName + ' role permissions.</div>'); }
    ));
};
//TODO Get Roles For Users
_ChipJoin.prototype.getRoleUsers = function(roleName,roleTitle){
    ChipJoin().runAppQuery(new Usergrid.Query("GET", "roles/" + roleName + "/users", null, null,
        function(response) {
            ChipJoin().showMsg("Loading....");
            ChipJoin().displayRolesUsers(roleName, roleTitle, response, this.getCurl());
            ChipJoin().updateAutocomplete('users/', ChipJoin().updateUsersAutocompleteCallback, "Unable to retrieve Users.");
        },
        function() {
            //TODO Show Error
            ChipJoin().showMsg("Could not load roles for user.");
        }
    ));
};
//TODO Edit Role Permission
_ChipJoin.prototype.addRolePermission = function(roleName)
{
    var path = $('#role-permission-path-entry-input').val();
    var ops = "";
    var s = "";
    if ($('#role-permission-op-get-checkbox').prop('checked')) {
        ops = "get";
        s = ",";
    }
    if ($('#role-permission-op-post-checkbox').prop('checked')) {
        ops = ops + s + "post";
        s = ",";
    }
    if ($('#role-permission-op-put-checkbox').prop('checked')) {
        ops =  ops + s + "put";
        s = ",";
    }
    if ($('#role-permission-op-delete-checkbox').prop('checked')) {
        ops =  ops + s + "delete";
        s = ",";
    }
    var permission = ops + ":" + path;
    var data = {"permission": ops + ":" + path};
    if (ops) {
        ChipJoin().runAppQuery(new Usergrid.Query("POST", "/roles/" + roleName + "/permissions", data, null,
            function(){
                ChipJoin().showMsg("Loading....");
                ChipJoin().openRoleProfile(current_roleName,current_roleTitle);
                ChipJoin().showMsg("Role added successfully.");
            },
            function(){
                //TODO Show Error
                ChipJoin().showMsg("Error");
            }));
    } else {
        ChipJoin().showMsg("Please select a verb");
    }
};
//TODO Remove Users from Group
_ChipJoin.prototype.removeGroupFromUser = function(groupId) {
    var items = $('#group-panel-memberships input[class^=listItem]:checked');
    if (!items.length) {
        ChipJoin().showMsg("Please, first select the users you want to from this group.");
        return;
    }

    if(confirm("Are you sure you")){
        items.each(function() {
            var userId = $(this).attr("value");
            ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/groups/" + groupId + "/users/" + userId, null, null,
                function() {
                    ChipJoin().showMsg("Loading....");
                     ChipJoin().openGroupProfile(current_username);
                    ChipJoin().showMsg("User removed from group.");
                },
                function() {
                  //TODO Show Error
                    ChipJoin().showMsg("Unable to remove user from group");
                }
            ));
        });
    }
};
//TODO Delete Roles From Group
_ChipJoin.prototype.deleteRolesFromGroup = function(roleId, rolename) {
    var items = $('#group-panel-permissions input[class^=listItem]:checked');
    if(!items.length){
        ChipJoin().showMsg("Please, first select the roles you want to delete from this group.");
        return;
    }
    if(confirm("Are you sure you want to remove?")){
        items.each(function() {
            var roleId = $(this).attr("value");
            var groupname = $('#role-form-groupname').val();
            ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/roles/" + roleId + "/groups/" + groupname, null, null,
                function() {
                    ChipJoin().openGroupProfile(current_username);
                    ChipJoin().showMsg("Role removed from group.");
                },
                function() {
                    //TODO Show Error
                    ChipJoin().showMsg("Unable to remove role from group"); }
            ));
        });
    }
};
//TODO Delete Group Permission
_ChipJoin.prototype.deleteGroupPermission = function(groupName, permissions){
    var data = {"permission": permissions};
    ChipJoin().runAppQuery(new Usergrid.Query("DELETE", "/groups/" + groupName + "/permissions/", null, data,
        function() {
            ChipJoin().showMsg("Loading....");
            ChipJoin().openGroupProfile(current_username);
            ChipJoin().showMsg("Deleted group permission successfully.");
        },
        function() {
            //TODO Show Error
            ChipJoin().showMsg("Unable to remove Permission"); }
    ));
}
//TODO Add Group Permission
_ChipJoin.prototype.addGroupPermission = function(groupName) {
    var path = $('#group-permission-path-entry-input').val();
    var ops = "";
    var s = "";
    if ($('#group-permission-op-get-checkbox').prop("checked")) {
        ops = "get";
        s = ",";
    }
    if ($('#group-permission-op-post-checkbox').prop("checked")) {
        ops = ops + s + "post";
        s = ",";
    }
    if ($('#group-permission-op-put-checkbox').prop("checked")) {
        ops =  ops + s + "put";
        s = ",";
    }
    if ($('#group-permission-op-delete-checkbox').prop("checked")) {
        ops =  ops + s + "delete";
        s = ",";
    }
    var data = {"permission": ops + ":" + path};
    if (ops) {
        ChipJoin().runAppQuery(new Usergrid.Query("POST", "/groups/" + groupName + "/permissions/", data, null,
            function() {
                ChipJoin().showMsg("Loading....");
                ChipJoin().openGroupProfile(current_username);
                ChipJoin().showMsg("Permission added successfully.");
            },
            function() {
                //TODO Show Error
                ChipJoin().showMsg("Unable to add permission"); }
        ));
    } else {
        //TODO Show Error
        ChipJoin().showMsg("Please select a verb");
    }
};
//TODO Open Group's Profile
_ChipJoin.prototype.openGroupProfile = function(groupPath){
    current_group = groupPath;
    ChipJoin().showMsg("Loading....");
    ChipJoin().switchPanel("panelGroupDetailView","Group Detail");
    $("#panelUserManagement").hide();
    $("#panelUserDetailView").hide();
    $("#panelRoleDetailView").hide();
    $("#panelGroupDetailEdit").hide();
    $("#panelUserDetailEdit").hide();
    $("#panelDataExplorer").hide();
    $("#panelqueryShell").hide();
    ChipJoin().runAppQuery(new Usergrid.Query("GET",'groups/'+ groupPath, null, null,
        function(response){
            var hold = $("#loadGroupDetails");
            if (response.entities && (response.entities.length > 0)) {
                var entity = response.entities[0];
                var path = response.path || "";
                path = "" + path.match(/[^?]*/);
                var uuid = entity.uuid;
                var name = entity.uuid + " : " + entity.type;

                if (entity.path) {
                    name = entity.path;
                }

                if (entity.name) {
                    name = name + " : " + entity.name;
                }

                var collections = $.extend({ }, (entity.metadata || { }).collections, (entity.metadata || { }).connections);
                if ($.isEmptyObject(collections)){
                    collections = null;
                }

                var entity_contents = $.extend( false, { }, entity);
                delete entity_contents['metadata'];

                var metadata = entity.metadata;
                if ($.isEmptyObject(metadata)){
                    metadata = null;
                }

                var entity_path = (entity.metadata || {}).path;
                if ($.isEmptyObject(entity_path)) {
                    entity_path = path + "/" + entity.uuid;
                }
                var str = '<div style="margin-bottom: 10px;"><a href="javascript:" onclick="ChipJoin().showEditGroupPanel();" class="btn">Edit Group</a> </div>';
                str += '<table class="table table-bordered">';
                str += '<tr>';
                str += '<th>UUID</th>';
                str += '<th>'+entity["uuid"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Type</th>';
                str += '<th>'+entity["type"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Created</th>';
                var createdDate = new Date(entity["created"]);
                str += '<th>'+createdDate.toLocaleString()+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Modified</th>';
                var modDate = new Date(entity["modified"]);
                str += '<th>'+modDate.toLocaleString()+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Path</th>';
                str += '<th>'+entity["path"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Title</th>';
                str += '<th>'+entity["title"]+'</th>';
                str += '</tr>';
                str += '<tr>';
                str += '<th>Collections</th>';
                str += '<th>';
                str += '<table class="table">';
               // alert(entity.metadata);
                for(var coll in entity.metadata)
                {
                    str += '<tr><th>'+coll+'</th><th>/groups/'+entity["uuid"]+'/'+coll+'</th></tr>';
                }
                str += '</table>';
                str += '</th>';
                str += '</tr>'
                str += '</table>';
                hold.html(str);
                //TODO Also fill data for group edit.
                var editSrt = '';
                editSrt += '<input type="hidden" autocomplete="false" id="groupIDupdate" value="'+entity["uuid"]+'" />';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputGroupPath">Group Path</label>\
                    <div class="controls">\
                    <input type="text" id="inputGroupPath" placeholder="Group Path" value="'+entity["path"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                       <label class="control-label" for="inputName">Display Name</label>\
                    <div class="controls">\
                    <input type="text" id="inputGroupTitle" placeholder="Display Name" value="'+entity["title"]+'" /> \
                    </div>';
                editSrt += '<div class="control-group">\
                    <div class="controls">\
                    <input type="button" class="btn-primary" value="Save" onclick="ChipJoin().saveEditGroup();" /> \
                    <input type="button" class="btn" value="Cancel" onclick="ChipJoin().hideEditGroupPanel();" /> \
                    </div>';
                $("#panelGroupDetailEditHolder").html(editSrt);
                var data = {
                    entity : entity_contents,
                    picture : entity.picture,
                    name : name,
                    uuid : uuid,
                    path : entity_path,
                    collections : collections,
                    metadata : metadata,
                    uri : (entity.metadata || { }).uri
                }
                ChipJoin().runAppQuery(new Usergrid.Query("GET",'groups/' + entity.path + '/users', null, null,
                    function(response) {
                        if (data && response.entities && (response.entities.length > 0)) {
                            data.memberships = response.entities;

                        }
                        ChipJoin().redrawGroupMemberships(data, this.getCurl());
                        ChipJoin().updateAutocomplete('users/', ChipJoin().updateUsersForGroupAutocompleteCallback, "Unable to retrieve Users.");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to retrieve group's users."); }
                ));
                ChipJoin().runAppQuery(new Usergrid.Query("GET",'groups/' + entity.path + '/activities', null, null,
                    function(response) {
                        if (data && response.entities && (response.entities.length > 0)) {
                            data.activities = response.entities;
                        }
                        ChipJoin().redrawGroupActivities(data, this.getCurl());
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to retrieve group's activities."); }
                ));
                //TODO Load Roles & Permission
                ChipJoin().runAppQuery(new Usergrid.Query("GET",'groups/' + entity.path + '/roles', null, null,
                    function(response) {
                        if (data && response.entities) {
                            data.roles = response.entities;
                        }
                        data.groupRolesCurl = this.getCurl();
                        //WHEN /Roles is properly handled, get permissions
                        ChipJoin().runAppQuery(new Usergrid.Query("GET", 'groups/' + entity.path + '/permissions', null, null,
                            function(response) {
                                var permissions = {};
                                if (data && response.data && (response.data.length > 0)) {

                                    if (response.data) {
                                        var perms = response.data;
                                        var count = 0;

                                        for (var i in perms) {
                                            count++;
                                            var perm = perms[i];
                                            var parts = perm.split(':');
                                            var ops_part = "";
                                            var path_part = parts[0];

                                            if (parts.length > 1) {
                                                ops_part = parts[0];
                                                path_part = parts[1];
                                            }

                                            ops_part.replace("*", "get,post,put,delete")
                                            var ops = ops_part.split(',');
                                            permissions[perm] = {ops : {}, path : path_part, perm : perm};

                                            for (var j in ops) {
                                                permissions[perm].ops[ops[j]] = true;
                                            }
                                        }
                                        if (count == 0) {
                                            permissions = null;
                                        }
                                        data.permissions = permissions;
                                    }
                                }
                                data.groupPermissionsCurl = this.getCurl();
                                ChipJoin().redrawGroupPermissions(data,data.groupRolesCurl, data.groupPermissionsCurl);
                            },
                            function() {
                                //TODO Show Error
                                ChipJoin().showMsg("Unable to retrieve group's permissions."); }
                        ));
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to retrieve group's roles."); }
                ));
            }
        }
        ,
        function() { ChipJoin().showMsg("Unable to retrieve group details."); }
    ));
};
