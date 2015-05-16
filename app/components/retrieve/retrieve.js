var retrieve = angular.module('courseeater.retrieve', []);

retrieve.factory('Retriever', ['$http', function ($http) {
    var Retriever = {};
    
    Retriever.host = 'https://development.courseeater.com';
    Retriever.port = 4000;
    
    Retriever.get = function () {
        
        $http.get(Retriever.host + ':' + Retriever.port + '/perl/WebSoc?YearTerm=2015-92&ShowFinals=1&ShowComments=1&Dept=BIO%20SCI').then(function (response) {
            
            var parser = new DOMParser();
            
            var classes = [];
            
            classes.makeClassData = function (row) {
                var data = row.querySelector('td.CourseTitle');
                
                this.push({
                    indentifier: data.firstChild.textContent.trim().replace(/\s{2,}/g, ' '),
                    title: data.querySelector('font').textContent,
                    prerequisites: data.querySelector('a') != null ? data.querySelector('a').href : '',
                    course_data: []
                });
            };
            
            classes.makeCourseData = function (row) {
                var data = row.children;
                
                if (data.length == 16) {
                    this[this.length - 1].course_data.push({
                        courseCode: data[0].textContent,
                        type: data[1].textContent,
                        sec: data[2].textContent,
                        units: data[3].textContent,
                        instructor: data[4].hasChildNodes() ? Array.prototype.slice.call(data[4].childNodes).filter(function (node) {
                            return node.nodeName == "#text";
                        }).map(function (node) {
                            return node.textContent;
                        }) : [data[4].innerText],
                        time: data[5].textContent,
                        place: data[6].textContent,
                        placeURL: data[6].querySelector('a') != null ? data[6].querySelector('a').href : '',
                        final_exam: data[7].textContent.trim(),
                        max: parseInt(data[8].textContent, 10),
                        enr: parseInt(data[9].textContent, 10),
                        req: parseInt(data[10].textContent, 10),
                        nor: parseInt(data[11].textContent, 10),
                        rstr: data[12].textContent,
                        textbookURL: data[13].querySelector('a') != null ? data[13].querySelector('a').href : '',
                        web: data[15].textContent,
                        status: data[15].textContent
                    });
                } else {
                    this[this.length - 1].course_data.push({
                        courseCode: data[0].textContent,
                        type: data[1].textContent,
                        sec: data[2].textContent,
                        units: data[3].textContent,
                        instructor: data[4].hasChildNodes() ? Array.prototype.slice.call(data[4].childNodes).filter(function (node) {
                            return node.nodeName == "#text";
                        }).map(function (node) {
                            return node.textContent;
                        }) : [data[4].innerText],
                        time: data[5].textContent,
                        place: data[6].textContent,
                        placeURL: data[6].querySelector('a') != null ? data[6].querySelector('a').href : '',
                        final_exam: data[7].textContent.trim(),
                        max: parseInt(data[8].textContent, 10),
                        enr: parseInt(data[9].textContent, 10),
                        wl: parseInt(data[10].textContent, 10),
                        req: parseInt(data[11].textContent, 10),
                        nor: parseInt(data[12].textContent, 10),
                        rstr: data[13].textContent,
                        textbookURL: data[14].querySelector('a') != null ? data[14].querySelector('a').href : '',
                        web: data[15].textContent,
                        status: data[16].textContent
                    });
                }
                
            };
            
            Array.prototype.slice.call(parser.parseFromString(response.data, "text/html").querySelectorAll('tr[valign="top"]')).forEach(function (row) {
                if (row.children.length == 1) this.makeClassData(row);
                else this.makeCourseData(row);
            }, classes);
            
            debugger
            
            return classes;
            
        });
    };
    
    return Retriever;
}])