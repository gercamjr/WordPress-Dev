<?php

/*
Plugin Name: Display Appointment Attendees
Plugin URI: https://github.com/gercamjr/WordPress-Dev/tree/main/Plugins/Color-Coded-Time-Slots
Description: This plugin displays the attendees for a given appointment in the Amelia Appointments and Events Booking plugin.
Version: 1.1.0
Author: Gerardo Camorlinga Jr
Author URI: wp.geracomdev.com
Text Domain: Color-Coded-Time-Slots
Domain Path:
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

This plugin is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/

You can contact us at gercamjr.dev@gmail.com

*/


// Fires after WordPress has finished loading
add_action('wp_enqueue_scripts', 'script_enqueuer_colors');
add_action('wp_ajax_color-coded-time-slots', 'change_Colors');
add_action('wp_ajax_nopriv_color-coded-time-slots', 'change_Colors');

add_action('wp_ajax_find_popup_models', 'find_popup_models');
add_action('wp_ajax_nopriv_find_popup_models', 'find_popup_models');

/** @return never  */
function change_Colors()
{
    global $wpdb;
    error_log("made it to the ajax request");
    if (isset($_POST)) {
        error_log("post is set");
        $wild = '%';
        $bookingStart = $_POST['dateStart'];
        $bookingEnd = $_POST['dateEnd'];
        $servName = $_POST['serviceName'];
        error_log("bookingDay looks like this: " . $bookingStart);
        error_log("serviceName looks like: " . $servName);
        $result = array();
        // hard coding the service names and id's
        $servicesInDB = "Select name, id from wp_amelia_services;";
        $servResult = $wpdb->get_results($servicesInDB);
        foreach ($servResult as $key => $row) {

            error_log("name: " . $row->name . " id: " . $row->id);
            // each column in your row will be accessible like this
            $services[$row->name] = $row->id;
        }
        $serviceId = $services[$servName];
        error_log("the serviceId: " . $serviceId);
        // need to query a range of dates oh yeas, the results will include full slots which actually don't appear on the booking calendar, so need to weed those
        $sql = $wpdb->prepare("select apps.bookingStart, COUNT(*) as booked from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id where apps.bookingStart between %s and %s and (books.status = 'approved' or books.status ='pending') and apps.serviceId = %d GROUP BY books.appointmentId order by apps.bookingStart;", $bookingStart, $bookingEnd, $serviceId);
        $result = $wpdb->get_results($sql);
        $sql2 = $wpdb->prepare("select apps.bookingStart, books.customFields from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id where apps.bookingStart between %s and %s and (books.status = 'approved' or books.status ='pending') and apps.serviceId = %d order by apps.bookingStart;", $bookingStart, $bookingEnd, $serviceId);
        $result2 = $wpdb->get_results($sql2);

        $data1 = array();
        $data2 = array();
        foreach ($result as $row) {
            $data1[] = $row;
        }
        $data['bookCount'] = $data1;
        foreach ($result2 as $row) {
            $data2[] = $row;
        }
        $data['modelTags'] = $data2;

        //error_log("came back from sql query: " . print_r($result));
        echo (json_encode($data));
        //access the bookCount with data->bookCount
        //access the models with data->modelTags
        error_log("echoed the json encoded query results...");
    }
    die();
}

function find_popup_models()
{
    global $wpdb;
    error_log("made it to the ajax request");
    if (isset($_POST)) {
        error_log("post is set");
        $bookingDay = $_POST['bookingFullTime'];
        $servName = $_POST['serviceName'];
        error_log("bookingDay looks like this: " . $bookingDay);
        error_log("serviceName looks like: " . $servName);
        $result = array();
        $servicesInDB = "Select name, id from wp_amelia_services;";
        $servResult = $wpdb->get_results($servicesInDB);

        foreach ($servResult as $key => $row) {
            // each column in your row will be accessible like this
            $services[$row->name] = $row->id;
        }
        /** hard coding the service names and id's
         *$services = array(
         *    "No Minimum IG Live" => 2,
         *    "10k+ IG Live" => 3,
         *    "IG Live with @yourbestinsta" => 4,
         *    "GG Live" => 5
         *); */
        $serviceId = $services[$servName];
        error_log("the serviceId: " . $serviceId);
        $sql = $wpdb->prepare("select books.customFields as SocialTags, books.info as Names from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart = %s  and apps.serviceId = %d and (books.status = 'approved' or books.status='pending')  order by bookingStart;", $bookingDay, $serviceId);
        $result = $wpdb->get_results($sql);
        $socialResults = array();
        if (count($result) > 0) {
            error_log("we got some results...");
            foreach ($result as $social) {
                error_log("the social tag being added to array: " . $social->SocialTags);
                $socialResults[] = array(
                    $social->SocialTags,
                    $social->Names
                );
            }
        }
        //error_log("came back from sql query: " . print_r($result));
        echo (json_encode($socialResults));
        //access the bookCount with data->bookCount
        //access the models with data->modelTags
        error_log("echoed the json encoded query results...");
    }
    die();
}

/** @return void  */
function script_enqueuer_colors($hook)
{
    // Register the JS file with a unique handle, file location, and an array of dependencies
    wp_register_script("color-coded-time-slots", plugin_dir_url(__FILE__) . 'color-coded-time-slots.js', array('jquery'));
    wp_register_script("color-coded-moment", plugin_dir_url(__FILE__) . 'moment.js');
    wp_register_script("color-coded-moment-timezone", plugin_dir_url(__FILE__) . 'moment-timezone-with-data.js');
    wp_register_script("observations", plugin_dir_url(__FILE__) . 'jquery-observe.js');
    //wp_register_script("jquery-mobile", 'http://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.5/jquery.mobile.min.js');
    //wp_register_style('jquery-mobile-css', 'http://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.5/jquery.mobile.min.css'); 

    // localize the script to your domain name, so that you can reference the url to admin-ajax.php file easily
    wp_localize_script('color-coded-time-slots', 'myAjax', array('ajaxurl' => admin_url('admin-ajax.php')));

    // enqueue jQuery library and the script you registered above
    wp_enqueue_script('jquery');
    wp_enqueue_script('color-coded-time-slots');
    wp_enqueue_script("color-coded-moment");
    wp_enqueue_script("color-coded-moment-timezone");
    wp_enqueue_script("observations");
    //wp_enqueue_script("jquery-mobile");
    //wp_enqueue_style('jquery-mobile-css');

}
