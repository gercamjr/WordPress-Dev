<?php
/**
 * Plugin Name: Display Booked Attendees - Amelia
 * Plugin URI: https://github.com/gercamjr/WordPress-Dev
 * Description: This plugin will display customers who have booked an appointment at a given time.
 * Version: 1.0.0
 * Author: Gerardo Camorlinga Jr
 * Author URI: http://github.com/gercamjr
 * License: GPL2
 */
// Fires after WordPress has finished loading, but before any headers are sent.
add_action( 'init', 'script_enqueuer' );
add_action( 'wp_ajax_display-booked-attendees', 'display_booked_attendees' );
add_action( 'wp_ajax_nopriv_display-booked-attendees', 'display_booked_attendees' );

/** @return never  */
function display_booked_attendees() {
    global $wpdb;
    error_log("made it to the ajax request");
	if ( isset($_POST)) {
		$dateStart = $_POST['dateStart'];
        $dateEnd = $_POST['dateEnd'];
        $services = $_POST['service']; // an array
        $modelEmail = $_POST['modelEmail']; //a string
        $appTimes = $_POST['startTimes']; // get my array of start times in order from top to bottom oh yeah...
        //go through the times and change them to the correct format for database
        //change the string to formatted date to use in query oh yeah looking for yyyy-mm-dateEnd
        $objStart = date_create($dateStart);
        $formatStart = date_format($objStart, "Y-m-d");
        $objEnd = date_create($dateEnd);
        $formatEnd = date_format($objEnd, "Y-m-d");
        error_log("formatted Start date: " . $formatStart);
        error_log("formatted End date: " . $formatEnd);
        $result = array();
        // hard coding the service names and id's
        $services = array("No Minimum IG Live" => 2,
                          "10k+ IG Live" => 3,
                          "IG Live with @yourbestinsta" => 4,
                          "IG Live with @onaartist" => 5);
        // now have to iterate through the array of services and query each one to get the users in
        //$serviceId = $services[$servName];
        //error_log("the serviceId: " . $serviceId);

		$sql = $wpdb->prepare("select books.customFields as SocialTags, apps.bookingStart from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id where apps.bookingStart between %s and %s order by bookingStart;", $formatStart, $formatEnd);
		$result = $wpdb->get_results($sql);

        error_log("came back from sql query");
		echo json_encode($result);
        error_log("echoed the json encoded query results...");
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