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
            Usergrid.ApiClient.setOrganizationName(firstOrg.getName());
            //s({"UserEmail":Usergrid.userSession.getUserEmail(),"AppName":Usergrid.ApiClient.getOrganizationName()});
            $("#appName").html(Usergrid.ApiClient.getOrganizationName());
            $("#orgID").html(orgUUID);
            ChipJoin().runManagementQuery(new Usergrid.Query("GET","organizations/" + Usergrid.ApiClient.getOrganizationName() + "/applications", null, null,
                function(){
                    var o = ChipJoin().displayApplications(response);
                    $("#appsName").html(o.name);
                    $("#appID").html(o.ID);
                },
                function() {
                    //TODO Show Error
                }
            ));
            //alert(Usergrid.ApiClient.getApplicationName());
        },
        function(response){
            alert("Oops Something went wrong.");
            //TODO Show Error Here
        }
    ));
};