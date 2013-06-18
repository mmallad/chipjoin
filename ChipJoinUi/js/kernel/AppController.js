(function(){
    _ChipJoin.prototype.LoginController = function($scope, $routeParams){
        if(Usergrid.userSession.loggedIn())
            window.location.href = "/#/dashboard";
        $scope.Login = function(){
            //Call Here Login CallBack
            //TODO Implement Login Here
            var usernameObj =   $("#username");
            var passwordObj = $("#password");
            var username = usernameObj.val();
            var password = passwordObj.val();
            //empty local storage
            Usergrid.userSession.clearAll();
            var formdata = {
                grant_type: "password",
                username: username,
                password: password
            };

            ChipJoin().runManagementQuery(new Usergrid.Query('POST', 'token', formdata, null,
                function(response) {
                    if (!response || response.error){
                        alert("Oops something went wrong.");
                        //$scope.ChipJoin = {"msg":ChipJoin().ErrorMsg("Oops something went wrong.")};
                        //return
                    }
                    else
                    {
                        //Fist clear the Organizations list
                        Usergrid.organizations.clearList();
                        for (org in response.user.organizations) {
                            //grab the name
                            var orgName = response.user.organizations[org].name;
                            //grab the uuid
                            var orgUUID = response.user.organizations[org].uuid;
                            organization = new Usergrid.Organization(orgName, orgUUID);
                            for (app in response.user.organizations[org].applications) {
                                //grab the name
                                var appName = app.split("/")[1];
                                //grab the id
                                var appUUID = response.user.organizations[org].applications[app];
                                //store in the new Application object
                                application = new Usergrid.Application(appName, appUUID);
                                organization.addItem(application);
                            }
                            //add organization to organizations list
                            Usergrid.organizations.addItem(organization);
                        }
                        //select the first org by default
                        var firstOrg = Usergrid.organizations.getFirstItem();
                        //save the first org in the client
                        Usergrid.ApiClient.setOrganizationName(firstOrg.getName());

                        //store user data in local storage
                        Usergrid.userSession.saveAll(response.user.uuid, response.user.email, response.access_token);

                        //store the token in the client
                        Usergrid.ApiClient.setToken(response.access_token);

                        window.location.href = "/#/dashboard";
                    }
                }, function(response){
                    if(usernameObj.val() == "")
                        usernameObj.focus();
                    else
                        passwordObj.focus();
                    alert("Invalid username and password.");
                    //$scope.ChipJoin = {"msg":ChipJoin().ErrorMsg("Invalid username and password.")};
                }));


            //Show Register Form


        };
        $scope.ShowRegister = function(){
            window.location.href = "/#/register";
        };
    };
    _ChipJoin.prototype.AppController = function($scope, $routeParams){
        //Just verify whether user is logged in or not. :)
        if(!Usergrid.userSession.loggedIn())
            window.location.href = "/#/login";
        $scope.ChipJoin = {"UserEmail":Usergrid.userSession.getUserEmail()};
        $scope.Logout = function(){
            Usergrid.userSession.clearAll();
            window.location.href = "/#/login";
        };
    };
    _ChipJoin.prototype.RegisterController = function($scope, $routeParams){
        $scope.Register = function(){

            var organization_name = $('#organization_account').val();
            if (!(organizationNameRegex.test(organization_name))) {
                alert("Invalid organization name.");
                return;
            }
            var username = $('#username').val();
            if (!(usernameRegex.test(username))) {
                alert("Invalid username.");
                return;
            }
            var name = $('#name').val();
            if (!$.trim(name).length) {
                alert("Invalid name.");
                return;
            }
            var email = $('#email').val();
            if (!(emailRegex.test(email))) {
                alert("Invalid email.");
                return;
            }
            var password = $('#password').val();
            if (!(passwordRegex.test(password))) {
                alert("Invalid Password.");
                return;
            }
            if (password != $('#repassword').val()) {
                alert("Password do not match.");
                return;
            }
            var formdata = {
                "organization": organization_name,
                "username": username,
                "name": name,
                "email": email,
                "password": password
            };
            ChipJoin().runManagementQuery(new Usergrid.Query("POST",'organizations', formdata, null,
                function(response) {
                    alert("Register was success :)");
                    window.location.href = "/#/login";
                },
                function(response) {
                    alert("Sorry could not create your account.");
                }
            ));
        }
    };
})();
