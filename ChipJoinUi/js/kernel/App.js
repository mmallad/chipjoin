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
                alert("Organization removed successfully.");
            },
            function(response) {
                alert("Could not remove organization");
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
//TODO Open User's Profile
_ChipJoin.prototype.openUserProfile = function(username){
    ChipJoin().switchPanel("panelUserDetailView","User Detail");
    $("#panelUserManagement").hide();
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
            alert("Could not fetch user details.");
        }
    ));
};