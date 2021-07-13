var jq = jQuery.noConflict();
jq(document).ready(function() {
    //only do this if we are on the correct url which is /lives/schedule/
    if (window.location.pathname === "/lives/schedule/") {
        console.log("ready!");
        // get info on first load
        var userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times = gatherAppointmentData();
        sendRequest(userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times);

        // ajax request to get the info needed after value has been added to the date range picker
        jq$("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input, #am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-content > span > div.am-cabinet-dashboard-appointments > span > div > div.am-cabinet-filter.el-row > div > div > div > div > div > input").on("input", function() {
            //userTZ = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input").val(); // get the new value if time zone is changed
            userTZ,
            dateRangeStart,
            dateRangeEnd,
            modelEmail,
            services,
            appDates,
            times = gatherAppointmentData();
            sendRequest(userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times);

        });

        function gatherAppointmentData() {
            var timeZone = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input").attr("placeholder"); //get the time zone that is being shown
            var dateRange = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-content > span > div.am-cabinet-dashboard-appointments > span > div > div.am-cabinet-filter.el-row > div > div > div > div > div > input").val();
            var dateRangeS = dateRange.substring(0, dateRange.indexOf('-')).trim(); // we get a string like July 4, 2021
            var dateRangeE = dateRange.substring(dateRange.indexOf('-')).trim().substring(2);

            var userEmail = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-dashboard-user-data > div.am-cabinet-user > div > span").text().trim();
            console.log("the model's email: " + modelEmail);

            var servs = jq("div.el-col.el-col-24.el-col-lg-16 > div > div:nth-child(2) > h4").text().trim(); //this will actuall pull all the services listed on the page, need to split them up and go one by one

            //getting the appointment times in userTZ date
            var appTimes = jq("div.el-col.el-col-24.el-col-sm-8.el-col-lg-6 > h4").text().match(/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/gm);

            // sample dates we get: "July 15, 2021\n                \n                  July 17, 2021\n                \n                  July 23, 2021\n                \n                  July 24, 2021\n                \n                  July 27, 2021\n"
            // need to split and store in array oh yes with pretty text just the dates themselves, no spaces no \n's
            var appsDates = jQuery("div.am-cabinet-list-day-title > div > div").text().trim();
            appsDates = appDates.split("\n");
            for (var i = 0; i < appsDates.length; i++) {
                appsDates[i] = appsDates[i].trim();
                if (!appsDates[i]) {
                    console.log("Removing the empty date");
                    appsDates.splice(i, 1);
                }
            }

            services = services[0];
            //"No Minimum IG Live\n                        \n                          10k+ IG Live\n                        \n                          10k+ IG Live\n                        \n                          10k+ IG Live\n                        \n                          IG Live with @yourbestinsta\n                        \n                          No Minimum IG Live\n                        \n                          IG Live with @onaartist"
            services = services.split('\n');
            for (var i = 0; i < services.length; i++) {
                services[i] = services[i].trim();
                console.log("the trimmed string: " + services[i]);
                if (!services[i]) {
                    console.log("removing the empty string");
                    services.splice(i, 1); //remove the element if it is an empty string
                }
            }

            return timeZone, dateRangeS, dateRangeE, userEmail, servs, appsDates, appTimes;
        }

        function sendRequest(userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times) {
            var nonce = jq(this).attr("data-nonce");
            jq.ajax({
                type: "POST",
                dataType: "json",
                url: myAjax.ajaxurl,
                data: {
                    action: "display-booked-attendees",
                    dateStart: dateRangeStart,
                    dateEnd: dateRangeEnd,
                    appDates: appDates,
                    userTZ: userTZ,
                    service: services,
                    modelEmail: modelEmail,
                    startTimes: times,
                    nonce: nonce

                },
                success: function(response) {
                    console.log("ajax request was a success!");
                    displayAttendees(response);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                    console.log("text status: " + textStatus);
                    console.log("errorThrown: " + errorThrown)
                }

            });

            function displayAttendees(data) {
                console.log("made it to displayAttendees function");

            }
        }
    }
});