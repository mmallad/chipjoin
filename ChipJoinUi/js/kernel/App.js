angular.module('chipjoin',['dashBoardServices']).config(['$routeProvider', function($routeProvider){$routeProvider.when('/login',
    {templateUrl:'templates/login.html',
        controller:ChipJoin().LoginController}).when('/dashboard',{templateUrl:'templates/dashboard.html',
        controller:ChipJoin().AppController}).when('/register',{
        templateUrl:'templates/register.html',
        controller:ChipJoin().RegisterController
    }).otherwise({redirectTo:'/login'});
}]);