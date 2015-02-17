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

// Returns the Date object for the Monday of the current week
var getWeekday = function (day) {
	var date, dayOfMonth, dayOfWeek, thisMonday;
	date = new Date();
	// Setting time to midnight for consistent Datetime parsing
	date.setHours(0,0,0,0);
	dayOfMonth = date.getDate();
	dayOfWeek = date.getDay();
	thisMonday = (dayOfMonth - dayOfWeek) + 1;
	date.setDate(thisMonday + day);
	return date.toISOString().split("T")[0];;
};

var google_analytics = function () {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-9939990-3', 'auto');
    ga('send', 'pageview');
};

google_analytics();