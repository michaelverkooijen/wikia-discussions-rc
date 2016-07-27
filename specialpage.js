function updateFeed(content) {
    var rcLimit = 25;
    console.log("sending xhr");
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            console.log(request.responseText);
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

                //Create HTML for date:
                var spanDate = document.createElement("SPAN");
                spanDate.className = "df-date";
                var spanDateText = document.createTextNode("DATE ");
                spanDate.appendChild(spanDateText);

                //Create HTML for message body: TODO: anchor
                var spanMessage = document.createElement("SPAN");
                spanMessage.className = "df-content";
                var spanMessageText = document.createTextNode(text);
                spanMessage.appendChild(spanMessageText);

                //Create HTML for user:
                var spanUser = document.createElement("SPAN");
                spanUser.className = "df-user";
                var spanUserText = document.createTextNode(" — " + user);
                spanUser.appendChild(spanUserText);

                var par = document.createElement("P");
                par.appendChild(spanDate);
                par.appendChild(spanMessage);
                par.appendChild(spanUser);
                content.appendChild(par);
            }
        }
    };
    request.open("GET", "https://services.wikia.com/discussion/1706/posts?limit=" + rcLimit + "&page=0&responseGroup=small&reported=false&viewableOnly=true", true);
    request.setRequestHeader('Accept', 'application/hal+json');
    request.send();
}

function deletePost(postID) {
    var request = new XMLHttpRequest();
    request.open("PUT", "https://services.wikia.com/discussion/1706/posts/" + postID + "/delete", true);
    request.send();
}

function createDiscussionsFeed() {
    if(wgPageName == 'Special:DiscussionsFeed') {
        var canBlock = Boolean(wgUserGroups.indexOf('sysop') > -1 || wgUserGroups.indexOf('staff') > -1 || wgUserGroups.indexOf('helper') > -1 || wgUserGroups.indexOf('vstf') > -1);
        var isMod = Boolean(canBlock || wgUserGroups.indexOf('threadmoderator') > -1);
        var content = document.getElementById("mw-content-text");
        content.innerHTML = 'Loading feed...<div id="ajaxloader"></div>';
        var entry = document.createElement("P");
        var entryText = document.createTextNode("Mod: " + isMod);
        entry.appendChild(entryText);
        content.appendChild(entry);
        updateFeed(content);
    }
}

addOnloadHook(createDiscussionsFeed);
