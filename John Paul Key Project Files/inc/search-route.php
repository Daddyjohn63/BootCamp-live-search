<?php
//register our own rest route stipulating the names space, the route (search), the CRUD method and the callback function.
add_action('rest_api_init', 'cookingRegisterSearch');

function cookingRegisterSearch() {
register_rest_route('cooking/v1', 'search', array(
    'methods' => WP_REST_SERVER::READABLE,
    'callback' => 'cookingSearchResults'
));
}
// in our callback cookingSearchResults , wordpress sends back info on what the user is searching for. so we can add
//a parameter $data, to access it. We get an array of properties and values (objects).
// if we name our property 'term' we can then access in js by adding /search?term=
function cookingSearchResults($data) {
   $mainQuery = new WP_Query(array(
    'post_type' => array('post', 'page', 'chef', 'event'),
    's' => sanitize_text_field($data['term'])
   ));
// create an empty array with sub-arrays to hold the data for post and page, events and chefs
   $results = array(
       'generalInfo' => array(),
       'chefs' => array(),
       'events'=> array()
   );

   while($mainQuery->have_posts()) {
    $mainQuery->the_post();
// as we loop through, 'push' into the sub-arrays
    if (get_post_type() == 'post' OR get_post_type() == 'page')  {
        array_push($results['generalInfo'], array(
            'title' => get_the_title(),
            'permalink' => get_the_permalink(),
            'postType' => get_post_type(),
            'authorName' => get_the_author(),
            'category' => get_the_category()
        ));
    } 
    if (get_post_type() == 'chef')  {
        array_push($results['chefs'], array(
            'title' => get_the_title(),
            'permalink' => get_the_permalink(),
            'image' => get_the_post_thumbnail_url()
        ));
    } 
    if (get_post_type() == 'event')  {
        $eventDate = new DateTime(get_field('event_date'));
        $description = null;
        if (has_excerpt()) {
            $description = get_the_excerpt();
            //strip shortcodes for Divi content
            $description = preg_replace("~(?:\[/?)[^/\]]+/?\]~s", '', $description);
        }else{
            $description = wp_trim_words(get_the_content(), 18);
            $description = preg_replace("~(?:\[/?)[^/\]]+/?\]~s", '', $description);
        }
    

        array_push($results['events'], array(
            'title' => get_the_title(),
            'permalink' => get_the_permalink(),
            'image' => get_the_post_thumbnail_url(),
            'month' => $eventDate->format('M'),
            'day' => $eventDate->format('d'),
            'description' => $description
        ));
    }    
   }
   

return $results;

}