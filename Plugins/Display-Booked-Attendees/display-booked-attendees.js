var jq = jQuery.noConflict();
jq(document).ready(function() {
    //only do this if we are on the correct url which is /lives/schedule/
    console.log('ready');
    if (window.location.pathname === "/lives/schedule/") {
        var checkExist = setInterval(function() {
            if (jq('div.am-cabinet-list').length) {
                console.log("the appointments list has loaded up");
                clearInterval(checkExist);
                gatherAndSend();
            }
        }, 100);

        function gatherAndSend() {
            console.log('in the gathering function');
            var dates = jq('#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-content > span > div.am-cabinet-dashboard-appointments > span > div > div.am-cabinet-list > div > div.am-cabinet-list-day-title');
            var userTimeZone = jq('#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input').val(); //get the current time zone
            var servs = jq("p.am-col-title:contains('session')"); //get all the services on the page=to appointment times
            console.log("gathering and sending data...");
            if (dates.length > 0) { // we actually have appointments so lets go through each one and find the info we need!!!!!!
                for (i = 0; i < dates.length; i++) {
                    var currentDate = jq(dates[i]).text().trim(); //getting just the date trimmed
                    var times = jQuery("p:contains('Time')");
                    if (times.length > 0) {
                        console.log("found this many times: " + times.length);
                        for (j = 0; j < times.length; j++) { //going through the appointment Times one by one
                            console.log("iterating through the following time: " + jQuery(times[j]).next("h4").text().trim());
                            var localt = jQuery(times[j]).next("h4").text();
                            var fullDate = currentDate + " " + localt;
                            var dt = moment(fullDate + localt, ["MMM dd, YYYY hh:mm a"]).tz('UTC').format('YYYY-mm-dd HH:mm:ss'); //getting the current date and time the way its saved in the DB
                            console.log('found the following date: ' + fullDate);
                            console.log('the UTC equivalent: ' + dt);
                            var nonce = jq(this).attr("data-nonce");
                            jq.ajax({
                                type: "POST",
                                dataType: "json",
                                url: myAjax.ajaxurl,
                                data: {
                                    action: "display-booked-attendees",
                                    appTime: dt,
                                    service: servs,
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
                        }
                    }
                }
            }
        }


        function displayAttendees(data) {
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

});