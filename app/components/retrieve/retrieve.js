var retrieve = angular.module('courseeater.retrieve', []);

retrieve.factory('ScheduleRetriever', ['$http', '$q', function ($http, $q) {
    var Retriever = {};
    
    Retriever.host = 'https://development.courseeater.com';
    Retriever.port = 4000;
    
    /* General operations */
    
    Retriever.retrieve = function (parameters, term) {
        if (parameters.hasOwnProperty('department')) return Retriever.get_department(parameters.department, term);
        else if (parameters.hasOwnProperty('category')) return Retriever.get_ge(parameters.category, term);
    };
    
    Retriever.get = function (URL) {
        return $http.get(URL).then(function (response) {    
            var parser = new DOMParser();

            return Retriever.process_response(Array.prototype.slice.call(parser.parseFromString(response.data, "text/html").querySelectorAll('tr[valign="top"]')));
        });
    };
    
    /* Response processors */
    
    Retriever.process_class = function (row) {
        var data = row.querySelector('td.CourseTitle');
                    
        return {
            identifier: data.firstChild.textContent.trim().replace(/\s{2,}/g, ' '),
            name: data.querySelector('font').textContent,
            prerequisites: data.querySelector('a') !== null ? data.querySelector('a').href : null,
            course_data: []
        };
    };
    
    Retriever.process_course = function (row) {
        var data = row.children;
        
        var process_instructor = function (element) {
            return element.hasChildNodes() ? Array.prototype.slice.call(element.childNodes).filter(function (node) {
                return node.nodeName == "#text";
            }).map(function (node) {
                return node.textContent;
            }).filter(function (instructor) {
                if (this[instructor] === undefined) {
                    this[instructor] = true;
                    return true;
                }
                else return false;
            }, {}) : [element.innerText];
        };
        
        var process_clock = function (time) {
            if (time.indexOf("TBA") != -1) return null;
            // Remove whitespace around time string
            var start_string = time.trim().split("-")[0].trim();
            var end_string = time.trim().split("-")[1].trim();
            
            var end = (function (end_string) {
                
                var am_pm = end_string.indexOf('p') !== -1 ? "PM" : "AM";
                var hour = am_pm === "PM" ? parseInt(end_string.split(":")[0], 10) + 12 : parseInt(end_string.split(":")[0], 10);
                var minute = parseInt(end_string.split(":")[1], 10);
                
                return {
                    hour: hour,
                    minute: minute,
                    am_pm: am_pm
                };
            } (end_string));
            
            var start = (function (start_string) {
                
                var am_pm = start_string.indexOf('p') !== -1 || end.hour >= 12 ? "PM" : "AM";
                var hour = am_pm === "PM" ? parseInt(start_string.split(":")[0], 10) + 12 : parseInt(start_string.split(":")[0], 10);
                var minute = parseInt(start_string.split(":")[1], 10);
                
                return {
                    hour: hour,
                    minute: minute,
                    am_pm: am_pm
                };  
            } (start_string));
            
            return {
                start: start_string.replace('pm', '').replace('p', ''),
                end: end_string.replace('pm', '').replace('p', ''),
                am_pm: start.am_pm === "PM" && end.am_pm === "PM" ? "PM" : start.am_pm === "AM" && end.am_pm === "AM" ? "AM" : "AM-PM"
            };
        };
        
        var process_time = function (time) {
            // Seperate days and time by &nbsp character
            
            if (time.indexOf("TBA") != -1) return {
                clock: "TBA",
                days: []
            };
            
            var days_time = time.split(/\u00a0/g);
            
            // Remove whitespace around days string
            var days = days_time[0].trim();
            
            // Search days string and create a array of uniform sized day strings
            var held_days = [];
            if (days.indexOf("M") != -1) held_days.push("Mon");
            if (days.indexOf("Tu") != -1) held_days.push("Tue");
            if (days.indexOf("W") != -1) held_days.push("Wed");
            if (days.indexOf("Th") != -1) held_days.push("Thu");
            if (days.indexOf("F") != -1) held_days.push("Fri");
            
            return {
                clock: process_clock(days_time[1]),
                days: held_days
            };
        };
        
        var process_place_url = function (element) {
            return element.querySelector('a') !== null ? element.querySelector('a').href : '';
        };
        
        var process_final = function (element) {
            if (element.textContent.trim() === "") return null;
            
            var split_final = element.textContent.trim().split(",");
            
            if (split_final[0].indexOf("TBA") != -1) return null;
            
            var split_date = split_final[1].trim().split(" ");
            var month = split_date[0];
            
            return {
                weekday: split_final[0].trim(),
                month_index: month === "Mar" ? "03" : month === "Jun" ? "06" : month === "Dec" ? "12" : null,
                day: split_date[1].length == 2 ? split_date[1] : "0" + split_date[1],
                clock: process_clock(split_final[2])
            };
        };
        
        var process_textbook_url = function (element) {
            return element.querySelector('a') !== null ? element.querySelector('a').href : '';
        };
        
        var process_enrolled = function (element) {
            if (element.textContent.indexOf("/") != -1) {
                var split_enr = element.textContent.split("/");
                return {
                    local: parseInt(split_enr[0].trim(), 10),
                    total: parseInt(split_enr[1].trim(), 10),
                };
            }
            else {
                return {
                    local: parseInt(element.textContent, 10),
                    total: parseInt(element.textContent, 10)        
                };
            }
        };
        
        return data.length == 15 ? 
        {
            courseCode: data[0].textContent,
            type: data[1].textContent.toUpperCase(),
            sec: data[2].textContent,
            units: data[3].textContent,
            instructor: process_instructor(data[4]),
            time: process_time(data[5].textContent),
            place: data[6].textContent,
            placeURL: process_place_url(data[6]),
            final: process_final(data[7]),
            max: parseInt(data[8].textContent, 10),
            localEnr: process_enrolled(data[9]).local,
            totalEnr: process_enrolled(data[9]).total,
            req: parseInt(data[10].textContent, 10),
            rstr: data[11].textContent,
            textbookURL: process_textbook_url(data[12]),
            web: data[13].textContent,
            status: data[14].textContent
        } : 
        {
            courseCode: data[0].textContent,
            type: data[1].textContent.toUpperCase(),
            sec: data[2].textContent,
            units: data[3].textContent,
            instructor: process_instructor(data[4]),
            time: process_time(data[5].textContent),
            place: data[6].textContent,
            placeURL: process_place_url(data[6]),
            final: process_final(data[7]),
            max: parseInt(data[8].textContent, 10),
            localEnr: process_enrolled(data[9]).local,
            totalEnr: process_enrolled(data[9]).total,
            wl: parseInt(data[10].textContent, 10),
            req: parseInt(data[11].textContent, 10),
            nor: parseInt(data[12].textContent, 10),
            rstr: data[13].textContent,
            textbookURL: process_textbook_url(data[14]),
            web: data[15].textContent,
            status: data[16].textContent
        };
    };
        
    Retriever.process_response = function (rows) {
        var classes = [];
                
        rows.forEach(function (row) {
            if (row.children.length == 1) classes.push(Retriever.process_class(row));
            else classes[classes.length - 1].course_data.push(Retriever.process_course(row));
        }, classes);
        
        return classes;
    };
    
    /* URL Builders */
    
    Retriever.build_base_url = function (term) {
        return Retriever.host + ':' + Retriever.port + '/perl/WebSoc?YearTerm=' + encodeURIComponent(term) + '&ShowFinals=1&ShowComments=1&'; 
    };
    
    Retriever.build_department_url = function (department, term) {
        return Retriever.build_base_url(term) + 'Dept=' + encodeURIComponent(department);
    };
    
    Retriever.build_ge_url = function (category, term) {
        return Retriever.build_base_url(term) + 'Breadth=' + encodeURIComponent(category);
    };
    
    Retriever.build_course_url = function (course_code, term) {
        return Retriever.build_base_url(term) + 'CourseCodes=' + encodeURIComponent(course_code);
    };
    
    Retriever.build_co_course_url = function (department, course_num, type, term) {
        return Retriever.build_base_url(term) + 'Dept=' + encodeURIComponent(department) + '&CourseNum=' + encodeURIComponent(course_num) + '&ClassType=' + encodeURIComponent(type);
    };
    
    Retriever.build_replacement_url = function (department, course_num, type, term) {
        return Retriever.build_base_url(term) + 'Dept=' + encodeURIComponent(department) + '&CourseNum=' + encodeURIComponent(course_num) + '&ClassType=' + encodeURIComponent(type);
    };
    
    Retriever.get_depts_and_ge_available = function () {
        return $http.get(Retriever.host + ':' + Retriever.port + '/perl/WebSoc').then(function (response) {
            var parser = new DOMParser();
            var temp_DOM = parser.parseFromString(response.data, "text/html");
            
            return Array.prototype.slice.call(temp_DOM.querySelector('select[name="Breadth"]').querySelectorAll('option')).map(function (option) {
                return {
                    name: option.text,
                    value: option.value.trim(),
                    type: 'category'
                };
            }).concat(Array.prototype.slice.call(temp_DOM.querySelector('select[name="Dept"]').querySelectorAll('option')).map(function (option) {
                return {
                    name: option.text,
                    value: option.value.trim(),
                    type: 'department'
                };
            }));
                
        });
    };
    
    Retriever.get_course = function (course_code, term) {
        return Retriever.get(Retriever.build_course_url(course_code, term));
    };
    
    Retriever.get_co_courses = function (department, course_num, type, term) {
        return Retriever.get(Retriever.build_co_course_url(department, course_num, type, term));
    };
    
    Retriever.get_replacement_courses = function (department, course_num, type, term) {
        return Retriever.get(Retriever.build_replacement_url(department, course_num, type, term));
    };
    
    Retriever.get_department = function (department, term) {
        return Retriever.get(Retriever.build_department_url(department, term));
    };
    
    Retriever.get_ge = function (category, term) {
        return Retriever.get(Retriever.build_ge_url(category, term));
    };
    
    return Retriever;
}]);

retrieve.factory('InstructorRetriever', ['$http', '$q', function ($http, $q) {
    var Retriever = {};
    
    Retriever.host = 'https://development.courseeater.com';
    Retriever.port = 5000;
    
    Retriever.school_id = 1074;
    
    /* General operations */
    
    Retriever.retrieve = function (last_name, first_name) {
        return $http.get(Retriever.build_base_url(last_name)).then(function (response) {
            return response.data.response.docs.find(function (potential) {
                return potential.teacherlastname_t.toUpperCase() == this.last_name.toUpperCase() && potential.teacherfirstname_t.toUpperCase()[0] == this.first_name.toUpperCase()[0];
            }, {last_name: last_name, first_name: first_name});
        });
    };
    
    Retriever.build_base_url = function (last_name) {
        return Retriever.host + ':' + Retriever.port + '/typeahead/suggest/?solrformat=true&rows=10&q=' + encodeURIComponent(last_name) + '+AND+schoolid_s%3A' + encodeURIComponent(Retriever.school_id) + '&defType=edismax&qf=teacherfullname_t%5E1000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s'; 
    };
    
    return Retriever;
}]);

retrieve.factory('AntplannerRetriever', ['$http', '$q', function ($http, $q) {
    var Retriever = {};
    
    Retriever.host = 'https://development.courseeater.com';
    Retriever.port = 5500;
    
    /* General operations */
    
    Retriever.retrieve = function (username) {
        return $http.get(Retriever.build_base_url(username)).then(function (response) {
            return JSON.parse(response.data.data).map(function (item) {
                return parseInt(item.groupId, 10);
            }).filter(function (courseCode) {
                if (this.hasOwnProperty(courseCode)) return false;
                else {
                    this[courseCode] = true;
                    return true;
                }
            }, {});
        });
    };
    
    Retriever.build_base_url = function (username) {
        return Retriever.host + ':' + Retriever.port + '/schedule/load?username=' + encodeURIComponent(username); 
    };
    
    return Retriever;
}]);