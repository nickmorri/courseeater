String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var track = angular.module('courseeater.track', ['courseeater.auth', 'ui.bootstrap']);

track.factory('Course', function () {
    return function (data) {

        this.courseCode = data.attributes.courseCode;
        this.courseIdentifier = data.attributes.courseIdentifier;
        this.courseName = data.attributes.courseName.replace(/&nbsp;/g, '');
        this.days = data.attributes.days;
        this.final = data.attributes.final;
        this.instructor = data.attributes.instructor;
        this.localEnr = data.attributes.localEnr;
        this.max = data.attributes.max;
        this.nor = data.attributes.nor;
        this.placeBuilding = data.attributes.placeBuilding;
        this.placeURL = data.attributes.placeURL;
        this.prerequisites = data.attributes.prerequisities;
        this.req = data.attributes.req;
        this.rstr = data.attributes.rstr;
        this.sec = data.attributes.sec;
        this.status = data.attributes.status;
        this.textboooks = data.attributes.textbooks;
        this.time = data.attributes.time;
        this.totalEnr = data.attributes.totalEnr;
        this.type = data.attributes.type.toUpperCase();
        this.units = data.attributes.units;
        this.web = data.attributes.web;
        this.wl = data.attributes.wl;

        this.id = data.id;
        this.updatedAt = data.updatedAt;
        
        this.tracking = true;
        
    };
});

track.factory('CourseList', ['Course', function (Course) {
    return function (data) {
        this.title = data.attributes.title;
        this.active = data.attributes.active;
        this.courseRelation = data.relation("courses");
        this.classes = {};
        this.owner = data.attributes.owner;
        this.shared = data.attributes.shared;
        this.id = data.id;
        
        this.eventSource;
        
        this.setActive = function () {
            this.active = true;
            Parse.Cloud.run("changeActiveCourseList", {title : this.title});
        };
        
        this.setShared = function (status) {
            var query = new Parse.Query("CourseList");
            query.equalTo("objectId", this.id);
            query.find().then(function (list) {
                list.set("shared", status);
                list.save();
            });
        };
        
        this.fetchCourses = function () {
            var courseList = this;
            this.classes = {};
            return courseList.courseRelation.query().find().then(function (results) {
                courseList.classes = {};
                for (var i = 0; i < results.length; i++) {
                    var course = new Course(results[i]);
                    if (courseList.classes[course.courseIdentifier] !== undefined) {
                        courseList.classes[course.courseIdentifier].courses.push(course);
                        
                        if (course.type == "LEC") courseList.classes[course.courseIdentifier].mainCourse = course;
                        
                    }
                    else {
                        courseList.classes[course.courseIdentifier] = {};
                        courseList.classes[course.courseIdentifier].className = course.courseName;
                        courseList.classes[course.courseIdentifier].classIdentifier = course.courseIdentifier;
                        courseList.classes[course.courseIdentifier].courses = [course];
                        courseList.classes[course.courseIdentifier].mainCourse = course;
                    }
                }
                courseList.makeEvents();
            });
        };
        
        this.hasCourse = function (courseCode) {
            return this.getCourse(courseCode) !== undefined;
        }
        
        this.getCourse = function (courseCode) {
            for (className in this.classes) {
                var courses = this.classes[className].courses;
                for (var i = 0; i < courses.length; i++) {
                    if (courseCode === courses[i].courseCode) return courses[i];
                }
            }
            return undefined;
        };
        
        this.empty = function () {
            return Object.keys(this.classes).length === 0;
        };
        
        this.addCourse = function (courseCode) {
            var courseList = this;
            Parse.Cloud.run('addCourse', {courseCode : courseCode}).then(function () {
                courseList.fetchCourses();
            })
        };
        
        this.replaceCourse = function (oldCourseCode, newCourseCode) {
            var courseList = this;
            Parse.Cloud.run('removeCourse', {courseCode : oldCourseCode}).then(function () {
                Parse.Cloud.run('addCourse', {courseCode : newCourseCode}).then(function () {
                    courseList.fetchCourses();
                })
            })
        }
        
        this.removeCourse = function (courseCode) {
            var courseList = this;
            Parse.Cloud.run('removeCourse', {courseCode : courseCode}).then(function () {
                courseList.fetchCourses();    
            });
        };
        
        this.makeEvent = function (course, color) {
            var calendarCourses, title, days, heldDays, time, start, end, event, i, endFront, endBack, startFront, startBack;
            if (course.time.indexOf("TBA") !== -1) return [];
            // Title processing
            title = course.courseIdentifier.toUpperCase() + " - " + course.type.toUpperCase();
            // Day parsing
            days = course.days;
            heldDays = [];
            if (days.indexOf("M") > -1) heldDays.push(getWeekday(0));
            if (days.indexOf("Tu") > -1) heldDays.push(getWeekday(1));
            if (days.indexOf("W") > -1) heldDays.push(getWeekday(2));
            if (days.indexOf("Th") > -1) heldDays.push(getWeekday(3));
            if (days.indexOf("F") > -1) heldDays.push(getWeekday(4));
            // Time parsing
            time = course.time.split(" to ");
            start = time[0];
            end = time[1];
            // Removing spaces
            if (time[0][0] === " ") start = start.slice(1);
            if (time[1][0] === " ") end = end.slice(1);
            // Further breaking things down into 4 distinct parts.
            startFront = parseInt(start.split(":")[0], 10);
            startBack = start.split(":")[1].slice(0, 2);
            endFront = parseInt(end.split(":")[0], 10);
            endBack = end.split(":")[1].slice(0, 2);
            // Processing of these parts
            if (end.indexOf("PM") !== -1 && endFront !== 12) endFront += 12;
            if (start.indexOf("PM") !== -1 && startFront !== 12) startFront += 12;
            if (endFront > 12 && startFront !== 12) startFront += 12;
            if (startFront < 10) startFront = "0" + startFront;
            if (endFront < 10) endFront = "0" + endFront;
            // Formatting these four parts for the FullCalendar library
            start = "T" + startFront + ":" + startBack + ":00";
            end = "T" + endFront + ":" + endBack + ":00";
            calendarCourses = [];
            // Event object creation
            for (i = 0; i < heldDays.length; i++) {
                event = {
                    id: course.courseCode,
                    title: title,
                    start: heldDays[i] + start,
                    end: heldDays[i] + end,
                    backgroundColor: color
                };
                calendarCourses.push(event);
            }
            return calendarCourses;
        };
        
        this.makeEvents = function () {
            var colors = ["red", "green", "blue", "purple", "orange", "brown", "burlywood", "cadetblue", "coral", "darkcyan", "darkgoldenrod", "darkolivegreen"];
            var events = [];

            for (item in this.classes) {
                var classObj = this.classes[item];
                // Random color for a class
                hash = Math.abs(classObj.className.hash()) % colors.length;
                var color = colors[hash];
                colors.splice(colors.indexOf(color), 1);
                for (var i = 0; i < classObj.courses.length; i++) {                        
                    events = events.concat(this.makeEvent(classObj.courses[i], color));
                }
            }
            this.eventSource = events;  
        };
        
        this.fetchCourses();
    };
}]);

track.factory('CourseListStore', ['CourseList', 'AuthService', function (CourseList, AuthService) {
    
    var CourseListStore = {};
    
    CourseListStore._collection = [];
    CourseListStore.authService = AuthService;
    
    this.activeList = undefined;
    this.initialized = false;
    
    CourseListStore.retrieveCourseLists = function () {
        var query = new Parse.Query("CourseList");
        query.equalTo("owner", this.authService.currentUser);
        return query.find().then(function (result) {
            CourseListStore._collection = [];
            var list;
            for (var i = 0; i < result.length; i++) {
                list = new CourseList(result[i]);
                CourseListStore._collection.push(list);
                
                if (list.active) CourseListStore.activeList = list;
            }
            CourseListStore.initialized = true;
        });
    };
    
    CourseListStore.saveList = function (objectId, newTitle) {
        Parse.Cloud.run('updateCourseList', {
                objectId: objectId,
                newTitle: newTitle,
                shared: false
            }).then(function () {
                CourseListStore.retrieveCourseLists();
        });
    };
    
    CourseListStore.createNewList = function (title, shared) {
        Parse.Cloud.run('createCourseList', {title : title, shared : shared}).then(function () {
            CourseListStore.retrieveCourseLists();
        });
    };
    
    CourseListStore.setActiveList = function (list) {
        CourseListStore.activeList.active = false;
        CourseListStore.activeList = list;
        list.setActive();  
    };
    
    return CourseListStore;
    
}]);

track.controller('ListController', ['$scope', 'AuthService', 'CourseListStore', '$modal', function ($scope, AuthService, CourseListStore, $modal) {
    $scope.authService = AuthService;
    $scope.courseListStore = CourseListStore;
    
    $scope.setActiveList = function (list) {
        $scope.courseListStore.setActiveList(list);    
    };
    
    $scope.createList = function () {
        var modalInstance = $modal.open({
            templateUrl: 'app/components/track/directives/course-list-modal.html',
            controller: 'CourseListModalController',
            resolve: {
                list: function () {
                    return undefined;
                }
            }
        });
    };
    
    $scope.editList = function (targetList) {
        var modalInstance = $modal.open({
            templateUrl: 'app/components/track/directives/course-list-modal.html',
            controller: 'CourseListModalController',
            resolve: {
                list: function () {
                    return targetList;
                }
            }
        });
    };
}]);

track.controller('CourseSearchModalController', ['$scope', 'Course', 'CourseListStore', '$modalInstance', 'results', 'originalCourse', function ($scope, Course, CourseListStore, $modalInstance, results, originalCourse) {
    $scope.activeList = CourseListStore.activeList;
    $scope.resultCourses = [];
    $scope.originalCourse = originalCourse;
    
    if (results.length !== 0) {
        $scope.courseIdentifier = results[0].attributes.courseIdentifier;
    
        for (var i = 0; i < results.length; i++) {
            var temporaryCourse = new Course(results[i]);
            temporaryCourse.tracking = false;
            $scope.resultCourses.push(temporaryCourse);
        }
    }
    
    $scope.addCourse = function (course) {
        $scope.activeList.addCourse(course.courseCode);
        $scope.$close();
    };
    
    $scope.removeCourse = function (course) {
        $scope.activeList.removeCourse(course.courseCode);
        $scope.$close();
    }
    
    $scope.replaceCourse = function (course) {
        $scope.activeList.replaceCourse(originalCourse.courseCode, course.courseCode);
        $scope.$close();
    };
 
}]);

track.controller('CourseListModalController', ['$scope', 'CourseListStore', '$modalInstance', 'list', function ($scope, CourseListStore, $modalInstance, list) {
    $scope.courseListStore = CourseListStore;
    
    if (list !== undefined) {
        $scope.list = list;
    } else {
        $scope.list = {
            title: undefined,
            newList: true
        };
    }
    
    $scope.save = function () {
        $scope.courseListStore.saveList($scope.list.id, $scope.list.title);
        $scope.$close();
    };
    
    $scope.create = function () {
        $scope.courseListStore.createNewList($scope.list.title, false);
        $scope.$close();
    };
}]);

track.controller('TrackController', ['$scope', 'AuthService', 'CourseListStore', '$modal', function ($scope, AuthService, CourseListStore, $modal) {
    $scope.authService = AuthService;
    $scope.courseListStore = CourseListStore;
    
    if (!$scope.courseListStore.initialized) {
        $scope.courseListStore.retrieveCourseLists();
    }
        
    $scope.newCourseCode = undefined;
    
    $scope.addCourse = function () {
        $scope.courseListStore.activeList.addCourse($scope.newCourseCode);
        $scope.newCourseCode = undefined;
    };
    
    $scope.removeCourse = function (course) {
        $scope.courseListStore.activeList.removeCourse(course.courseCode);
    };
    
    $scope.searchForCocourses = function (course, type) {
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            var modalInstance = $modal.open({
                templateUrl: 'app/components/track/directives/course-search-modal.html',
                controller: 'CourseSearchModalController',
                resolve: {
                    results: function () {
                        return results;
                    },
                    originalCourse: function () {
                        return undefined;
                    }
                }
            });
        });
    };
    
    $scope.searchForReplacements = function (course, type) {
        var query = new Parse.Query("Course");
        query.equalTo("courseIdentifier", course.courseIdentifier);
        query.equalTo("type", type.toTitleCase());
        query.find().then(function (results) {
            var modalInstance = $modal.open({
                templateUrl: 'app/components/track/directives/course-search-modal.html',
                controller: 'CourseSearchModalController',
                resolve: {
                    results: function () {
                        return results;
                    },
                    originalCourse: function () {
                        return course;
                    }
                }
            });
        });
    };
}]);

track.directive('courseListView', function () {
    return {
        templateUrl: "app/components/track/directives/course-list-view.html"
    }
});

track.directive('classView', function () {
    return {
        templateUrl: "app/components/track/directives/class-view.html"
    }
});

track.directive('courseView', function () {
    return {
        templateUrl: "app/components/track/directives/course-view.html"
    }
});

track.directive('courseInfoView', function () {
     return {
        templateUrl: "app/components/track/directives/course-info-view.html"
    }
});

track.directive('courseActionsView', function () {
    return {
        templateUrl: "app/components/track/directives/course-actions-view.html"
    }
});

track.directive('courseSearchView', function () {
    return {
        templateUrl: 'app/components/track/directives/course-search-view.html'
    }
});

track.directive('courseHeldDaysView', function () {
    return {
        templateUrl: "app/components/track/directives/course-held-days-view.html"
    }
});