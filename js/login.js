Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU", "Rncx0sNYiCARajhzNE2m86l4HXdmYxo3yZ2AGJNy");
if (Parse.User.current()) {window.location.replace("track");}
	    
// Google Analytics Information
function googleAnalytics() {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
				
	ga('create', 'UA-9939990-3', 'courseeater.com');
	ga('send', 'pageview');
};

// Allows enter to login by calling #.btn-login button click
$(document).on("keypress", ".form-control-password.login-password", function(event) {
	if (event.which == 13) { $(".btn-login").click(); }
});
	
// Login processing
$(document).on('click', '.btn-login', function() {
	var bBtn = $(this);
	bBtn.button("loading");
  	Parse.User.logIn($(".form-control-username").val(), $(".form-control-password.login-password").val(), {
		success: function(user) {
			window.location.replace("track");
		},
		error: function(user, error) {
			if (error.code == 101) {
				bBtn.button("reset");
				$(".alert-login").show();
				$("#loginForm").trigger("reset");
				$("#loginForm .form-control-username.login-username").focus();
			}
			console.log(error);
		}	
	});
});

$(document).on("keypress", ".form-control-password.registration-password", function(event) {
	if (event.which == 13) { $(".btn-register").click(); }
});

$(document).on("click", ".btn-register", function() {
	var username = $(".form-control-username.registration-username").val();
	var email = $(".form-control-email.registration-email").val();
	var user = new Parse.User();
	user.set("username", username);
	user.set("email", email);
	user.set("password", $(".form-control-password.registration-password").val());
	user.signUp(null, {
		success: function(user) {
	    	window.location.replace("index");
		},
		error: function(user, error) {
	    	// Show the error message somewhere and let the user try again.
	    	if (error.code == 125) {
		    	$(".alert-register").html("<strong>Whoops!</strong> " + email + " is not a valid email address. Please follow the format: name@email.com");	
	    	}
	    	else if (error.code == 202) {
		    	$(".alert-register").html("<strong>Whoops!</strong> " + username + " has already been registered. Please try another username.");	
	    	}
	    	$(".alert-register").show();
			console.log(error);
		}
	});
});