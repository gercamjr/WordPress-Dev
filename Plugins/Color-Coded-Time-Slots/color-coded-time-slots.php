<?php
/**
 * Plugin Name: Color Coded Time Slots
 * Plugin URI: http://geracomdev.com
 * Description: This plugin color codes Amelia Booking time slots depending on number of attendees
 * Version: 1.0.0
 * Author: Gerardo Camorlinga Jr
 * Author URI: http://geracomdev.com
 * License: GPL2
 */
// Fires after WordPress has finished loading, but before any headers are sent.
add_action( 'init', 'script_enqueuer' );
add_action( 'wp_ajax_color-coded-time-slots', 'change_Colors' );
add_action( 'wp_ajax_nopriv_color-coded-time-slots', 'change_Colors' );

/** @return never  */
function change_Colors() {
    log("made it to the ajax request");
	if ( isset($_POST)) {
		$bookingDay = $_POST['dateSelected'];
		global $wpdb;
		$sql = $wpdb->prepare("select apps.bookingStart, COUNT(*) as booked from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id where apps.bookingStart like %s'%' and apps.status = 'approved' GROUP BY books.appointmentId;", $bookingDay);
		$result = $wpdb->get_row($sql);
		echo json_encode($result);
	}
	die();
}

/** @return void  */
function script_enqueuer() {
   
   // Register the JS file with a unique handle, file location, and an array of dependencies
   wp_register_script( "color-coded-time-slots", plugin_dir_url(__FILE__).'color-coded-time-slots.js', array('jquery') );
   
   // localize the script to your domain name, so that you can reference the url to admin-ajax.php file easily
   wp_localize_script( 'color-coded-time-slots', 'myAjax', array( 'ajaxurl' => admin_url( 'admin-ajax.php' )));        
   
   // enqueue jQuery library and the script you registered above
   wp_enqueue_script( 'jquery' );
   wp_enqueue_script( 'color-coded-time-slots' );
}
?>