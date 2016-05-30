function deletePost(wikiID, postID) {
    var request = new XMLHttpRequest();
    request.open("PUT", "https://services.wikia.com/discussion/" + wikiID + "/posts/" + postID + "/delete", true);
    request.send();
}
