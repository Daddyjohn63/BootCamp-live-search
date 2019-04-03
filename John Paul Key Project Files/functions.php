<?php 

require get_theme_file_path('/inc/search-route.php');

// create custom fields for my json endpoints
function cooking_custom_rest() {
    register_rest_field('post' , 'authorName', array(
        'get_callback' => function() {return get_the_author();}
        
    ));
    register_rest_field('post' , 'categoryName', array(
        'get_callback' => function() {return get_the_category();}
    ));
   
}

add_action('rest_api_init', 'cooking_custom_rest');

add_action( 'wp_enqueue_scripts', 'my_enqueue_assets' ); 

function my_enqueue_assets() { 

    wp_enqueue_style( 'parent-style', get_template_directory_uri().'/style.css', NULL, microtime() ); 
    wp_register_script( 'scripts-js', get_stylesheet_directory_uri() . '/scripts.js', array( 'jquery' ), '1.0', true );
    wp_enqueue_script( 'scripts-js' );
    wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    // use wp_localize_script to create our own root url handle...  cookingschooldata.. wp will create this as a variable.
    // with an object inside.
    wp_localize_script('scripts-js', 'cookingschooldata', array(
        'root_url' => get_site_url()
        
    ));
} 


 // Sort events posts by event date.
 add_filter( 'dfbm_query_args_output', function( $query_args )
 {
 if ( 'event' == $query_args['post_type'] )
 {
 $query_args['meta_query'] =  
 [
 'relation' => 'AND',
 'date' =>
 [
 'key' => 'event_date',
 'value' => date( "Y-m-d" ),
 'compare' => '>=',
 'type' => 'DATE'
 ],
 
 ];
 $query_args['orderby'] =
 [
 'date' => 'ASC', // DESC
 
 ];
 } // end if
 return $query_args;
 });  

?>

<?php
// add event date to just before the Meta in blog view
  add_action( 'dfbm_post_meta_before', function( $post, $featured )
        {?>
     <h2 class = "event_date_title"><?php  echo (new DateTime(get_post_meta($post->ID,'event_date',true)))->format('d M Y');
         } , 10, 2 );
?>

   
        