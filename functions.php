<?php

add_action('wp_enqueue_scripts', function() {
	wp_enqueue_style('chronisis_fonts', 'http://fonts.googleapis.com/css?family=Open+Sans:300', [], null, 'all');
	wp_enqueue_style('chronisis', get_stylesheet_uri(), ['chronisis_fonts', 'normalize', 'base'], null, 'all');
	wp_enqueue_script('sc', 'http://connect.soundcloud.com/sdk.js', [], null, true);
	wp_enqueue_script('chronisis', get_stylesheet_directory_uri() . '/player.js', ['sc'], null, true);
});

add_action('ba_header', function() {
    echo '<img src="' . get_stylesheet_directory_uri() . '/logo.png" alt="Chronisis" />';
});

add_action('ba_footer', function() {
    echo '<p>Chronisis:</p><ul><li>Arnaud Clément</li><li>Bastien Sudan</li><li>Joakim Stalder</li><li>Johan Stalder</li><li>Jordi Gudiel</li></ul>';
});

?>