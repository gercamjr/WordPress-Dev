<?php

global $wpdb;

echo "<h1>View Amelia Appointments</h1>";

$sql = $wpdb->prepare("select apps.bookStart as AppointmentTime, books.customFields as SocialMediaTagas, apps.Model_Social_Tags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart between '2021-07-14%%' order by bookingStart;");
$result = $wpdb->get_results($sql);

echo '<div id="displayBooked"><div id="container"><div id="showAppointments"';
echo '<table cellpadding="0" cellspacing="0" border="0" class="display" id="test"><thead><tr>';

foreach ($arr[0] as $k => $v) {
    echo "<td>" . $k . "</td>";
}

echo '</tr></thead></tbody>';

foreach ($arr as $i = $j) {
    echo "<tr>";
    foreach ($arr[$i] as $k => $v) {
        echo "<td>" . $v . "</td>";
    }
    echo "</tr>";
}

echo '</tbody></table>';
echo '</div></div></div>';
?>

<script type="text/javascript">
    jQuery(document).ready(function($) {
        $('#example').dataTable();
    });
</script>