<?php

function get_data($key) {
    $mem = new Memcached();
    $mem->addServer("127.0.0.1", 11211);
    return $mem->get($key);
};

function set_data($key, $data) {
    $cache_life = 300;
    $mem = new Memcached();
    $mem->addServer("127.0.0.1", 11211);
    return $mem->set($key, $data, $cache_life);
};

