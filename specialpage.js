/**
* @author: Flightmare (http://elderscrolls.wikia.com/wiki/User:Flightmare)
* @version: 1.0
* @license: CC-BY-SA 3.0
* @description: Creates a flat feed for discussions module on Special:DiscussionsFeed. Includes moderation tools.
*/

function updateFeed(content, isMod) {
    var rcLimit = 25;
    console.log("sending xhr");
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            var arr = JSON.parse(request.responseText);
            content.innerHTML = '';
            for (var i = 0; i < rcLimit; i++) {
                var text = arr["_embedded"]["doc:posts"][i].rawContent;
                var user = arr["_embedded"]["doc:posts"][i]["createdBy"].name;
                var epoch = arr["_embedded"]["doc:posts"][i]["creationDate"].epochSecond;
                var postID = arr["_embedded"]["doc:posts"][i].id;
                var threadID = arr["_embedded"]["doc:posts"][i].threadId;
                var isReported = arr["_embedded"]["doc:posts"][i].isReported;
                var dt = new Date(epoch * 1000);

                //Create HTML:
                var par = document.createElement("P");
                par.className = "df-entry";

                //Create HTML for date:
                var spanDate = document.createElement("SPAN");
                spanDate.className = "df-date";
                var spanDateText = document.createTextNode(dt + ": ");
                spanDate.appendChild(spanDateText);
                par.appendChild(spanDate);

                //Create HTML for message body:
                var aMessage = document.createElement("A");
                aMessage.className = "df-content";
                aMessage.href = "https://" + wgDBname + ".wikia.com/d/p/" + threadID + "/r/" + postID;
                aMessage.target = "_blank";
                var aMessageText = document.createTextNode(text);
                aMessage.appendChild(aMessageText);
                par.appendChild(aMessage);

                //Create HTML for user:
                var spanUser = document.createElement("SPAN");
                spanUser.className = "df-user";
                var spanUserText = document.createTextNode(" — " + user);
                spanUser.appendChild(spanUserText);
                par.appendChild(spanUser);

                //Create Delete button for moderators:
                if (isMod) {
                    var btnDelete = document.createElement("button");
                    btnDelete.type = "button";
                    btnDelete.textContent = "Delete";
                    btnDelete.addEventListener("click", deletePost(postID));
                    par.appendChild(btnDelete);
                }

                content.appendChild(par);
            }
        }
    };
    request.open("GET", "https://services.wikia.com/discussion/" + wgCityId + "/posts?limit=" + rcLimit + "&page=0&responseGroup=small&reported=false&viewableOnly=true", true);
    request.setRequestHeader('Accept', 'application/hal+json');
    request.send();
}

function deletePost(postID) {
    console.log("Deleting post: " + postID);
    var request = new XMLHttpRequest();
    request.open("PUT", "https://services.wikia.com/discussion/" + wgCityId + "/posts/" + postID + "/delete", true);
    request.send();
}

function createDiscussionsFeed() {
    if(wgPageName == 'Special:DiscussionsFeed') {
        document.title = 'Discussions Feed - ' + wgSiteName;
        var canBlock = Boolean(wgUserGroups.indexOf('sysop') > -1 || wgUserGroups.indexOf('staff') > -1 || wgUserGroups.indexOf('helper') > -1 || wgUserGroups.indexOf('vstf') > -1);
        var isMod = Boolean(canBlock || wgUserGroups.indexOf('threadmoderator') > -1);
        var content = document.getElementById("mw-content-text");
        content.innerHTML = 'Loading feed...<div id="ajaxloader"></div>';
        updateFeed(content, isMod);
    }
}

addOnloadHook(createDiscussionsFeed);
