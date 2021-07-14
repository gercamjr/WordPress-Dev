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
//Add admin page to the menu
add_action( 'admin_menu', 'add_admin_page');
function add_admin_page() {
  // add top level menu page
  add_menu_page(
    'Custom Admin - Amelia Appointments', //Page Title
    'Custom Admin - Amelia Appointments', //Menu Title
    'manage_options', //Capability
    'custom_admin_amelia_appointments', //Page slug
    '/Display-Booked-Attendees/adminpage.php', //Callback to print html
    'dashicons-groups',
    6
  );
}
function my_enqueue($hook) {
    //only for this special admin page to the
    if ('Display-Booked-Attendees/adminpage.php' != $hook)
        return;

    wp_register_style('adminpage', plugins_url('Display-Booked-Attendees/pluginpage.css'));
    wp_enqueue_style('adminpage');

    wp_enqueue_script('pluginscript', plugins_url('pluginpage.js', __FILE__), array('jquery'));

}



add_action('init', 'script_enqueuer');
add_action('wp_ajax_display-booked-attendees', 'display_booked_attendees');
add_action('wp_ajax_nopriv_display-booked-attendees', 'display_booked_attendees');

/** @return never  */
function display_booked_attendees()
{
    global $wpdb;
    error_log("made it to the ajax request");
    if (isset($_POST)) {
        $dateStart = $_POST['dateStart'];
        $dateEnd = $_POST['dateEnd'];
        $services = $_POST['service']; // an array
        $modelEmail = $_POST['modelEmail']; //a string
        $appTimes = $_POST['startTimes']; // get my array of start times in order from top to bottom oh yeah...
        $timeZone = $_POST['userTZ']; //
        $appDates = $_POST['appDates'];

        // services and apptimes should have equal amount of elements in their array, they go hand in hand and are in order from top of page to the bottom of the
        // appDates gives us the sections and those are in order from top to bottom
        // so logic first try is to iterate through the appdates and find the social media tags for a specific date

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
        $serviceMap = array(
            "No Minimum IG Live" => 2,
            "10k+ IG Live" => 3,
            "IG Live with @yourbestinsta" => 4,
            "IG Live with @onaartist" => 5
        );
        // now have to iterate through the array of services and query each one to get the users in
        //$serviceId = $services[$servName];
        //error_log("the serviceId: " . $serviceId);
        $socialResults = array();
        $dateCount = count($appDates);
        $timesCount = count($appTimes);
        
        //should probably check this on the jquery side but just in case we don't have any dates or appointments set then don't need to do anything
        if ($dateCount > 0 && $timesCount > 0) {
            error_log("total number of dates to pull: " . $dateCount);
            error_log("total number of appointments to pull: " . $timesCount);
            for ($i = 0; $i < $dateCount; $i++) {      
                for ($j = 0; $j < $timesCount; $j++) {
                    // first of all convert to UTC time since that is what is stored in the DB
                    $appointmentDateTime = $appDates[$i] . " " . $appTimes[$j];
                    $dt = new DateTime($appointmentDateTime, new DateTimeZone($timeZone));
                    $dt->setTimezone(new DateTimeZone('UTC'));
                    $appointmentDateTime = $dt->format('Y-m-d H:i:s');
                    //query the db
                     
                    //populate with the social media tags if results are not empty
                    if (count($result) > 0) {
                        foreach ($result as $social) {
                            $socialResults[] = array(
                                $appTimes[$j] => array(
                                    $social->SocialTags
                                )
                            );
                        }
                    }
                }
            }
        }
        //error_log("empty strings dang it");
        echo json_encode($socialResults);
        error_log("echoed the json encoded query results...");
    }
    die();
}

/** @return void  */
function script_enqueuer()
{

    // Register the JS file with a unique handle, file location, and an array of dependencies
    wp_register_script("display-booked-attendees", plugin_dir_url(__FILE__) . 'display-booked-attendees.js', array('jquery'));

    // localize the script to your domain name, so that you can reference the url to admin-ajax.php file easily
    wp_localize_script('display-booked-attendees', 'myAjax', array('ajaxurl' => admin_url('admin-ajax.php')));

    // enqueue jQuery library and the script you registered above
    wp_enqueue_script('jquery');
    wp_enqueue_script('display-booked-attendees');
}
