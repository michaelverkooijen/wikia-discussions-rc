<?php
/**
 * Quick moderation tools for Wikia discussions module (http://tes.wikia.com/d)
 */

//ID provided by Wikia to connect to the correct wiki (fetched from elderscrolls.wikia.com/api.php?action=query&meta=siteinfo&siprop=wikidesc&format=json)
if(isset($_GET['wiki'])) {
    $wiki = $_GET['wiki'];
} else {
    $wiki = elderscrolls;
}

if(isset($_GET['rclimit'])) {
    $rcLimit = $_GET['rclimit'];
} else {
    $rcLimit = 40; //nice fit for my monitor.
}

//set up curl request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://" . $wiki . ".wikia.com/api.php?action=query&meta=siteinfo&siprop=wikidesc&format=json");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

//get wikiID
$output = curl_exec($ch);
$arr_json = json_decode($output, true);
$wikiID = $arr_json["query"]["wikidesc"]["id"];

//get posts (expensive)
curl_setopt($ch, CURLOPT_URL, "https://services.wikia.com/discussion/" . $wikiID . "/posts?limit=" . $rcLimit . "&page=0&responseGroup=small&reported=false&viewableOnly=true");
$output = curl_exec($ch);

//free
curl_close($ch);

//decode json to array
$arr_json = json_decode($output, true);

echo("<html><head><script type=\"text/javascript\" src=\"quicktools.js\"></script><link rel=\"stylesheet\" type=\"text/css\" href=\"quicktools.css\"></head>" . PHP_EOL);
echo("<body>" . PHP_EOL);

foreach($arr_json["_embedded"]["doc:posts"] as $post) {
    $content = $post["rawContent"];
    $user = $post["createdBy"]["name"];
    $epoch = $post["creationDate"]["epochSecond"];
    $postID = $post["id"];
    $threadID = $post["threadId"];
    $bool_isReported = $post["isReported"];
    $dt = new DateTime("@$epoch");

    echo("\t<span class=\"date\">" . $dt->format('H:i:s') . ":</span> <a href=\"http://" . $wiki . ".wikia.com/d/p/" . $threadID . "/r/" . $postID . "\" target=\"_blank\"><span class=\"content" . ($bool_isReported ? ' reported' : '' ) . "\">" . $content . "</span></a> — <span class=\"user\">" . $user . "</span><br />" . PHP_EOL);
        // — <a href=\"#\" onclick=\"deletePost(" . $wikiID . "," . $postID . ")\">DELETE</a>
}

echo("</body></html>" . PHP_EOL);

?>
