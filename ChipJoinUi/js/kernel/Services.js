var a = 100;
;(function(){
    angular.module('dashBoardServices',[]).factory('Organization',function(){
        return {
            LoadData: function(){
                //TODO Re populate the user's information :)
                ChipJoin().oo(ChipJoin().s,ChipJoin().f);
            }
        };
    });
})();
_ChipJoin.prototype.s = function(s){
     //TODO Implement Success URl :)
};
_ChipJoin.prototype.f = function(f){
   //TODO Implement Fail Message Over Here :)
};
_ChipJoin.prototype.oo = function(s,f)
{
    var token = Usergrid.userSession.getAccessToken();
    Usergrid.ApiClient.setToken(token);
    //TODO Load Organization
    ChipJoin().runManagementQuery(new Usergrid.Query("GET","users/" + Usergrid.userSession.getUserEmail(), null, null,
        function(response){
            //Check For Error.
            if(!response)
            {
                alert("Oops something went wrong.");
                //TODO Show Error
                return;
            }
            for (org in response.data.organizations) {
                var orgName = response.data.organizations[org].name;
                //grab the uuid
                var orgUUID = response.data.organizations[org].uuid;
                organization = new Usergrid.Organization(orgName, orgUUID);
                for (app in response.data.organizations[org].applications) {
                    //grab the name
                    var appName = app.split("/")[1];
                    //grab the id
                    var appUUID = response.data.organizations[org].applications[app];
                    //store in the new Application object
                    application = new Usergrid.Application(appName, appUUID);
                    organization.addItem(application);
                }
                //add organization to organizations list
                Usergrid.organizations.addItem(organization);

            }
            var firstOrg = Usergrid.organizations.getFirstItem();
            if(!ChipJoin().getCookie("orgName")){
                Usergrid.ApiClient.setOrganizationName(firstOrg.getName());

            }
            else
            {
                Usergrid.ApiClient.setOrganizationName(ChipJoin().getCookie("orgName"));
            }
            $("#currOrgShow").html(Usergrid.ApiClient.getOrganizationName());

            //s({"UserEmail":Usergrid.userSession.getUserEmail(),"AppName":Usergrid.ApiClient.getOrganizationName()});
            $("#orgHolder").html('<tr><td>'+Usergrid.ApiClient.getOrganizationName()+'</td><td>'+orgUUID+'</td></tr>');
            var allOrg = Usergrid.organizations.getList();
            for(var allorgName in allOrg)
            {

                $("#appendOrgList").prepend('<li><a href="javascript:" role="button" onclick="ChipJoin().switchOrg(\''+allOrg[allorgName].getName()+'\')">'+allOrg[allorgName].getName()+'</a></li>');
            }
            $("#manageOrganization").html('<tr><td>'+Usergrid.ApiClient.getOrganizationName()+'</td><td>'+orgUUID+'</td><td><input type="button" value="Leave" class="btn btn-danger" onclick="ChipJoin().deleteCurrentOrg(\''+orgUUID+'\')" /></td></tr>');
            //TODO Load Applications
            ChipJoin().runManagementQuery(new Usergrid.Query("GET","organizations/" + Usergrid.ApiClient.getOrganizationName() + "/applications", null, null,
                function(){
                    var o = ChipJoin().displayApplications(response);
                    $("#appHolder").html("");
                    for(var ob in o)
                    {
                        $("#appHolder").append('<tr><td>'+o[ob]["name"]+'</td><td>'+o[ob]["id"]+'</td></tr>');
                        $("#appendAppList").prepend('<li><a href="javascript:" role="button" onclick="ChipJoin().switchApp(\''+o[ob]["name"]+'\')">'+o[ob]["name"]+'</a></li>');
                    }
                },
                function() {
                    //TODO Show Error
                }
            ));
            //TODO Load Admin Details :)
            ChipJoin().runManagementQuery(new Usergrid.Query("GET","organizations/" + Usergrid.ApiClient.getOrganizationName()  + "/users", null, null,
                function(response){
                   var ao = ChipJoin().loadAdmins(response);
                    $("#adminHolder").html("");
                    for(var ob in ao)
                    {
                        $("#adminHolder").append('<tr><td><img src"'+ao[ob]["image"]+'" />'+ao[ob]["name"]+' ('+ao[ob]["email"]+')</td></tr>');
                    }
                },
                function(response){
                    //TODO Implement Admin Error
                   // alert("Oops something went wrong while fetching admins.");
                    $("#adminHolder").html('<tr><td colspan="0">'+ChipJoin().ErrorMsg("Could not load admins.")+'</td></tr>');
                })
            );
            //TODO Fill Edit Profile.
            $("#update-account-id").html(Usergrid.userSession.getUserUUID());
            ChipJoin().runManagementQuery(new Usergrid.Query("GET",'users/' + Usergrid.userSession.getUserUUID(), null, null,
                function(response){
                    ChipJoin().fillEditProfile(response);

                },function(response){
                    //TODO Show Error
                    alert("Error while filling user data.");
                }
            ));
            //TODO Load Credentials
            if(!Usergrid.ApiClient.getApplicationName())
            {
                Usergrid.ApiClient.setApplicationName(ChipJoin().getCookie("appName"));
            }
            ChipJoin().runAppQuery(new Usergrid.Query("GET","credentials", null, null,
                function(response) {
                    $("#userCred").html('<tr><td>'+response.credentials.client_id+'</td><td>'+response.credentials.client_secret+'</td></tr>');
                },
                function(response) {

                    //TODO Show Error
                    $("#userCred").html('<tr><td colspan="2">'+ChipJoin().ErrorMsg("Could not load credentials.")+'</td></tr>');
                }
            ));
        },
        function(response){
            alert("Oops Something went wrong.");
            //TODO Show Error Here
        }
    ));
};