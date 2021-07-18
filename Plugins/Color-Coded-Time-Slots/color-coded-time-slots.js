var jq = jQuery.noConflict();
jq(document).ready(function() {




    // get the month and year

    //get the service name from the h2 element after the form loads of course
    var observer = new MutationSummary({
        callback: colorCodeTime,
        queries: [{
            element: 'div#am-step-booking-catalog0-calendar'
        }]
    });

    function colorCodeTime(summaries) {
        var calendarSummary = summaries[0];
        calendarSummary.added.forEach(function() {
            var prevService = "";
            var servName = "";
            var moveLeft = 20;
            var moveDown = 10;
            console.log("ready!");
            servName = jq("#am-service-booking > div > div.am-service > div.am-service-header > div.am-service-data > div.am-service-title > h2").text().trim();


            prevService = servName;
            console.log("handled the service being clicked for 1st time quite well. serviceName: " + servName);
            var datArr = jq("div.c-title").text().split(" ");
            var month = datArr[16];
            var year = datArr[17].substring(0, 4);
            console.log(year);
            console.log(month);
            // turn month name into its corresponding MM format number
            var bookingStart = findBookingStart(month, year);
            console.log("the bookingStart month and year: " + bookingStart);
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
                            serviceName: servName,
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
                } else if (prevDayPicked !== day) { //user clicked on a different day so we need to clear the time Slots
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
                            serviceName: servName,
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

            //clicked on a different service within the same booking
            prevService = servName;
            console.log("handled the service being clicked quite well. serviceName: " + servName);
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
                            serviceName: servName,
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
                } else if (prevDayPicked !== day) { //user clicked on a different day so we need to clear the time Slots
                    prevDayPicked = day;
                    bookingStart = bookingStart.concat(day);
                    console.log("picked a different day so we need to clear the time slots");
                    clearTimeSlots();
                    nonce = jq(this).attr("data-nonce");
                    jq.ajax({
                        type: "POST",
                        dataType: "json",
                        url: myAjax.ajaxurl,
                        data: {
                            action: "color-coded-time-slots",
                            dateSelected: bookingStart,
                            serviceName: servName,
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

                } else if (prevDayPicked === day) {
                    //clicked on the same day, don't need to do anything
                }

            });




            //bookingStart = bookingStart.substring(0, 8);
            // lets change the colors now
            function changeBgColors(response) {
                //value key for the colors
                console.log(response);
                var colors = { "1": "#48E2AB", "2": "#F98484", "3": "#7470FF" };
                var time_slot, attendees, telegramTag = '';
                var timez = Intl.DateTimeFormat().resolvedOptions().timeZone; //guess at the user's timezone
                for (var i = 0; i < response.length; i++) {
                    //$dt = new DateTime($appointmentDateTime, new DateTimeZone($timeZone));
                    console.log("the date we are going through: " + response[i].bookingStart);
                    var newStr = response[i].bookingStart;
                    //change the date from db to the user's timezone, currently dates are being stored in UTC time zone
                    newStr = moment.tz(newStr, "UTC");
                    userTz = newStr.clone().tz(timez).format('YYYY-MM-DD HH:mm:ss');
                    console.log("bookingStart in user's timezone: " + userTz);
                    time_slot = userTz.substring(11, 16);
                    console.log("the time slot we got: " + time_slot);
                    attendees = response[i].booked; //get the number of models booked for the specific time slot we are iterating through
                    //telegramTag = extractTelegram(response[i].customFields);
                    //find the time slot and change the bg color, we is almost there
                    console.log("the color being used: " + colors[attendees]);
                    jq(':input[value="' + time_slot + '"]').closest("label").css('background-color', '' + colors[attendees]);
                    jq(':input[value="' + time_slot + '"]').closest("label").addClass("myHoverTrigger");

                    console.log("supposedly changed the background color");
                    // we made it
                }
                //createPopUp(response);
            }

            function clearTimeSlots() {
                jq("label.el-radio-button.el-radio-button--medium").css("background", "transparent");
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

            function createPopUp(data) {
                jq('label.myHoverTrigger').hover(function(e) {
                    var left = e.pageX;
                    var top = e.pageY - 140;
                    console.log("toggling the popup: ");
                    //jq("div#my-pop-up").css({ left: left });
                    jq("div#my-pop-up").css({ top: top });
                    jq('div#my-pop-up').css("display", "block");

                    jq("ul#my-hover").append("<li>@model1</li>");

                }, function(e) {
                    jq("ul#my-hover > li").remove();
                    jq('div#my-pop-up').css("display", "none");
                });
            }
        });
    }



});