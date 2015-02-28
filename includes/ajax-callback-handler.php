<?php

/**
 * -----------------------------------------
 * Frontend get resized image
 * -----------------------------------------
 */
add_action( 'wp_ajax_fieldGetImage', array( 'Kontentblocks\Ajax\Actions\Frontend\FieldGetImage', 'run' ) );



