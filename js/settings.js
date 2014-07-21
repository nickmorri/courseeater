$(document).ready(function() {
	$("#new_email").attr("placeholder", Parse.User.current().get("email"));
});

$(document).on("keypress", "#new_email", function(event) {
	if (event.which == 13) { $("#updateEmail").click(); }
});

$(document).on('click', "#updateEmail", function() {
	var newEmail = $("#new_email").val();
	Parse.User.current().set("email", newEmail);
	Parse.User.current().save();
	$(".alert-account-email span").text("Email changed to " + newEmail);
	$(".alert-account-email").show();
	$("#new_email").attr("placeholder", newEmail);
	$("#new_email").val("");
});

$(document).on("keypress", "#inputVerifyPassword", function(event) {
	if (event.which == 13) { $("#updatePassword").click(); }
});

$(document).on('click', '#updatePassword', function() {
	if ($("#inputNewPassword").val() != $("#inputVerifyPassword").val()) {
		$(".alert-account-password span").text("Passwords do not match.");
		$(".alert-account-password").show();
		$("#inputNewPassword").val("");
		$("#inputVerifyPassword").val("");
	}
	Parse.User.logIn(Parse.User.current().get("username"), $("#inputCurrentPassword").val(), {
		success: function(user) {
			Parse.User.current().set("password", $("#inputNewPassword").val());
			Parse.User.current().save();
			$(".alert-account-password span").text("Password updated successfully");
			$(".alert-account-password").show();
			$("#inputNewPassword").val("");
			$("#inputVerifyPassword").val("");
			$("#inputCurrentPassword").val("");
		},
		error: function(user, error) {
			console.log("Password entered incorrectly");
			setTimeout(logout, 5000);
		}	
	});
});

$(document).on("keypress", "#password_delete_account", function(event) {
	if (event.which == 13) { $("#btn-delete").click(); }
});

$(document).on("click", "#btn-delete", function() {
	Parse.User.logIn(Parse.User.current().get("username"), $("#password_delete_account").val(), {
		success: function(user) {
			Parse.User.current().destroy({
				success: function(user) {
					Parse.User.logOut();
					sessionStorage.clear();
					window.location.replace("/");
				},
				error: function(user, error) {
					console.log(error);
				}
			});
		},
		error: function(user, error) {
			console.log(error);
		}	
	});
});