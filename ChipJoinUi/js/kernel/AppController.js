(function(){
    _ChipJoin.prototype.LoginController = function($scope, $routeParams){
        if(Usergrid.userSession.loggedIn())
            window.location.href = "#/dashboard";
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
            $("#div-error-holder").html(ChipJoin().InfoMsg("Please wait verifying email and password."));
            ChipJoin().runManagementQuery(new Usergrid.Query('POST', 'token', formdata, null,
                function(response) {
                    if (!response || response.error){
                        $("#div-error-holder").html(ChipJoin().ErrorMsg("Oops something went wrong."));
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
                        //document.getElementsByTagName("body")[0].style.backgroundImage='url(img/bg.jpg) repeat-y top right, url(img/dbg.jpg) repeat top left';
                        window.location.href = "#/dashboard";
                    }
                }, function(response){
                    if(usernameObj.val() == "")
                        usernameObj.focus();
                    else
                        passwordObj.focus();
                    $("#div-error-holder").html(ChipJoin().ErrorMsg("Invalid email or password."));
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
            window.location.href = "#/login";
        $scope.UserEmail = Usergrid.userSession.getUserEmail();
        //alert(Usergrid.userSession.getUserEmail());
        Organization.LoadData();

        //Logout Function
        $scope.Logout = function(){
            Usergrid.userSession.clearAll();
            document.cookie = 'appName=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            document.cookie = 'orgName=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            window.location.href = "#/login";

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
                        alert("Organization added successfully. You may require to reload the page.");
                        window.location.reload();
                    },
                    function(response) {
                        console.log(response);
                        alert("Could not add organization.");
                    }
                ));
            }

        };
        //TODO Create New User
        $scope.createNewUser = function(){
            var email = $('#new-user-email');
            var username = $('#new-user-username');
            var fullname = $('#new-user-fullname');
            var password = $('#new-user-password');
            var validate_password = $('#new-user-validate-password');
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
            else if(password.val() != validate_password.val())
            {
                alert("Password do not match.");
            }
            else
            {
                var data = {
                    email:email.val(),
                    username:username.val(),
                    name:fullname.val(),
                    password:password.val()
                };
                ChipJoin().runAppQuery(new Usergrid.Query("POST", 'users', data, null,
                    function(){
                        //TODO show all users.

                        ChipJoin().getAllUsers();
                        ChipJoin().showMsg("User created successfully.");
                    },
                    function(){
                        ChipJoin().showMsg("Could not create user. Please try again");
                    }
                )
                );
                $("#createNewUserModal").modal("hide");
            }

        };
        //TODO Create New Group
        $scope.createNewGroup = function(){
            var new_group_title = $('#new-group-title');
            var new_group_path = $('#new-group-path');
            var bValid = ChipJoin().checkLength2(new_group_title, 1, 80)
                && ChipJoin().checkRegexp2(new_group_title, nameRegex, nameAllowedCharsMessage)
                && ChipJoin().checkLength2(new_group_path, 1, 80)
                && ChipJoin().checkRegexp2(new_group_path, pathRegex, pathAllowedCharsMessage);

            if (bValid) {
                var data = {
                    "title":new_group_title.val(),
                    "path":new_group_path.val()
                };
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "groups", data, null,
                    function(){
                        ChipJoin().showMsg("Group added successfully. You may require to reload the page.");
                        ChipJoin().getAllGroups();
                    },
                    function(){

                        //TODO Show Error.
                        ChipJoin().showMsg("Could not add group.");
                    }
                ));
            }
            $("#createNewGroupModal").modal("hide");
    };
        //TODO Add Users To Role
        $scope.submitAddRoleToUser = function(){
            var username = $('#search-roles-user-name-input');
            var bValid = ChipJoin().checkLength2(username, 1, 80) && ChipJoin().checkRegexp2(username, usernameRegex, usernameAllowedCharsMessage)
            if(bValid)
            {
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/roles/" + current_roleName + "/users/" + username.val(), null, null,
                    function() {
                        ChipJoin().openRoleProfile(current_roleName,current_roleTitle);
                        ChipJoin().showMsg("User added to this role. You may require to reload the page.");
                    },
                    function() {
                        //TODO Show Error.
                        ChipJoin().showMsg("Error to add user to role.");
                    }
                ));
                $('#dialog-form-add-role-to-user').modal('hide');
            }

        };
        //TODO Add Groups To Role
        $scope.submitAddGroupToRole = function() {

            var groupId = $('#search-roles-group-name-input');
            var bValid = ChipJoin().checkLength2(groupId, 1, 80)
                && ChipJoin().checkRegexp2(groupId, nameRegex, nameAllowedCharsMessage);
               if(bValid)
               {
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/roles/" + current_roleName + "/groups/" + groupId.val(), null, null,
                    function() {
                        ChipJoin().showMsg("Group added successfully. You may require to reload the page.");
                        ChipJoin().openRoleProfile(current_roleName,current_roleTitle);
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to add group to role");
                    }
                ));
                $('#dialog-form-add-group-to-role').modal('hide');
               }
        };
        //TODO Create New Role
        $scope.createNewRole = function(){
            var new_role_name = $('#new-role-name');
            var new_role_title = $('#new-role-title');
            var data = {"title":new_role_title.val(),"name":new_role_name.val()};
            ChipJoin().runAppQuery(new Usergrid.Query("POST", "role", data, null,
                function() {
                    ChipJoin().showMsg("Role added successfully. You may require to reload the page.");
                },
                function() {
                    //TODO Show Error
                    ChipJoin().showMsg("Could not add role.");
                }
            ));
        };
        //TODO Add User To Group
        $scope.submitAddGroupToUser = function(){
            var add_group_groupname = $('#search-group-name-input');
                //TODO Please do validation.
                var userId = $('#search-group-userid').val();
                var groupId = $('#search-group-name-input').val();

                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/groups/" + groupId + "/users/" + userId, null, null,
                    function() {
                        ChipJoin().openUserProfile(current_username);
                        ChipJoin().showMsg("Loading....");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to add group to user"); }
                ));
                $('#search-group-name-input').val("");
                $("#dialog-form-add-group-to-user").modal('hide');

        };
        //TODO Add Follow User
        $scope.submitFollowUser = function()
        {
            var username = $('#search-follow-username-input');
            //TODO Please do validation
                var followingUserId = $('#search-follow-username').val();
                var followedUserId = $('#search-follow-username-input').val();
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/users/" + followingUserId + "/following/user/" + followedUserId, null, null,
                    function() {
                        ChipJoin().openUserProfile(current_username);
                        ChipJoin().showMsg("Loading....");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to follow User");}
                ));
                $("#dialog-form-follow-user").modal('hide');
        };
        //TODO Add User To Role
        $scope.submitAddRoleToGroups = function(){
            var roleIdField = $('#search-role-name-input');
            var bValid = ChipJoin().checkLength2(roleIdField, 1, 80)
                && ChipJoin().checkRegexp2(roleIdField, roleRegex, roleAllowedCharsMessage)
            var username = $('#role-form-username').val();
            var roleId = $('#search-role-name-input').val();
            roleId = roleId.replace('/','');
            if (bValid) {
            ChipJoin().showMsg("Loading....");
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/roles/" + roleId + "/users/" + username, null, null,
                    function() {
                        ChipJoin().openUserProfile(current_username);
                        ChipJoin().showMsg("Loading....");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to add user to role"); }
                ));

                $("#dialog-form-add-user-to-role").modal('hide');
            }

        };
        //TODO Add Role To Group
        $scope.submitAddRoleToGroup = function(){
            var roleIdField = $('#search-groups-role-name-input');
            $('#search-groups-role-name-input').val("");
            var bValid = ChipJoin().checkLength2(roleIdField, 1, 80)
                && ChipJoin().checkRegexp2(roleIdField, roleRegex, roleAllowedCharsMessage)

            var groupname = $('#role-form-groupname').val();
            var roleId = $('#search-groups-role-name-input').val();
            // role may have a preceding or trailing slash, remove it
            roleId = roleId.replace('/','');

            if (bValid) {
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/groups/" + groupname + "/roles/" + roleId, null, null,
                    function() {
                        ChipJoin().openGroupProfile(current_username);
                        ChipJoin().showMsg("Role added to group. You may require to reload the page.");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to add user to role"); }
                ));
            }
            $("#dialog-form-add-role-to-group").modal("hide");
        };
        //TODO Add User To Group
        $scope.submitAddUserToGroup = function(){
            var add_user_username = $('#search-user-name-input');
            var bValid = ChipJoin().checkLength2(add_user_username, 1, 80)
                && ChipJoin().checkRegexp2(add_user_username, usernameRegex, usernameAllowedCharsMessage);

            if (bValid) {
                var userId = $('#search-user-name-input').val();
                var groupId = $('#search-user-groupid').val();
                ChipJoin().runAppQuery(new Usergrid.Query("POST", "/groups/" + groupId + "/users/" + userId, null, null,
                    function() {
                        ChipJoin().openGroupProfile(current_username);
                        ChipJoin().showMsg("User added to this group. You may require to reload the page.");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Unable to add user to group"); }
                ));
                $("#dialog-form-add-user-to-group").modal('hide');
            }
        };

        //TODO Add New Collection
        $scope.submitNewCollection = function(){
            var form = $("#dialog-form-new-collection-form");
            var new_collection_name = $('#new-collection-name');

            var bValid = ChipJoin().checkLength2(new_collection_name, 4, 80)
                && ChipJoin().checkRegexp2(new_collection_name, alphaNumRegex, alphaNumAllowedCharsMessage);

            if (bValid) {
                var data = {"name":new_collection_name.val()};
                var collections = {};
                collections[data.name] = {};
                var metadata = {
                    metadata: {
                        collections: collections
                    }
                };
                ChipJoin().runAppQuery(new Usergrid.Query("PUT", "", metadata, null,
                    function() {
                        ChipJoin().getCollections();
                        ChipJoin().showMsg("Collection added successfully. You may require to reload the page.");
                    },
                    function() {
                        //TODO Show Error
                        ChipJoin().showMsg("Could not load new collection.");
                    }
                ));

            }
        };

        //TODO Bind Panel Navigation.
        $("#linkShowUserManagementPanel").click(function(){
            ChipJoin().switchPanel("panelUserManagement","User Management");
            $("#panelRoleDetailView").hide();
            $("#panelGroupDetailView").hide();
            $("#panelGroupDetailEdit").hide();
            $("#panelUserDetailEdit").hide();
            $("#panelUserDetailView").hide();
            $("#panelDataExplorer").hide();
            $("#panelqueryShell").hide();
        });
        $("#linkShowDataExplorer").click(function(){
            ChipJoin().switchPanel("panelDataExplorer","Data Explorer");
            $("#panelUserManagement").hide();
            $("#panelRoleDetailView").hide();
            $("#panelGroupDetailView").hide();
            $("#panelGroupDetailEdit").hide();
            $("#panelUserDetailEdit").hide();
            $("#panelUserDetailView").hide();
            $("#panelqueryShell").hide();
        });
        $("#linkShowQueryWindow").click(function(){
            ChipJoin().switchPanel("panelqueryShell","Query Window");
            $("#panelUserManagement").hide();
            $("#panelRoleDetailView").hide();
            $("#panelGroupDetailView").hide();
            $("#panelGroupDetailEdit").hide();
            $("#panelUserDetailEdit").hide();
            $("#panelUserDetailView").hide();
            $("#panelDataExplorer").hide();
        });
        $('#button-query').click(function(){ChipJoin().runCollectionQuery(); return false;});
        $('#delete-entity-link').click(ChipJoin().deleteEntity);
        $('#delete-users-link').click(ChipJoin().deleteUsers);
        $('#delete-groups-link').click(ChipJoin().deleteGroups);
        $('#delete-roles-link').click(ChipJoin().deleteRoles);
        $('#reGenerateCredentials').click(ChipJoin().newOrganizationCredentials);
        //TODO Everything About Shell :)
        $(document).ready(function(){


            _ChipJoin.prototype.pageSelectShell = function(uuid) {
                //requestApplicationCredentials();
                $('#shell-input').focus();
            };
            var history_i = 0;
            var history = new Array();

            _ChipJoin.prototype.scrollToInput = function() {
                // Do it manually because JQuery seems to not get it right
                var textArea = document.getElementById('shell-output');
                textArea.scrollTop = textArea.scrollHeight;
            };

            _ChipJoin.prototype.echoInputToShell = function(s) {
                if (!s) s = "&nbsp;";
                var html = '<div class="shell-output-line"><span class="shell-prompt">&gt; </span><span class="shell-output-line-content">' + s + '</span></div>';
                ChipJoin().scrollToInput();
            };

            _ChipJoin.prototype.printLnToShell = function(s) {
                if (!s) s = "&nbsp;";
                var html = '<div class="shell-output-line"><div class="shell-output-line-content">' + s + '</div></div>';
                $('#shell-output').append(html);
                $('#shell-output').append(' ');
                ChipJoin().scrollToInput();
            };

            _ChipJoin.prototype.displayShellResponse = function(response) {
                ChipJoin().printLnToShell(JSON.stringify(response, null, "  "));
                $('#shell-output').append('<hr />');
                prettyPrint();
                ChipJoin().scrollToInput();
            };

            _ChipJoin.prototype.handleShellCommand = function(s) {
                var orgName = Usergrid.ApiClient.getOrganizationName();

                if (s) {
                    history.push(s);
                    history_i = history.length - 1;
                }
                var path = '';
                var params = '';
                //Matches any sting that begins with "/", ignoring whitespaces.
                if (s.match(/^\s*\//)) {
                    path = encodePathString(s);
                    ChipJoin().printLnToShell(path);
                    ChipJoin().runAppQuery(new Usergrid.Query("GET",path, null, null, ChipJoin().displayShellResponse,null));
                    //matches get or GET ignoring white spaces
                } else if (s.match(/^\s*get\s*\//i)) {
                    path = encodePathString(s.substring(4));
                    ChipJoin().printLnToShell(path);
                    ChipJoin().runAppQuery(new Usergrid.Query("GET",path, null, null, ChipJoin().displayShellResponse,null));
                } else if (s.match(/^\s*put\s*\//i)) {
                    params = encodePathString(s.substring(4), true);
                    ChipJoin().printLnToShell(params.path);
                    ChipJoin().runAppQuery(new Usergrid.Query("PUT",params.path, params.payload, null, ChipJoin().displayShellResponse,null));
                } else if (s.match(/^\s*post\s*\//i)) {
                    params = encodePathString(s.substring(5), true);
                    ChipJoin().printLnToShell(params.path);
                    ChipJoin().runAppQuery(new Usergrid.Query("POST",params.path, params.payload, null, ChipJoin().displayShellResponse,null));
                } else if (s.match(/^\s*delete\s*\//i)) {
                    path = encodePathString(s.substring(7));
                    ChipJoin().printLnToShell(path);
                    ChipJoin().runAppQuery(new Usergrid.Query("DELETE",path, null, null, ChipJoin().displayShellResponse,null));
                } else if (s.match(/^\s*clear|cls\s*/i))  {
                    $('#shell-output').html(" ");
                } else if (s.match(/(^\s*help\s*|\?{1,2})/i)) {
                    ChipJoin().printLnToShell("/&lt;path&gt; - API get request");
                    ChipJoin(). printLnToShell("get /&lt;path&gt; - API get request");
                    ChipJoin().printLnToShell("put /&lt;path&gt; {&lt;json&gt;} - API put request");
                    ChipJoin().printLnToShell("post /&lt;path&gt; {&lt;json&gt;} - API post request");
                    ChipJoin().printLnToShell("delete /&lt;path&gt; - API delete request");
                    ChipJoin().printLnToShell("cls, clear - clear the screen");
                    ChipJoin().printLnToShell("help - show this help");
                } else if (s === "") {
                    ChipJoin().printLnToShell("ok");
                } else {
                    ChipJoin().printLnToShell('<strong>syntax error!</strong><hr />');
                }
                prettyPrint();
            };

            $('#shell-input').keydown(function(event) {
                var shell_input = $('#shell-input');
                if (!event.shiftKey && (event.keyCode == '13')) {

                    event.preventDefault();
                    var s = $('#shell-input').val().trim();
                    ChipJoin().echoInputToShell(s);
                    shell_input.val("");
                    ChipJoin().handleShellCommand(s);

                } else if (event.keyCode == '38') {

                    event.preventDefault();
                    history_i--;

                    if (history_i < 0) {
                        history_i = Math.max(history.length - 1, 0);
                    }

                    if (history.length > 0) {
                        shell_input.val(history[history_i]);
                    } else {
                        shell_input.val("");
                    }

                } else if (event.keyCode == '40') {

                    event.preventDefault();
                    history_i++;

                    if (history_i >= history.length) {
                        history_i = 0;
                    }

                    if (history.length > 0) {
                        shell_input.val(history[history_i]);
                    } else {
                        shell_input.val("");
                    }
                }
            });

            $('#shell-input').keyup(function() {
                var shell_input = $('#shell-input');
                shell_input.css('height', shell_input.attr('scrollHeight'));
            });

            _ChipJoin.prototype.buildIndexDropdown = function(menuId, indexes) {
                var menu = $("#" + menuId);
                menu.empty();
                $("#uiFORDropDOwn").tmpl(indexes).appendTo(menu);
            };
            _ChipJoin.prototype.appendToCollectionsQuery = function(message){
                var queryTextArea = $("#query-ql");
                queryTextArea.val(queryTextArea.val()+ " " + message );
            };
        });
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
