var term, block, url;
term = '2014-92';
block = '0-6500';
url = 'http://websoc.reg.uci.edu/perl/WebSoc?YearTerm=' + term + '&ShowFinals=1&ShowComments=1&CourseCodes=' + block;

function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

console.log(httpGet(url));