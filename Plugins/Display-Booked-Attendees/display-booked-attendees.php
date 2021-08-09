<?php

/*
Plugin Name: Display Attendees in Schedule
Plugin URI: https://github.com/gercamjr/WordPress-Dev/tree/main/Plugins/Display-Booked-Attendees
Description: This plugin lists the attendees in the user's schedule of appointments.
Version: 1.1.0
Author: Gerardo Camorlinga Jr
Author URI: wp.geracomdev.com
Text Domain: Display-Booked-Attendees
Domain Path:
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

This plugin is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/

You can contact us at gercamjr.dev@gmail.com



*/
// Fires after WordPress has finished loading, but before any headers are sent.
//Add admin page to the menu


//add_action('admin_menu', 'add_admin_page');

add_action('init', 'script_enqueuer');
add_action('wp_ajax_display-booked-attendees', 'display_booked_attendees');
add_action('wp_ajax_nopriv_display-booked-attendees', 'display_booked_attendees');

/** @return never  */
function display_booked_attendees()
{
    global $wpdb;
    error_log("made it to the ajax request");
    if (isset($_POST)) {
        $appTime = $_POST['appTime'];
        $service = $_POST['service'];
        error_log("going to search for the following appointment: ");
        error_log('date and time: ' . $appTime);
        error_log('service: ' . $service);

        $servicesInDB = "Select name, id from wp_amelia_services;";
        $servResult = $wpdb->get_results($servicesInDB);

        foreach($servResult as $key => $row) {
            // each column in your row will be accessible like this
            $services[$row->name] = $row->id;
        }
        $serviceID = $services[$service];

        $sql = $wpdb->prepare("select apps.bookingStart, books.status, apps.serviceId, books.customFields as SocialTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart = %s  and apps.serviceId = %d and (books.status = 'approved' or books.status='pending')  order by bookingStart;", $appTime, $serviceID);
        $result = $wpdb->get_results($sql);
        //populate with the social media tags if results are not empty

        if (count($result) > 0) {

            foreach ($result as $social) {
                error_log("the social tag being added to array: " . $social->SocialTags);
                $socialResults[] = array(
                    $social->SocialTags
                );
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
?>