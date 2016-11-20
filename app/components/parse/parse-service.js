var parse_service = angular.module("parse.service", ['parse-angular']);

parse_service.run(function () {
    Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU");
    Parse.serverURL = "https://db.courseeater.com/parse";
});
