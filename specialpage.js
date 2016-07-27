function updateFeed(content) {
    //fetch some data
    //update DOM
    console.log("sending xhr");
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            console.log(request.responseText);
            content.innerHTML = request.responseText;
        }
    };
    request.open("GET", "https://services.wikia.com/discussion/1706/posts?limit=25&page=0&responseGroup=small&reported=false&viewableOnly=true", true);
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
        content.innerHTML = 'Loading feed...';
        var entry = document.createElement("P");
        var entryText = document.createTextNode("Loading feed...");
        entry.appendChild(entryText);
        content.appendChild(entry);
        updateFeed(content);
    }
}

addOnloadHook(createDiscussionsFeed);
