<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

include_once('simple_html_dom.php');

$GLOBALS['school_id'] = '1074';

function process_html($html) {
    
    foreach($html->find('tr[bgcolor=#fff0ff]') as $class) {
        $class_data = process_class($class);
        if ($class_data != null) $classes[] = $class_data;
    }
    
    return json_encode($classes);

};

function request_html($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_REFERER, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    $str = curl_exec($curl);
    curl_close($curl);
    
    $html_base = new simple_html_dom();
    // Load HTML from a string
    return $html_base->load($str);
};

function build_professor_url($last_name) {
    return 'http://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=10&q=' . $last_name . '+AND+schoolid_s%3A' . $GLOBALS['school_id'] . '&defType=edismax&qf=teacherfullname_t%5E1000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s';
};
    
if (trim($_REQUEST['last_name'])) {
    $last_name = trim($_REQUEST['last_name']);
    $url = build_professor_url($last_name);
    $html = request_html($url);
    echo $html;
}

?>