<?php
/**
 * Plugin Name: Color Coded Time Slots
 * Plugin URI: https://github.com/gercamjr/WordPress-Dev
 * Description: This plugin color codes Amelia Booking time slots depending on number of attendees
 * Version: 1.0.1
 * Author: Gerardo Camorlinga Jr
 * Author URI: http://github.com/gercamjr
 * License: GPL2
 */
// Fires after WordPress has finished loading, but before any headers are sent.
add_action( 'init', 'script_enqueuer_colors' );
add_action( 'wp_ajax_color-coded-time-slots', 'change_Colors' );
add_action( 'wp_ajax_nopriv_color-coded-time-slots', 'change_Colors' );

/** @return never  */
function change_Colors() {
    global $wpdb;
    error_log("made it to the ajax request");
	if ( isset($_POST)) {
        error_log("post is set");
		$bookingDay = $_POST['dateSelected'].'%';
        $servName = $_POST['serviceName'];
        error_log("bookingDay looks like this: " . $bookingDay);
        error_log("serviceName looks like: " . $servName);
        $result = array();
        // hard coding the service names and id's
        $services = array("No Minimum IG Live" => 2,
                          "10k+ IG Live" => 3,
                          "IG Live with @yourbestinsta" => 4,
                          "IG Live with @onaartist" => 5);
        $serviceId = $services[$servName];
        error_log("the serviceId: " . $serviceId);
		$sql = $wpdb->prepare("select apps.bookingStart, COUNT(*) as booked from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id where apps.bookingStart like %s and apps.status = 'approved' and apps.serviceId = %d GROUP BY books.appointmentId;", $bookingDay, $serviceId);
		$result = $wpdb->get_results($sql);
        
        //error_log("came back from sql query: " . print_r($result));
		echo json_encode($result);
        error_log("echoed the json encoded query results...");
	}
	die();
}

/** @return void  */
function script_enqueuer_colors() {
   
   // Register the JS file with a unique handle, file location, and an array of dependencies
   wp_register_script( "color-coded-time-slots", plugin_dir_url(__FILE__).'color-coded-time-slots.js', array('jquery') );
   
   // localize the script to your domain name, so that you can reference the url to admin-ajax.php file easily
   wp_localize_script( 'color-coded-time-slots', 'myAjax', array( 'ajaxurl' => admin_url( 'admin-ajax.php' )));        
   
   // enqueue jQuery library and the script you registered above
   wp_enqueue_script( 'jquery' );
   wp_enqueue_script( 'color-coded-time-slots' );
}
?>