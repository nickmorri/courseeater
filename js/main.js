/*global window, Parse, $, document, sessionStorage, cacheFresh */

var initialize, onPageLoad, buildBetaContent, buildSearch, toTitleCase, logoutUser, googleAnalytics;

// Performs functions immediately (before DOM is ready)
initialize = function () {
    "use strict";
    document.title = window.location.pathname.substr(1).toTitleCase() + " | CourseEater";
    Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU", "Rncx0sNYiCARajhzNE2m86l4HXdmYxo3yZ2AGJNy");
    if (!Parse.User.current()) window.location = "/";
};

// Performs actions after DOM is ready
onPageLoad = function () {
    "use strict";
    $(".user-name-display").text(Parse.User.current().get("username"));
    cacheFresh();
    googleAnalytics();
    /* buildBetaContent(); */
};

buildSearch = function () {
	"use strict";
	if (window.location.pathname !== "/search") {
        var searchString = '<li><a href="search"><span class="glyphicon glyphicon-search"></span> Search</a></li>';
        $(".nav.navbar-nav").first().append(searchString);
    }
};

buildAdmin = function () {
	"use strict";
	if (window.location.pathname !== "/admin") {
		var adminString = '<li><a href="admin"><span class="glyphicon glyphicon-wrench"></span> Admin</a></li>';
        $(".nav.navbar-nav").first().append(adminString);
	}
};

// Beta content injector
buildBetaContent = function () {
    "use strict";
    var userID = Parse.User.current().id;
    Parse.Cloud.run("checkBeta", {user: userID}).then(function () {
		buildSearch();
		buildAdmin();    
    });
};

// Transforms a string to Title Case
String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// Transforms a string to Title Case - DEPRECATED
toTitleCase = function (str) {
    "use strict";
    return str.toTitleCase();
};

// Performs User logout
logoutUser = function () {
    "use strict";
    Parse.User.logOut();	
	localStorage.clear();
	sessionStorage.clear();
    window.location.replace("/");
};

// Google Analytics
googleAnalytics = function () {
    "use strict";
    (function (i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function (){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-9939990-3', 'courseeater.com');
    ga('send', 'pageview');
};

initialize();
$(document).ready(onPageLoad);
$(document).on("click", "#logout", logoutUser);