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
    _ChipJoin.prototype.AppController = function($scope, $routeParams,Organization){
        //Just verify whether user is logged in or not. :)
        if(!Usergrid.userSession.loggedIn())
            window.location.href = "/#/login";
        $scope.UserEmail = Usergrid.userSession.getUserEmail();
        //alert(Usergrid.userSession.getUserEmail());
        Organization.LoadData();

        //Logout Function
        $scope.Logout = function(){
            Usergrid.userSession.clearAll();
            window.location.href = "/#/login";

        };
        //TODO For Creating New Application
        $scope.createApplication = function(){

            //TODO Create New Application :)
            var application_name = $("#txtNewAppName").val();
            var form_data = {
                name:application_name
            };
            if(!document.getElementById("txtNewAppName").validity.valid)
            {
                //TODO Show some error over here :).
                alert("Invalid application name.");
            }
            else
            {

                 ChipJoin().runManagementQuery(new Usergrid.Query("POST","organizations/" + Usergrid.ApiClient.getOrganizationName()  + "/applications",form_data,null,
                    function(response){
                        alert("Success");
                        window.location.reload();

                    },function(response){
                       alert("Failed");
                     }
                 ));
            }

        };
        //TODO For Creating New Admin
        $scope.createNewAdmin = function(){
            var admin_email = $("#txtNewAdmin").val();
            var data = {
                "email":admin_email
            };
            if(!document.getElementById("txtNewAdmin").validity.valid)
            {
                //TODO Show some error over here :).
                alert("Invalid email.");
            }
            else
            {
                ChipJoin().runManagementQuery(new Usergrid.Query("POST","organizations/" + Usergrid.ApiClient.getOrganizationName() + "/users", data, null,
                    function(response){
                        alert("Admin added successfully.");
                        window.location.reload();
                    },
                    function(response){
                        alert("Could not add admin");
                    }
                ));
            }
        };
        //TODO Save Account Profile
        $scope.profileSave = function(){
            var userData = {
                username : $('#update-account-username').val(),
                name : $('#update-account-name').val(),
                email : $('#update-account-email').val()
            };
            var old_pass = $('#old-account-password').val();
            var new_pass = $('#update-account-password').val();
            var new_pass2 = $('#update-account-password-repeat').val();
            if (old_pass && new_pass) {
                if (new_pass != new_pass2) {
                    //TODO Password do not match.
                    alert("Password do not match.");
                    return;
                }
                userData.newpassword = new_pass;
                userData.oldpassword = old_pass;
            }
            ChipJoin().runManagementQuery(new Usergrid.Query("PUT",'users/' + Usergrid.userSession.getUserUUID(), userData, null,
                function(response){
                    //TODO Just do Logout if password is changed.
                    alert("Account update was success.");

                },
                function(response){
                    //TODO account update faile URL.
                    alert("Could not update your account.");
                }
            )
            );

        };
        //TODO Create New Organization
        $scope.createNewOrg = function()
        {
            var org_name = $("#txtNewOrgname").val();
            if(!document.getElementById("txtNewOrgname").validity.valid)
            {
                 alert("Invalid organization name.");
            }
            else
            {        var data = {
                        "organization":org_name
                    };
                    ChipJoin().runManagementQuery(new Usergrid.Query("POST","users/" + Usergrid.userSession.getUserUUID() + "/organizations", data, null,
                    function() {
                        alert("Organization added successfully");
                        window.location.reload();
                    },
                    function(response) {
                        console.log(response);
                        alert("Could not add organization.");
                    }
                ));
            }

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
    ChipJoin().LoginController.$inject = ['$scope','$routeParams'];
    ChipJoin().AppController.$inject = ['$scope','$routeParams','Organization'];
    ChipJoin().RegisterController.$inject = ['$scope','$routeParams'];
})();
