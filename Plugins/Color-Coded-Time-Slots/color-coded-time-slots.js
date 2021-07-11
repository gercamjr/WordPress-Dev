var jq = jQuery.noConflict();
jq(document).ready(function() {
    console.log("ready!");
    var prevService = "";
    var serviceName = "";
    // get the month and year
    jq("#amelia-app-booking0").click(function() {
        //get the service name from the h2 element after clicking
        serviceName = jq(".am-service-title > h2").text().trim();
        if (!prevService) { //first time anything has been clicked
            prevService = serviceName;
            console.log("handled the service being clicked quite well. serviceName: " + serviceName);
            var datArr = jq(".c-title").text().split(" ");
            var month = datArr[16];
            var year = datArr[17].substring(0, 4);
            console.log(year);
            console.log(month);

            // turn month name into its corresponding MM format number
            var bookingStart = findBookingStart(month, year);
            console.log("the bookingStart month and year" + bookingStart);
            var day = "";
            var prevDayPicked = "";
            //find out which day was picked 
            jq(".c-day-content").click(function() {
                bookingStart = bookingStart.substring(0, 8);
                console.log("handled the day being picked quite nicely...");
                //logic for the first time a day is picked...
                day = jq(this).text().replace(/[^0-9]/g, '');
                console.log("day=" + day);
                if (!prevDayPicked) {
                    prevDayPicked = day;
                    console.log("prevDayPicked: " + prevDayPicked);
                    bookingStart = bookingStart.concat(day);
                    //query the db looking for time slots with appointments and returning this array
                    //console.log(myAjax.ajaxurl);
                    //figure out how to do the nonce thing for security purposes
                    nonce = jq(this).attr("data-nonce");
                    jq.ajax({
                        type: "POST",
                        dataType: "json",
                        url: myAjax.ajaxurl,
                        data: {
                            action: "color-coded-time-slots",
                            dateSelected: bookingStart,
                            serviceName: serviceName,
                            nonce: nonce
                        },
                        success: function(response) {
                            console.log("we are in the callback");
                            //console.log(JSON.stringify(response));
                            //here comes the fun! find the time slots with appointments in the DOM and change their background oh yeah!
                            changeBgColors(response);
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                            console.log("text status: " + textStatus);
                            console.log("errorThrown: " + errorThrown)
                        }
                    });
                } else if (prevday !== day) { //user clicked on a different day so we need to clear the time Slots
                    prevDayPicked = day;
                    bookingStart = bookingStart.concat(day);
                    console.log("picked a different day so we need to clear the time slots");
                    //since we changed the day we need to put the time slots back to their original color
                    clearTimeSlots(day);
                    nonce = jq(this).attr("data-nonce");
                    jq.ajax({
                        type: "POST",
                        dataType: "json",
                        url: myAjax.ajaxurl,
                        data: {
                            action: "color-coded-time-slots",
                            dateSelected: bookingStart,
                            serviceName: serviceName,
                            nonce: nonce
                        },
                        success: function(response) {
                            console.log("we are in the callback");
                            //console.log(JSON.stringify(response));
                            //here comes the fun! find the time slots with appointments in the DOM and change their background oh yeah!
                            changeBgColors(response);
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                            console.log("text status: " + textStatus);
                            console.log("errorThrown: " + errorThrown)
                        }
                    });

                }

                console.log("exited the click handler");


                //clearing time slots

            });
        } else if (prevService !== serviceName) {
            prevService = serviceName;
            console.log("handled the service being clicked quite well. serviceName: " + serviceName);
            var datArr = jq(".c-title").text().split(" ");
            var month = datArr[16];
            var year = datArr[17].substring(0, 4);
            console.log(year);
            console.log(month);

            // turn month name into its corresponding MM format number
            var bookingStart = findBookingStart(month, year);
            console.log("the bookingStart month and year" + bookingStart);
            var day = "";
            var prevDayPicked = "";
            //find out which day was picked 
            jq(".c-day-content").click(function() {
                bookingStart = bookingStart.substring(0, 8);
                console.log("handled the day being picked quite nicely...");
                //logic for the first time a day is picked...
                day = jq(this).text().replace(/[^0-9]/g, '');
                console.log("day=" + day);
                if (!prevDayPicked) {
                    prevDayPicked = day;
                    console.log("prevDayPicked: " + prevDayPicked);
                    bookingStart = bookingStart.concat(day);
                    //query the db looking for time slots with appointments and returning this array
                    //var obj = { 'action': "retrieveAttendees", 'dateSelected': bookingStart };
                    //var postData = JSON.stringify(obj);
                    //console.log(postData);
                    console.log(myAjax.ajaxurl);
                    //figure out how to do the nonce thing for security purposes
                    nonce = jq(this).attr("data-nonce");
                    jq.ajax({
                        type: "POST",
                        dataType: "json",
                        url: myAjax.ajaxurl,
                        data: {
                            action: "color-coded-time-slots",
                            dateSelected: bookingStart,
                            serviceName: serviceName,
                            nonce: nonce
                        },
                        success: function(response) {
                            console.log("we are in the callback");
                            //console.log(JSON.stringify(response));
                            //here comes the fun! find the time slots with appointments in the DOM and change their background oh yeah!
                            changeBgColors(response);
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                            console.log("text status: " + textStatus);
                            console.log("errorThrown: " + errorThrown)
                        }
                    });
                } else if (prevday !== day) { //user clicked on a different day so we need to clear the time Slots
                    prevDayPicked = day;
                    bookingStart = bookingStart.concat(day);
                    console.log("picked a different day so we need to clear the time slots");
                    clearTimeSlots(day);

                }
            });

        }

    });
    //bookingStart = bookingStart.substring(0, 8);
    // lets change the colors now
    function changeBgColors(response) {
        var len = response.length;
        console.log("number of rows returned: " + len);
        var sno = 0;
        //value key for the colors
        var colors = { "1": "#48E2AB", "2": "#F98484", "3": "#7470FF" };
        for (var i = 0; i < len; i++) {
            var time_slot = response[i].bookingStart.substring(11, 16);
            var attendees = response[i].booked;
            //find the time slot and change the bg color, we is almost there
            console.log("the color being used: " + colors[attendees]);
            jq(':input[value="' + time_slot + '"]').closest("label").css('background-color', '' + colors[attendees]);
            console.log("supposedly changed the background color");
            // we made it
        }
    }

    function clearTimeSlots(day) {

    }

    function findBookingStart(month, year) {
        var months = {
            "January": "01",
            "February": "02",
            "March": "03",
            "April": "04",
            "May": "05",
            "June": "06",
            "July": "07",
            "August": "08",
            "September": "09",
            "October": "10",
            "November": "11",
            "December": "12"
        };
        var mm = months[month];
        var formattedDate = year.concat("-").concat(mm).concat("-");
        // should end up gettin something like "2021-04-"
        return formattedDate;
    }
});