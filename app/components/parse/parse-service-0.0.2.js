(function () {
   "use strict";

    var modules_dependencies = ['ui.bootstrap', 'parse-angular'];

    angular
        .module("parse.service", modules_dependencies)
        .run(ParseServiceRun);

    ParseServiceRun.$inject = ['$modal'];
    function ParseServiceRun ($modal) {
        if (isOldSession()) {
            $modal.open({
                keyboard: false,
                backdrop: 'static',
                templateUrl: 'app/components/parse/directives/migration-modal.html',
                controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                    $scope.ok = $modalInstance.close;
                }]
            }).result.then(function () {
                localStorage.clear();
                document.location.reload(true);
            });
        }
        else {
            Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU");
            Parse.serverURL = "https://db.courseeater.com/parse";
        }
    }

    function isOldSession () {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        var currentUserKey = keys.find(function (key) {
            return key.indexOf("currentUser") > -1;
        });
        if (!!currentUserKey) {
            var currentUserData = JSON.parse(localStorage.getItem(currentUserKey));
            return !!currentUserData._sessionToken;
        }
        return false;
    }

}());