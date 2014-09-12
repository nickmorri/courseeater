/*global setTimeout, logout, window, $, document, Parse, console, sessionStorage */

var onPageLoad;

onPageLoad = function () {
    "use strict";
    var calendar;
    calendar = Parse.User.current().get("externalCalendar");
    $("#new_email").attr("placeholder", Parse.User.current().get("email"));
    if (calendar !== undefined && calendar !== "") {
		$("#new_calendar").attr("placeholder", calendar);
    } else {
	    $("#new_calendar").attr("placeholder", "Google Calendar XML address");
    }
    $("#new_calendar").focus(function () {
    	if ($("#new_calendar").attr("placeholder") === "Google Calendar XML address") {
	    	$('#new_calendar').popover({
	    		html: true,
			    content: "For more information on how to acquire the XML address please reference this guide: <a href='https://support.google.com/calendar/answer/34578' target='_blank'>Google Calendar</a>",
			    placement: "top"
		    });	
    	}
    });  
};

$(document).on("keypress", "#new_calendar", function (event) {
    "use strict";
    if (event.which === 13) { $("#updateCalendar").click(); }
});

$(document).on('click', "#updateCalendar", function () {
    "use strict";
    var newCalendar;
    newCalendar = $("#new_calendar").val();
    Parse.User.current().set("externalCalendar", newCalendar);
    Parse.User.current().save();
    Parse.User.current().fetch();
    $(".alert-account-calendar span").text("Calendar updated.");
    $(".alert-account-calendar").show();
    $("#new_calendar").attr("placeholder", newCalendar);
    $("#new_calendar").val("");
});

$(document).on("keypress", "#new_email", function (event) {
    "use strict";
    if (event.which === 13) { $("#updateEmail").click(); }
});

$(document).on('click', "#updateEmail", function () {
    "use strict";
    var newEmail;
    newEmail = $("#new_email").val();
    Parse.User.current().set("email", newEmail);
    Parse.User.current().save();
    $(".alert-account-email span").text("Email changed to " + newEmail);
    $(".alert-account-email").show();
    $("#new_email").attr("placeholder", newEmail);
    $("#new_email").val("");
});

$(document).on("keypress", "#inputVerifyPassword", function (event) {
    "use strict";
    if (event.which === 13) { $("#updatePassword").click(); }
});

$(document).on('click', '#updatePassword', function () {
    "use strict";
    if ($("#inputNewPassword").val() !== $("#inputVerifyPassword").val()) {
    	$(".alert-account-password").removeClass("alert-success");
    	$(".alert-account-password").addClass("alert-danger");
        $(".alert-account-password span").text("Passwords do not match.");
        $(".alert-account-password").show();
        $("#inputNewPassword").val("");
        $("#inputVerifyPassword").val("");
        return;
    }
    Parse.User.logIn(Parse.User.current().get("username"), $("#inputCurrentPassword").val(), {
        success: function () {
            Parse.User.current().set("password", $("#inputNewPassword").val());
            Parse.User.current().save();
            $(".alert-account-password span").text("Password updated successfully");
            $(".alert-account-password").show();
            $("#inputNewPassword").val("");
            $("#inputVerifyPassword").val("");
            $("#inputCurrentPassword").val("");
        },
        error: function () {
        	$(".alert-account-password").removeClass("alert-success");
			$(".alert-account-password").addClass("alert-danger");
        	$(".alert-account-password span").text("Password entered incorrectly");
            $(".alert-account-password").show();
            setTimeout(logoutUser, 5000);
        }
    });
});

$(document).on("keypress", "#password_delete_account", function (event) {
    "use strict";
    if (event.which === 13) { $("#btn-delete").click(); }
});

$(document).on("click", "#btn-delete", function () {
    "use strict";
    Parse.User.logIn(Parse.User.current().get("username"), $("#password_delete_account").val(), {
        success: function () {
            Parse.User.current().destroy({
                success: function () {
                    Parse.User.logOut();
                    sessionStorage.clear();
                    window.location.replace("/");
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
});

$(document).ready(onPageLoad);