var parse_service = angular.module("parse.service", ['parse-angular']);

parse_service.run(function () {
    Parse.initialize("soM1zL3RJadJVqxeK4kONzJllLf4idpFzFfPlRIq", "vn9eOES9KzEyaTca2qGJB7iFSNwEn0BNTtxuLmrX");
});