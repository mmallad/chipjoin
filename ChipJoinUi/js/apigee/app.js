$(document).ready(function(){

    var client = new Usergrid.Client({
        orgName:'yourorgname', //your orgname goes here (not case sensitive)
        appName:'yourappname', //your appname goes here (not case sensitive)
        logging: true, //optional - turn on logging, off by default
        buildCurl: true //optional - turn on curl commands, off by default
    });
    var appUser;
    var fullFeedView = true;
    var fullActivityFeed;
    var userFeed;

    $("#btnUserLogin").bind('click',login);
    function isLoggedIn() {
        if (!client.isLoggedIn()) {
            window.location.href = "/login.html";
        }
    }
    function showMyFeed() {
        if (!isLoggedIn()) return;
        alert("Hello");
        //make sure we are on the messages page
        //window.location = "#page-messages-list";

        fullFeedView = false;
        //$('#btn-show-full-feed').removeClass('ui-btn-up-c');
        //$('#btn-show-my-feed').addClass('ui-btn-up-c');

        if  (userFeed) {
            userFeed.resetPaging();
            userFeed.fetch(function (err) {
                if (err) {
                    alert('Could not get user feed. Please try again.');
                } else {
                    drawMessages(userFeed);
                }
            });
        } else {
            //no feed obj yet, so make a new one
            var options = {
                type:'user/me/feed',
                qs:{"ql":"order by created desc"}
            }
            client.createCollection(options, function(err, collectionObj){
                if (err) {
                    alert('Could not get user feed. Please try again.');
                } else {
                    userFeed = collectionObj;
                    drawMessages(userFeed);
                }
            });
        }
    }


    function showErr(e)
    {
        $("#div-error-holder").html('<div class="alert alert-error">\
            <button type="button" class="close" data-dismiss="alert">×</button>  \
        '+e+'\
    </div>');
    }
    function login() {
        showErr('');
        var username = $("#username").val();
        var password = $("#password").val();

        client.login(username, password,
            function (err) {
                if (err) {
                    showErr("Invalid email or password.");
                } else {
                    //login succeeded
                    client.getLoggedInUser(function(err, data, user) {
                        if(err) {
                            showErr("Invalid email or password.");
                        } else {
                            if (client.isLoggedIn()){
                                appUser = user;
                                goToPage();
                            }
                        }
                    });

                    //clear out the login form so it is empty if the user chooses to log out
                    $("#username").val('');
                    $("#password").val('');

                    //default to the full feed view (all messages in the system)
                    //showMyFeed();
                }
            }
        );
    }

    function goToPage()
    {
        window.location.href = "/index.html#showfeed";
    }

    function drawMessages(feed) {
        var html = "";
        var usersToBind = [];
        feed.resetEntityPointer();
        while(feed.hasNextEntity()) {
            var message = feed.getNextEntity(),
                created = message.get('created'),
                content = message.get('content'),
                email = '',
                imageUrl = '',
                actor = message.get('actor'),
                name = actor.displayName || 'Anonymous',
                username = actor.displayName;

            if ('email' in actor) {
                email = actor.email;
                imageUrl = 'http://www.gravatar.com/avatar/' + MD5(email.toLowerCase()) + '?s=' + 50;
            }
            if (!email) {
                if ('image' in actor && 'url' in actor.image) {
                    imageUrl = actor.image.url;
                }
            }
            if (!imageUrl) {
                imageUrl = 'http://www.gravatar.com/avatar/' + MD5('rod@apigee.com') + '?s=' + 50;
            }

            formattedTime = prettyDate(created);

            html += '<div style="border-bottom: 1px solid #444; padding: 5px; min-height: 60px;"><img src="' + imageUrl + '" style="border none; height: 50px; width: 50px; float: left;padding-right: 10px"> ';
            html += '<span style="float: right">'+formattedTime+'</span>';
            html += '<strong>' + name + '</strong>';
            if (username && username != appUser.get('username')) {
                html += '(<a href="#page-now-following" id="'+created+'" name="'+username+'" data-role="button" data-rel="dialog" data-transition="fade">Follow</a>)';
            }
            html += '<br><span>' + content + '</span> <br>';
            html += '</div>';
            usersToBind[created] = username;
        }
        if (html == "") { html = "No messages yet!"; }
        alert(html);
        $("#messages-list").html(html);
        for(user in usersToBind) {
            $('#'+user).bind('click', function(event) {
                username = event.target.name;
                followUser(username);
            });
        }
        //next show the next / previous buttons
        /*if (feed.hasPreviousPage()) {
            $("#previous-btn-container").show();
        } else {
            $("#previous-btn-container").hide();
        }
        if (feed.hasNextPage()) {
            $("#next-btn-container").show();
        } else {
            $("#next-btn-container").hide();
        }

        $(this).scrollTop(0);*/
    }
    if(window.location.pathname !== "/login.html")
    {
        isLoggedIn();
    }
    if(window.location.hash === "#showfeed")
    {
        showMyFeed();
    }
});