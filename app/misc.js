// Prototypes

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

String.prototype.hash = function() {
	var hash = 0;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};

Array.prototype.remove = function (key) {
    this.splice(this.indexOf(key), 1);
};

Array.prototype.clear = function () {
    this.splice(0, this.length);
};

// Returns the Date object relative to the Monday as index 0 of current week
var getWeekday = function (day) {
	var date, day_of_month, day_of_week, this_monday;
	date = new Date();
	// Setting time to midnight for consistent Datetime parsing
	date.setHours(0,0,0,0);
	day_of_month = date.getDate();
	day_of_week = date.getDay();
	this_monday = (day_of_month - day_of_week) + 1;
	date.setDate(this_monday + day);
	return date.toISOString().split("T")[0];
};

// Polyfills

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.lastIndexOf(searchString, position) === position;
    };
}

var makeImage = function (element, file_name) {
	html2canvas(angular(element), {
		onrendered: function(canvas) {
			var destinationCanvas, destinationContext, today, link;
		
			destinationCanvas = document.createElement('canvas');
			destinationCanvas.width = canvas.width;
			destinationCanvas.height = canvas.height;
			
			destinationContext = destinationCanvas.getContext("2d");
			destinationContext.rect(0, 0, canvas.width, canvas.height);
			destinationContext.fillStyle = "white";
			destinationContext.fill();

			destinationContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
			
			destinationContext.font = '10pt Helvetica';
			destinationContext.fillStyle = "black";
			destinationContext.fillText("CourseEater.com", canvas.width - 140, canvas.height - 8);
			
			today = new Date();
			
			link = document.createElement("a");
			link.download = file_name + " | CourseEater - " + today.toLocaleDateString("en-US") + ".png";
			link.href = destinationCanvas.toDataURL();
			link.click();
	    }
	});
};

// Third party code

var google_analytics = function () {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-9939990-3', 'auto');
    ga('send', 'pageview');
};

google_analytics();