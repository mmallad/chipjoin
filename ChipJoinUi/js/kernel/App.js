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