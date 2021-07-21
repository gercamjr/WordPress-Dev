<?php

/**
 * Plugin Name: Display Booked Attendees - Amelia
 * Plugin URI: https://github.com/gercamjr/WordPress-Dev
 * Description: This plugin will display customers who have booked an appointment at a given time.
 * Version: 1.0.1
 * Author: Gerardo Camorlinga Jr
 * Author URI: http://github.com/gercamjr
 * License: GPL2
 */
// Fires after WordPress has finished loading, but before any headers are sent.
//Add admin page to the menu

function add_admin_page()
{
    // add top level menu page
    add_menu_page(
        'Custom Admin - Amelia Appointments', //Page Title
        'Custom Admin - Amelia Appointments', //Menu Title
        'manage_options', //Capability
        'custom_admin_amelia_appointments', //Page slug
        'showAdminPage', //Callback to print html
        'dashicons-groups',
        6
    );
}
add_action('admin_menu', 'add_admin_page');

function showAdminPage()
{
    global $wpdb;
?>
    <script type="text/javascript">
        var jq = jQuery.noConflict();
        jq(document).ready(function($) {
            $('#customAdminView').dataTable();
            console.log("made it to the document handler");
        });
    </script>
<?php
    echo "<h1>View Amelia Appointments (WORK IN PROGRESS)</h1>";

    $arr = $wpdb->get_results("select apps.bookingStart as AppointmentTime, serv.Name as Service, books.customFields as SocialMediaTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart between '2021-07-14' and '2021-08-12' and apps.status = 'approved' order by bookingStart;");
    //$arr = $wpdb->get_results($sql);

    echo '<div id="dt_example"><div id="container"><form><div id="demo">';
    echo '<table cellpadding="0" cellspacing="0" border="0" class="display" id="customAdminView"><thead><tr>';

    function formatNYCTime($theTime)
    {
        $dtN = new DateTime($theTime, new DateTimeZone("UTC"));
        $dtN->setTimezone(new DateTimeZone('America/New_York'));
        return $dtN->format("M d,Y h:i a");
    }

    function extractSocialTags($theTag)
    { //{"1":{"label":"Instagram:","value":"@lilshawtygem","type":"text"},"2":{"label":"Telegram:","value":"@shawtysupreme","type":"text"}}
        error_log("the tagstring we are working with: " . $theTag);
        $theLabel = explode('value":"', $theTag);
        $igTag = strtok($theLabel[1], '"');
        $igTag = str_replace('\\', '', $igTag);


        $telegramTag = str_replace('"', "", $theLabel[2]); //
        $telegramTag = substr($telegramTag, 0, -12);
        $theTag = $telegramTag . ' ' . $igTag;
        error_log("the tag we extraced: " . $theTag);
        return $theTag;
    }

    foreach ($arr[0] as $k => $v) {
        echo "<td>" . $k . "</td>";
    }

    echo '</tr></thead><tbody>';

    foreach ($arr as $i => $j) {
        echo "<tr>";
        foreach ($arr[$i] as $k => $v) {
            if ($k == "AppointmentTime") {
                error_log("the v to format for nyctime: " . $v);
                $v = formatNYCTime($v);
                error_log("the v formatted: " . $v);
            } else if ($k == "SocialMediaTags") {
                error_log("extracting the social media tags...");
                $v = extractSocialTags($v);
            }
            echo "<td>" . $v . "</td>";
        }
        echo "</tr>";
    }

    echo '</tbody></table>';
    echo '</div></form></div></div>';
}



function register_my_plugin_scripts()
{
    wp_register_style('showAdminPage', plugins_url('Display-Booked-Attendees/pluginpage.css'));
    wp_register_script('showAdminPage', plugins_url('Display-Booked-Attendees/pluginpage.js'));
}
add_action('admin_enqueue_scripts', 'register_my_plugin_scripts');

function load_my_plugin_scripts($hook)
{
    if ($hook != 'toplevel_page_custom_admin_amelia_appointments') {
        return;
    }
    wp_enqueue_style('showAdminPage');
    wp_enqueue_script('showAdminPage', array('jquery'));
    wp_enqueue_script('jquery');
}
add_action('admin_enqueue_scripts', 'load_my_plugin_scripts');

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

        $sql = $wpdb->prepare("select apps.bookingStart, apps.status, apps.serviceId, books.customFields as SocialTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart = %s  and apps.serviceId = %d and (apps.status = 'approved' or apps.status='pending')  order by bookingStart;", $appTime, $service);
        $result = $wpdb->get_results($sql);
        //populate with the social media tags if results are not empty

        if (count($result) > 0) {
            while ($row = mysqli_fetch_array($result)) {
                error_log($row['customFields']);
            }
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