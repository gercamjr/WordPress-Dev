var jq = jQuery.noConflict();
jq(document).ready(function() {
    //only do this if we are on the correct url which is /lives/schedule/
    if (window.location.pathname === "/lives/schedule/") {
        console.log("ready in the display-booked-attendees plugin!");
        var userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times = "";
        setTimeout(
            function() {
                //do something special
                // get info on first load
                var info = gatherAppointmentData();
                // return { done, dateRangeS, dateRangeE, userEmail, servs, appsDates, appTimes };
                userTZ = info.timeZone;
                dateRangeStart = info.dateRangeS;
                dateRangeEnd = info.dateRangeE;
                modelEmail = info.userEmail;
                services = info.servs;
                appDates = info.appsDates;
                times = info.appTimes;

                sendRequest(userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times);
            }, 4000);




        // ajax request to get the info needed after value has been added to the date range picker
        /*jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input, #am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-content > span > div.am-cabinet-dashboard-appointments > span > div > div.am-cabinet-filter.el-row > div > div > div > div > div > input").on("input", function() {
            console.log("handled the booking container being loaded nicely");
            //userTZ = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input").val(); // get the new value if time zone is changed
            var userTZ, dateRangeStart,
                dateRangeEnd,
                modelEmail,
                services,
                appDates,
                times = gatherAppointmentData();
            sendRequest(userTZ, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times);

        }); */

        function gatherAppointmentData() {
            var timeZone = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input").attr("placeholder"); //get the time zone that is being shown
            console.log("timeZOne grabbed: " + timeZone);
            var dateRange = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-content > span > div.am-cabinet-dashboard-appointments > span > div > div.am-cabinet-filter.el-row > div > div > div > div > div > input").val();
            console.log("dateRange grabbed: " + dateRange);
            var dateRangeS = dateRange.substring(0, dateRange.indexOf('-')).trim(); // we get a string like July 4, 2021
            var dateRangeE = dateRange.substring(dateRange.indexOf('-')).trim().substring(2);
            console.log("dateRange Start: " + dateRangeS);
            console.log("dateRange End: " + dateRangeE);

            var userEmail = jq("#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-dashboard-user-data > div.am-cabinet-user > div > span").text().trim();
            console.log("the model's email: " + userEmail);

            var servs = jq("div.el-col.el-col-24.el-col-lg-16 > div > div:nth-child(2) > h4").text().trim(); //this will actuall pull all the services listed on the page, need to split them up and go one by one

            //getting the appointment times in userTZ date
            var appTimes = jq("div.el-col.el-col-24.el-col-sm-8.el-col-lg-6 > h4").text().match(/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/gm);

            // sample dates we get: "July 15, 2021\n                \n                  July 17, 2021\n                \n                  July 23, 2021\n                \n                  July 24, 2021\n                \n                  July 27, 2021\n"
            // need to split and store in array oh yes with pretty text just the dates themselves, no spaces no \n's
            var appsDates = jQuery("div.am-cabinet-list-day-title > div > div").text().trim();
            appsDates = appsDates.split("\n");
            console.log("the appsDates: " + appsDates);
            console.log("the number of dates: " + appsDates.length);
            countD = appsDates.length;
            for (var i = 0; i < countD; i++) {
                appsDates[i] = appsDates[i].trim();
                if (!appsDates[i]) {
                    console.log("Removing the empty date");
                    appsDates.splice(i, 1);
                    countD = appsDates.length;
                    appsDates[i] = appsDates[i].trim();
                }
            }
            console.log("the finished appsDates results: " + appsDates);

            servs = jq("div.el-col.el-col-24.el-col-lg-16 > div > div:nth-child(2) > h4").text().trim();
            //"No Minimum IG Live\n                        \n                          10k+ IG Live\n                        \n                          10k+ IG Live\n                        \n                          10k+ IG Live\n                        \n                          IG Live with @yourbestinsta\n                        \n                          No Minimum IG Live\n                        \n                          IG Live with @onaartist"
            servs = servs.split('\n');
            countS = servs.length;
            for (var i = 0; i < countS; i++) {
                servs[i] = servs[i].trim();
                console.log("the trimmed string: " + servs[i]);
                if (!servs[i]) {
                    console.log("removing the empty string");
                    servs.splice(i, 1); //remove the element if it is an empty string
                    countS = servs.length;
                    servs[i] = servs[i].trim();
                }
            }
            console.log("the finished services results: " + servs);

            return { timeZone, dateRangeS, dateRangeE, userEmail, servs, appsDates, appTimes };
        }

        function sendRequest(userTz, dateRangeStart, dateRangeEnd, modelEmail, services, appDates, times) {
            console.log("made it to the ajax request \function");
            console.log("dateRangeStart = " + dateRangeStart);
            console.log("dateRangeEnd = " + dateRangeEnd);

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
                    userTZ: userTz,
                    service: services,
                    modelEmail: modelEmail,
                    startTimes: times,
                    nonce: nonce

                },
                success: function(response) {
                    console.log("ajax request was a success!");
                    displayAttendees(response, times, services);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                    console.log("text status: " + textStatus);
                    console.log("errorThrown: " + errorThrown)
                }

            });

            function displayAttendees(data, allTimes, servs) {
                //should have received an array of arrays that looks like this:
                //   data[date][time] = "{"1":{"label":"Instagram:","value":"starig","type":"text"},"2":{"label":"Telegram:","value":"startele","type":"text"}}"
                //
                //
                //
                console.log("made it to displayAttendees function!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                console.log(data);
                // adding in our custom html stuff to load in the modelsssssssssss
                jq('div[id^="el-collapse-content-"] > div > div > div > div').append("<div class='el-row'><ul class='am-data'>Models: </ul></div>");
                var $ulis = jQuery("div[id^='el-collapse-content-'] > div > div > div > div >div > ul"); //get all the new ul's we created so we can append to them one by one
                $ulis.attr('id', function(index) {
                    return 'ul' + index;
                });
                console.log("did we get allTimes? " + allTimes);
                var prevTime = "";
                var socialIG = "";
                var socialTelegram = "";
                var parentUL = 0;
                var nextUL = 0;
                var iteration_lim = servs.length;
                var iteration = 0;
                var prevServ, newServ = "";

                jq.each(data, function(index, obj) {
                    jq.each(obj, function(key, value) {
                        if (prevTime !== key) {

                            newServ = servs[iteration];
                            prevServ = newServ;

                            parentUL = nextUL;
                            console.log(key);
                            console.log("in the first if statement: " + value[0]);
                            prevTime = key;
                            let socialMediaTags = value[0];
                            // console.log(socialMediaTags);
                            socialMediaTags = socialMediaTags.replace(/\"/g, ''); // get this; "1:label:Instagram:,value:anothertest,type:text,2:label:Telegram:,value:anothertest,type:text"
                            // console.log(socialMediaTags);
                            socialMediaTags = socialMediaTags.split(":"); // get this an array, now need to grab the instagram string which is [4] and the telegram which is [9]
                            socialIG = socialMediaTags[4].substr(0, socialMediaTags[4].indexOf(',')); //will get just the tag by itself
                            socialIG = socialIG.replace(/\\/g, ''); //remove that backslash
                            socialTelegram = socialMediaTags[9].substr(0, socialMediaTags[9].indexOf(',')); //will get just the tag by itself alright!!!!!
                            jq('#ul' + parentUL).append('<br /><li class="am-value"> ' + socialTelegram + '       ' + socialIG + '</li>');
                            nextUL++; // this should be ittttttttttttttttt lets littt it up nextUL++;
                        } else {
                            prevTime = key;
                            newServ = servs[iteration];
                            console.log("we found a duplicate time, could be same service or a different one: " + newServ);
                            if (prevServ == newServ) {
                                console.log("ok so it is the same service, should be a different model signed up");
                                let socialMediaTags = value[0];
                                //console.log(socialMediaTags);
                                socialMediaTags = socialMediaTags.replace(/\"/g, ''); // get this; "1:label:Instagram:,value:anothertest,type:text,2:label:Telegram:,value:anothertest,type:text"
                                //console.log(socialMediaTags);
                                socialMediaTags = socialMediaTags.split(":"); // get this an array, now need to grab the instagram string which is [4] and the telegram which is [9]
                                socialIG = socialMediaTags[4].substr(0, socialMediaTags[4].indexOf(',')); //will get just the tag by itself
                                socialIG = socialIG.replace(/\\/g, ''); //remove that backslash
                                socialTelegram = socialMediaTags[9].substr(0, socialMediaTags[9].indexOf(',')); //will get just the tag by itself alright!!!!!
                                jq('#ul' + parentUL).append('<br /><li class="am-value"> ' + socialTelegram + '       ' + socialIG + '</li>');
                            } else {
                                console.log("ok so it is a different service, meaning it is a new appointment: ");
                                prevServ = newServ;
                                console.log(newServ);
                                //
                                parentUL = nextUL;
                                nextUL++;
                                let socialMediaTags = value[0];
                                //console.log(socialMediaTags);
                                socialMediaTags = socialMediaTags.replace(/\"/g, ''); // get this; "1:label:Instagram:,value:anothertest,type:text,2:label:Telegram:,value:anothertest,type:text"
                                //console.log(socialMediaTags);
                                socialMediaTags = socialMediaTags.split(":"); // get this an array, now need to grab the instagram string which is [4] and the telegram which is [9]
                                socialIG = socialMediaTags[4].substr(0, socialMediaTags[4].indexOf(',')); //will get just the tag by itself
                                socialIG = socialIG.replace(/\\/g, ''); //remove that backslash
                                socialTelegram = socialMediaTags[9].substr(0, socialMediaTags[9].indexOf(',')); //will get just the tag by itself alright!!!!!
                                jq('#ul' + parentUL).append('<br /><li class="am-value"> ' + socialTelegram + '       ' + socialIG + '</li>');

                            }
                        }
                        iteration++;
                    });

                });
            }
        }

    }
});