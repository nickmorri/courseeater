(function () {
   "use strict";

    var modules_dependencies = ['parse-angular'];

    angular
        .module("parse.service", modules_dependencies)
        .run(ParseServiceRun);

    function ParseServiceRun () {
        Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU");
        Parse.serverURL = "https://db.courseeater.com/parse";
    }

}());