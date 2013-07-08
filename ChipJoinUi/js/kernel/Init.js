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
    //Cookies Set and Get
    _ChipJoin.prototype.setCookie = function(n,v,e)
    {
        var exdate = new Date();
        exdate.setDate(exdate.getDate()+e);
        document.cookie = n+"="+v;
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
                    s = '<table id="users-table" class="table table-bordered table-striped"><thead><tr class="zebraRows users-row"><th class="checkbox"><input type="checkbox" onclick="Usergrid.console.selectAllEntities(this);" /></th><th class="gravatar50-td">&nbsp;</th><th class="user-details bold-header">Username</th><th class="user-details bold-header">Display Name</th><th class="view-details">&nbsp;</th></tr></thead><tbody>';
                    for (i = 0; i < response.entities.length; i++) {
                        var this_data = response.entities[i];
                        if (!this_data.picture) {
                            this_data.picture = window.location.protocol+ "//" + window.location.host + window.location.pathname + "images/user-photo.png"
                        }
                        //alert(this_data.picture);
                        s += '<tr class="zebraRows users-row"><td><input type="checkbox" onclick="Usergrid.console.selectAllEntities(this);" /></td><td><img width="50" height="50" src="'+this_data.picture+'"//></td><td>'+this_data.name+'</td><td>'+this_data.username+'</td><td><a href="javascript:" onclick="ChipJoin().openUserProfile(\''+this_data.username+'\');">View Details<a/></td></tr>';
                    }
                    s += '</tbody></table>';
                    output.html(s);
                }
            },
            function(response){
                //TODO Show Error Message.
                alert("Oops could not load any users.");
            }
        )
        );
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