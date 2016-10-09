/**
* @author: Flightmare (http://elderscrolls.wikia.com/wiki/User:Flightmare)
* @version: 1.0.2
* @license: CC-BY-SA 3.0
* @description: Creates a flat feed for discussions module on Special:DiscussionsFeed. Includes moderation tools.
*/

function updateFeed(content, isMod, canBlock) {
    var rcLimit = 50;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            var arr = JSON.parse(request.responseText);
            content.innerHTML = '';
            for (var i = 0; i < rcLimit; i++) {
                var text = arr["_embedded"]["doc:posts"][i].rawContent;
                var user = arr["_embedded"]["doc:posts"][i]["createdBy"].name;
                var userId = arr["_embedded"]["doc:posts"][i]["createdBy"].id;
                var epoch = arr["_embedded"]["doc:posts"][i]["creationDate"].epochSecond;
                var postID = arr["_embedded"]["doc:posts"][i].id;
                var threadID = arr["_embedded"]["doc:posts"][i].threadId;
                var isReported = Boolean(arr["_embedded"]["doc:posts"][i].isReported);
                var forumName = arr["_embedded"]["doc:posts"][i].forumName;
                var dt = new Date(epoch * 1000);
                var formattedDate = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()

                //Create HTML for date:
                var spanDate = document.createElement("span");
                spanDate.className = "df-date";
                var spanDateText = document.createTextNode(formattedDate + " — ");
                spanDate.appendChild(spanDateText);

                //Create HTML for message body:
                var aMessage = document.createElement("a");
                aMessage.className = "df-content";
                aMessage.href = "/d/p/" + threadID;
                aMessage.target = "_blank";
                var aMessageText = document.createTextNode(text);
                aMessage.appendChild(aMessageText);

                //Create HTML for user:
                var aUser = document.createElement("a");
                aUser.className = "df-user";
                aUser.href = "/d/u/" + userId;
                aUser.target = "_blank";
                var aUserText = document.createTextNode(" — " + user);
                aUser.appendChild(aUserText);

                //Create HTML for category:
                var spanCategory = document.createElement("span");
                spanCategory.className = "df-category";
                var spanCategoryText = document.createTextNode(" in" + forumName);
                spanCategory.appendChild(spanCategoryText);

                //Create block button
                if (canBlock) {
                    var aBlock = document.createElement("a");
                    aBlock.className = "df-block";
                    aBlock.href = "/wiki/Special:Block/" + user;
                    aBlock.target = "_blank";
                    var aBlockText = document.createTextNode(" (block)");
                    aBlock.appendChild(aBlockText);
                }

                //Put everything together
                var par = document.createElement("p");
                par.className = "df-entry";
                if (isReported) {
                    par.className += " df-reported"
                }
                par.appendChild(spanDate);
                par.appendChild(aMessage);
                par.appendChild(aUser);
                par.appendChild(spanCategory);
                if (canBlock) {
                    par.appendChild(aBlock);
                }
                content.appendChild(par);
            }
        }
    };
    request.open("GET", "https://services.wikia.com/discussion/" + wgCityId + "/posts?limit=" + rcLimit + "&page=0&responseGroup=small&reported=false&viewableOnly=" + (!isMod).toString(), true);
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
    if(wgNamespaceNumber == -1 && wgTitle == "DiscussionsFeed") { //TODO: i18n make dictionary
        document.title = 'Discussions Feed - ' + wgSiteName;
        var canBlock = Boolean(wgUserGroups.indexOf('sysop') > -1 || wgUserGroups.indexOf('staff') > -1 || wgUserGroups.indexOf('helper') > -1 || wgUserGroups.indexOf('vstf') > -1);
        var isMod = Boolean(canBlock || wgUserGroups.indexOf('threadmoderator') > -1);
        document.getElementById("firstHeading").innerHTML = "<h1 id="firstHeading" class="firstHeading">Discussions Feed</h1>"; //Monobook skin title
        document.getElementById("WikiaPageHeader").getElementsByTagName("h1")[0].innerHTML = "<h1>Discussions Feed</h1>"; //Wikia skin title
        var content = document.getElementById("mw-content-text");
        content.innerHTML = 'Loading feed... <img src="http://vignette4.wikia.nocookie.net/wlb/images/7/74/WIP.gif/revision/latest?cb=20130731182655" /></div>';
        updateFeed(content, isMod, canBlock);
    }
}

addOnloadHook(createDiscussionsFeed);
