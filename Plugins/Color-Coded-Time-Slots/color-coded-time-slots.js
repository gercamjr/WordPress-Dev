var jq = jQuery.noConflict();
jq(document).ready(function() {
//add the popup div
//var popupText = '<div id="my-pop-up">	<ul id="my-hover">Models signed up: <br />	</ul>	</div>';
//jq("body").append(popupText);
var prevService = "";
var servName = "";
var moveLeft = 20;
var datArr = [];
var month, year, bookingStart = "";
var moveDown = 10;
//got to wait for the booking stuff to load oh si
setTimeout(
    function() {
        //do something special
        // get info on first load
        // get the month and year

        //get the service name from the h2 element after the form loads of course
        //var observer = new MutationObserver(changeThemColors);
        servName = jq("#am-service-booking > div > div.am-service > div.am-service-header > div.am-service-data > div.am-service-title > h2").text().trim();
        console.log("ready! in what service are we booking? " + servName);

        prevService = servName;
        datArr = jq("div.c-title").text().split(" ");
        month = datArr[16];
        year = datArr[17].substring(0, 4);
        console.log(year);
        console.log(month);
        // turn month name into its corresponding MM format number
        bookingStart = findBookingStart(month, year);
        console.log("the bookingStart month and year: " + bookingStart);
        var day = "";
        var prevDayPicked = "";
        jq("#am-calendar-picker > div > div.c-day-content-wrapper > div ").on('mouseup', function(e) {
            clearTimeSlots();
            datArr = jq("div.c-title").text().split(" ");
            console.log("a single day was picked");
            month = datArr[16];
            year = datArr[17].substring(0, 4);
            bookingStart = findBookingStart(month, year);
            console.log("the bookingStart month and year: " + bookingStart);
            bookingStart = bookingStart.substring(0, 8);

            //logic for the first time a day is picked...
            day = jq(e.target).text().replace(/[^0-9]/g, '');
            console.log("day=" + day);

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
                    //createPopUp(response.modelTags);

                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                    console.log("text status: " + textStatus);
                    console.log("errorThrown: " + errorThrown)
                }
            });

        });
        jq(".am-service").on('click', function(e) {
            datArr = jq("div.c-title").text().split(" ");
            month = datArr[16];
            year = datArr[17].substring(0, 4);
            console.log(year);
            console.log(month);
            // turn month name into its corresponding MM format number
            bookingStart = findBookingStart(month, year);
            console.log("the bookingStart month and year: " + bookingStart);
            jq("#am-calendar-picker > div > div.c-day-content-wrapper > div ").on('mouseup', function(e) {
                clearTimeSlots();
                datArr = jq("div.c-title").text().split(" ");
                console.log("a single day was picked");
                month = datArr[16];
                year = datArr[17].substring(0, 4);
                bookingStart = findBookingStart(month, year);
                console.log("the bookingStart month and year: " + bookingStart);
                bookingStart = bookingStart.substring(0, 8);
                console.log("the edited bookingStart: " + bookingStart);

                //logic for the first time a day is picked...
                day = jq(e.target).text().replace(/[^0-9]/g, '');
                if (day.length == 1) {
                    day = "0" + day;
                }
                console.log("day=" + day);

                prevDayPicked = day;
                //console.log("prevDayPicked: " + prevDayPicked);
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
                        //createPopUp(response.modelTags);

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                        console.log("text status: " + textStatus);
                        console.log("errorThrown: " + errorThrown)
                    }
                });

            });


        });

        //add an event listener for mouser hovers
        jq('label.myHoverTrigger').hover(function(e) {
                datArr = jq("div.c-title").text().split(" ");
                month = datArr[16];
                year = datArr[17].substring(0, 4);
                bookingStart = findBookingStart(month, year);
                day = jq(e.target).text().replace(/[^0-9]/g, '');
                if (day.length == 1) {
                    day = "0" + day;
                }
                console.log("day=" + day);

                prevDayPicked = day;
                //console.log("prevDayPicked: " + prevDayPicked);
                bookingStart = bookingStart.concat(day);
                var left = e.pageX - 150;
                var top = e.pageY - 100;
                var target = e.target;
                var bookingTime = target.textContent.trim();
                var currentModel, telegramTag, time_slot = "";
                var timez = Intl.DateTimeFormat().resolvedOptions().timeZone; //guess at the user's timezone
                console.log("toggling the popup for booking time: " + bookingTime);
                //jq("div#my-pop-up").css({ left: left });
                jq("div#my-pop-up").css("left", left);
                jq("div#my-pop-up").css("top", top);

                jq('div#my-pop-up').css("display", "inline");
                jq("div#my-pop-up").css("position", "absolute");
                nonce = jq(this).attr("data-nonce");
                jq.ajax({
                    type: "POST",
                    dataType: "json",
                    url: myAjax.ajaxurl,
                    data: {
                        action: "find-popup-models",
                        dateSelected: bookingStart,
                        serviceName: servName,
                        nonce: nonce
                    },
                    success: function(response) {
                        console.log("we are in the callback");
                        //console.log(JSON.stringify(response));
                        //here comes the fun! find the time slots with appointments in the DOM and change their background oh yeah!
                        changeBgColors(response);
                        //createPopUp(response.modelTags);

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                        console.log("text status: " + textStatus);
                        console.log("errorThrown: " + errorThrown)
                    }
                });
                for (var i = 0; i < data.length; i++) {
                    //$dt = new DateTime($appointmentDateTime, new DateTimeZone($timeZone));
                    console.log("the date we are going through: " + data[i].bookingStart);
                    var newStr = data[i].bookingStart;
                    //change the date from db to the user's timezone, currently dates are being stored in UTC time zone
                    newStr = moment.tz(newStr, "UTC");
                    userTz = newStr.clone().tz(timez).format('YYYY-MM-DD HH:mm:ss');
                    console.log("bookingStart in user's timezone: " + userTz);
                    time_slot = userTz.substring(11, 16);
                    time_slot = moment(time_slot, 'HH:mm').format('hh:mm a');
                    console.log("the time slot we got: " + time_slot);
                    if (time_slot == bookingTime) {
                        currentModel = data[i].customFields; //get the social media tags of the model we is iterating through for an appointment
                        telegramTag = extractTelegram(currentModel);
                        //find the time slot and change the bg color, we is almost there
                        console.log("the telegram tag being inserted: " + telegramTag);
                        //add the li for the current model
                        jq("ul#my-hover").append("<li>" + telegramTag + "</li>");
                    }
                    // we made it
                }


            },
            function(e) {
                jq("ul#my-hover > li").remove();
                jq('div#my-pop-up').css("display", "none");
            });

        function extractTelegram(currentModel) {
            let socialMediaTags = currentModel;
            // console.log(socialMediaTags);
            socialMediaTags = socialMediaTags.replace(/\"/g, ''); // get this; "1:label:Instagram:,value:anothertest,type:text,2:label:Telegram:,value:anothertest,type:text"
            // console.log(socialMediaTags);
            socialMediaTags = socialMediaTags.split(":"); // get this an array, now need to grab the instagram string which is [4] and the telegram which is [9]
            socialIG = socialMediaTags[4].substr(0, socialMediaTags[4].indexOf(',')); //will get just the tag by itself
            socialIG = socialIG.replace(/\\/g, ''); //remove that backslash
            socialTelegram = socialMediaTags[9].substr(0, socialMediaTags[9].indexOf(',')); //will get just the tag by itself alright!!!!!
            return socialTelegram;
        }

    });



//bookingStart = bookingStart.substring(0, 8);
// lets change the colors now
function changeBgColors(response) {
    //access the bookCount with data->bookCount
    //access the models with data->modelTags
    //value key for the colors
    console.log(response);
    var colors = { "1": "#48E2AB", "2": "#F98484", "3": "#7470FF" };
    var bookLength = response.bookCount.length;
    var time_slot, attendees, telegramTag = '';
    var timez = Intl.DateTimeFormat().resolvedOptions().timeZone; //guess at the user's timezone
    for (var i = 0; i < bookLength; i++) {
        //$dt = new DateTime($appointmentDateTime, new DateTimeZone($timeZone));
        console.log("the date we are going through: " + response.bookCount[i].bookingStart);
        var newStr = response.bookCount[i].bookingStart;
        //change the date from db to the user's timezone, currently dates are being stored in UTC time zone
        newStr = moment.tz(newStr, "UTC");
        userTz = newStr.clone().tz(timez).format('YYYY-MM-DD HH:mm:ss');
        console.log("bookingStart in user's timezone: " + userTz);
        time_slot = userTz.substring(11, 16);
        console.log("the time slot we got: " + time_slot);
        attendees = response.bookCount[i].booked; //get the number of models booked for the specific time slot we are iterating through
        //telegramTag = extractTelegram(response[i].customFields);
        //find the time slot and change the bg color, we is almost there
        console.log("the color being used: " + colors[attendees]);
        jq(':input[value="' + time_slot + '"]').closest("label").css('background-color', '' + colors[attendees]);
        jq(':input[value="' + time_slot + '"]').closest("label").addClass("myHoverTrigger");

        console.log("supposedly changed the background color");
        // we made it
    }

}

function clearTimeSlots() {
    console.log("clearing the timeslots");
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


}, 3500);

});