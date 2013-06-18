function _ChipJoin(){}
var ChipJoin;
Usergrid.organizations = new Usergrid.Organization();
if (Usergrid.apiUrl) {
    Usergrid.ApiClient.setApiUrl(Usergrid.apiUrl);
}
(function(){
    ChipJoin = function(){return new _ChipJoin();};
    _ChipJoin.prototype.APIURL = 'http://localhost:8080/';
    _ChipJoin.prototype.ErrorMsg = function(m){
        return '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button>'+m+'</div>';
    };
    _ChipJoin.prototype.runManagementQuery = function(_queryObj) {
        var obj = _queryObj || queryObj;
        Usergrid.ApiClient.runManagementQuery(obj);
        return false;
    }
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