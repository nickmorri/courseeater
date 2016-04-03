function RetrieverFactory($http) {
	
	function Retriever() {
		this.host = 'https://development.courseeater.com';
		this.port = 4000;		
	}

    /* Response processors */
    
    function process_class(row) {
        var data = row.querySelector('td.CourseTitle');
                    
        return {
            identifier: data.firstChild.textContent.trim().replace(/\s{2,}/g, ' '),
            name: data.querySelector('font').textContent,
            prerequisites: data.querySelector('a') != null ? data.querySelector('a').href : null,
            course_data: []
        };
    }
    
    function process_course(row) {
        var data = row.children;
        
        function process_instructor(element) {
            return element.hasChildNodes() ? Array.prototype.slice.call(element.childNodes).filter(function (node) {
                return node.nodeName == "#text";
            }).map(function (node) {
                return node.textContent;
            }).filter(function (instructor) {
                if (this[instructor] === undefined) {
                    this[instructor] = true;
                    return true;
                }
                else {
	                return false;
                }
            }, {}) : [element.innerText]
        }
        
        function process_clock(time) {
            if (time.indexOf("TBA") != -1) {
	            return null;
            }
            
            // Remove whitespace around time string
            var split_time = time.trim().split("-");
            var start_string = split_time[0].trim();
            var end_string = split_time[1].trim();
            
            var end_hour = end_string.indexOf('p') !== -1 ? parseInt(end_string.split(":")[0], 10) + 12 : parseInt(end_string.split(":")[0], 10);
            
            var end_am_pm = end_string.indexOf('p') !== -1 ? "PM" : "AM";
	        var start_am_pm = start_string.indexOf('p') !== -1 || end_hour >= 12 ? "PM" : "AM";

            return {
                start: start_string.replace('pm', '').replace('p', ''),
                end: end_string.replace('pm', '').replace('p', ''),
                am: start_am_pm === "AM" && end_am_pm === "AM",
                pm: start_am_pm === "PM" && end_am_pm === "PM",
                am_pm: start_am_pm === "PM" && end_am_pm === "PM" ? "PM" : start_am_pm === "AM" && end_am_pm === "AM" ? "AM" : "AM-PM"
            };
        }
        
		function process_time(time) {

            // If the time is to be announced (TBA) we won't be able to parse any useful information.
            if (time.indexOf("TBA") != -1) {
	            return {clock: "TBA", days: []};
            }
            
            // Seperate days and time by &nbsp character
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
            
            return {clock: process_clock(days_time[1]), days: held_days};
        }
        
        function process_place_url(element) {
            return element.querySelector('a') != null ? element.querySelector('a').href : ''
        }
        
        function process_final(element) {
            if (element.textContent.trim() == "") {
	            return null;
            }
            
            var split_final = element.textContent.trim().split(",");
            
            if (split_final[0].indexOf("TBA") != -1) {
	            return null;
            }
            
            var split_date = split_final[1].trim().split(" ");

            return {
                weekday: split_final[0].trim(),
                month: split_date[0],
                month_index: split_date[0] == "Mar" ? "03" : split_date[0] == "Jun" ? "06" : "12",
                day: split_date[1].length == 2 ? split_date[1] : "0" + split_date[1],
                clock: process_clock(split_final[2])
            };
        }
        
        function process_textbook_url(element) {
            return element.querySelector('a') != null ? element.querySelector('a').href : '';
        }
        
        function process_enrolled(element) {
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
        }
        
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
            rstr: data[12].textContent,
            textbookURL: process_textbook_url(data[13]),
            web: data[14].textContent,
            status: data[15].textContent
        };
    }
    
    /* General operations */
    
    Retriever.prototype.retrieve = function (parameters, term) {
        if (parameters.hasOwnProperty('department')) {
	        return this.get_department(term, parameters.department);
        }
        else if (parameters.hasOwnProperty('category')) {
	        return this.get_ge(term, parameters.category);
        }
    };
    
    Retriever.prototype.parseDOM = function (response) {
	    var parser = new DOMParser();
	    return parser.parseFromString(response.data, "text/html");
    };
    
    Retriever.prototype.get = function (URL) {
        return $http.get(URL).then(this.parseDOM).then(function (dom) {
            var table_row_elements = Array.prototype.slice.call(dom.querySelectorAll('tr[valign="top"]'));
                        
            var classes = [];
            
	        table_row_elements.forEach(function (row) {
	            // Process the class description row and add it to the classes Array.
	            if (row.children.length == 1) {
		            classes.push(process_class(row));
	            }
	            // Process the course description row and add it to the last class in the classes Array.
	            else {
		            classes[classes.length - 1].course_data.push(process_course(row));
	            }
	        });
            
            return classes;
        });
    };
    
    /* URL Builders */
    
    Retriever.prototype.build_base_url = function (term) {
        return this.host + ':' + this.port + '/perl/WebSoc?YearTerm=' + encodeURIComponent(term) + '&ShowFinals=1&ShowComments=1&'; 
    };
    
    /* Specific data getters */
    
    Retriever.prototype.get_ge_available = function () {
        return $http.get(this.host + ':' + this.port + '/perl/WebSoc').then(this.parseDOM).then(function (dom) {
            var ge_options = Array.prototype.slice.call(dom.querySelector('select[name="Breadth"]').querySelectorAll('option'));
            
            return ge_options.map(function (option) {
                return {
                    name: option.text,
                    value: option.value.trim(),
                    type: 'category'
                }
            });
        });
    };
    
    Retriever.prototype.get_depts_available = function () {
        return $http.get(this.host + ':' + this.port + '/perl/WebSoc').then(this.parseDOM).then(function (dom) {
            var department_options = Array.prototype.slice.call(dom.querySelector('select[name="Dept"]').querySelectorAll('option'));
            
            return department_options.map(function (option) {
                return {
                    name: option.text,
                    value: option.value.trim(),
                    type: 'department'
                };
            });
        });
    };
    
    
    Retriever.prototype.get_course = function (term, course_code) {
        return this.get(this.build_base_url(term) + 'CourseCodes=' + encodeURIComponent(course_code));
    };
    
    Retriever.prototype.get_co_courses = function (term, department, course_num, type) {
        return this.get(this.build_base_url(term) + 'Dept=' + encodeURIComponent(department) + '&CourseNum=' + encodeURIComponent(course_num) + '&ClassType=' + encodeURIComponent(type));
    };
    
    Retriever.prototype.get_replacement_courses = function (term, department, course_num, type) {
        return this.get(this.build_base_url(term) + 'Dept=' + encodeURIComponent(department) + '&CourseNum=' + encodeURIComponent(course_num) + '&ClassType=' + encodeURIComponent(type));
    };
    
    Retriever.prototype.get_department = function (term, department) {
	    return this.get(this.build_base_url(term) + 'Dept=' + encodeURIComponent(department));
    };
    
    Retriever.prototype.get_ge = function (term,  category) {
        return this.get(this.build_base_url(term) + 'Breadth=' + encodeURIComponent(category));
    };
    
    return new Retriever();
}

angular.module('courseeater.retrieve', [])
	.factory('Retriever', ['$http', RetrieverFactory]);
