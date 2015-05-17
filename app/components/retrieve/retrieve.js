var retrieve = angular.module('courseeater.retrieve', []);

retrieve.factory('Retriever', ['$http', '$q', function ($http, $q) {
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
            prerequisites: data.querySelector('a') != null ? data.querySelector('a').href : null,
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
            }, {}) : [element.innerText]
        };
        
        var process_clock = function (time) {
            if (time.indexOf("TBA") != -1) return null
            // Remove whitespace around time string
            var start_end = time.trim().split("-");                
            var start = start_end[0].trim();
            var end = start_end[1].trim();
            
            var isBeforeNoon = start.split(':')[0] >= 8 && start.split(':')[0] < 12;
            
            var isAfternoon = end.indexOf('p') != -1;
            
            var morningClass = !isAfternoon;
            
            if (morningClass) am_pm = "AM";
            else if (isBeforeNoon && isAfternoon) am_pm = "AM-PM";
            else am_pm = "PM";
            return {
                start: start.replace('pm', '').replace('p', ''),
                end: end.replace('pm', '').replace('p', ''),
                am_pm: am_pm
            }
        };
        
        var process_time = function (time) {
            // Seperate days and time by &nbsp character
            
            if (time.indexOf("TBA") != -1) return "TBA";
            
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
            return element.querySelector('a') != null ? element.querySelector('a').href : ''
        };
        
        var process_final = function (element) {
            if (element.textContent.trim() == "") return null;
            
            var split_final = element.textContent.trim().split(",");
            
            if (split_final[0].indexOf("TBA") != -1) return null;
            
            var weekday = split_final[0].trim();
            var split_date = split_final[1].trim().split(" ");
            var month = split_date[0];
            var day = split_date[1].length == 2 ? split_date[1] : "0" + split_date[1];

            var month_index;
            
            switch (month) {
                case 'Mar':
                    month_index = "03";
                    break;
                case 'Jun':
                    month_index = "06";
                    break;
                case 'Dec':
                    month_index = "12";
                    break;
            }
            
            return {
                weekday: weekday,
                month: month,
                month_index: month_index,
                day: day,
                clock: process_clock(split_final[2])
            };
        };
        
        var process_textbook_url = function (element) {
            return element.querySelector('a') != null ? element.querySelector('a').href : '';
        };
        
        var process_enrolled = function (element) {
            if (element.textContent.indexOf("/") != -1) {
                var split_enr = element.textContent.split("/");
                return {
                    local: parseInt(split_enr[0].trim(), 10),
                    total: parseInt(split_enr[1].trim(), 10),
                }
            }
            else {
                return {
                    local: parseInt(element.textContent, 10),
                    total: parseInt(element.textContent, 10)        
                }
            }
        };
        
        return data.length == 15 ? {
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
        } : {
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
    
    /* Specific data getters */
    
    Retriever.get_ge_available = function () {
        return $http.get(Retriever.host + ':' + Retriever.port + '/perl/WebSoc').then(function (response) {
            var parser = new DOMParser();            
            
            return Array.prototype.slice.call(parser.parseFromString(response.data, "text/html").querySelector('select[name="Breadth"]').querySelectorAll('option')).map(function (option) {
                return {
                    name: option.text,
                    value: option.value.trim(),
                    type: 'category'
                }
            });
        });
    };
    
    Retriever.get_depts_available = function () {
        return $http.get(Retriever.host + ':' + Retriever.port + '/perl/WebSoc').then(function (response) {
            var parser = new DOMParser();
            
            return Array.prototype.slice.call(parser.parseFromString(response.data, "text/html").querySelector('select[name="Dept"]').querySelectorAll('option')).map(function (option) {
                return {
                    name: option.text,
                    value: option.value.trim(),
                    type: 'department'
                };
            });
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
}])