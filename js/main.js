/*global window, Parse, $, document, cacheFresh */

var initialize, onPageLoad, buildBetaContent, buildSearch, toTitleCase, logoutUser, googleAnalytics;

// Performs functions immediately (before DOM is ready)
initialize = function () {
    "use strict";
    document.title = window.location.pathname.substr(1).toTitleCase() + " | CourseEater";
    $('head').append('<link rel="icon" sizes="192x192" href="resources/highres-transparent.png">');
    $('head').append('<meta name="theme-color" content="#F0AD4E">');
    $('head').append('<meta name="mobile-web-app-capable" content="yes">');
    Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU", "Rncx0sNYiCARajhzNE2m86l4HXdmYxo3yZ2AGJNy");
    if (!Parse.User.current()) window.location = "/";
};

// Updates page if other tab alters storage
$(window).bind('storage', function (e) {
	var sourceWindow = e.originalEvent.url.split("/")[3]; 
	var currentWindow = window.location.pathname.substr(1);
	if (sourceWindow !== currentWindow) loadPage();
});

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
		/* buildAdmin();     */
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
	clearStorage();
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
    ga('require', 'displayfeatures');
    ga('send', 'pageview');
};

// Collapses Navbar
closeNavbarDropdown = function () {
	"use strict"
	if ($(".navbar-header .navbar-toggle").css("display") != "none") $(".navbar-header .navbar-toggle").trigger("click");
};

// Clears any cached data and reloads data from Parse
$(document).on("click", ".refresh-data", function () {
    "use strict";
    var btn;
    btn = Ladda.create(this);
    btn.start();
    cacheFresh().then(retrieveCourses);
    loadPage();
    $(".alert-error").hide();
    btn.stop();
    closeNavbarDropdown();
});

initialize();
$(document).ready(onPageLoad);
$(document).on("click", "#logout", logoutUser);