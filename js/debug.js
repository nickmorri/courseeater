function grab(term) {
	Parse.Cloud.run('testHTTP', {
	  success: function(result) {
	    console.log(result)
	  },
	  error: function(error) {
	  	console.log(error)
	  }
	});	
};

$(document).ready(function() {
	grab();
});