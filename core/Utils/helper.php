<?php
/*
 * File needs more love and should be cleaned up
 * Basically, important are those two _send_to filters, because those vars
 * are used in the several places by various scripts.
 * 
 * Instead of adding those filters over and over again, keep them in place,
 * they don't harm and don't change anything.
 * 
 * TODO: Migrate those vars to a KBEditorVars (?) Object
 * make things more consistent throughout the whole system
 * 
 * 
 */


/**
 * Custom image_send_to_editor filter
 * will add all attributes and vars to the window,
 * and can be accessed by scripts which need them.
 *
 */

if (isset($_GET['from_iframe']))
    add_filter('image_send_to_editor', 'kb_image_send_to_editor', 1, 8);

function kb_image_send_to_editor($html, $id, $caption, $title, $align, $url, $size, $alt = '')
{

    ?>
    <script type="text/javascript">
        // send image variables back to opener

        var win = window.dialogArguments || opener || parent || top;
        win.kb_html = '<?php echo addslashes( $html ) ?>';
        win.kb_attachment_id = '<?php echo $id ?>';
        win.kb_alt = '<?php echo addslashes( $alt ) ?>';
        win.kb_caption = '<?php echo addslashes( $caption ) ?>';
        win.kb_title = '<?php echo addslashes( $title ) ?>';
        win.kb_align = '<?php echo $align ?>';
        win.kb_url = '<?php echo $url ?>';
        win.kb_size = '<?php echo $size ?>';
    </script>
    <?php

    return $html;
}

/**
 * See above, but for non-image files
 * TODO: also put the two missing args to the window
 */


if (isset($_GET['from_iframe']))
    add_filter('media_send_to_editor', 'kb_file_send_to_editor', 1, 3);
function kb_file_send_to_editor($kb1, $kb2, $kb3)
{
    ?>
    <script type="text/javascript">
        // send image variables back to opener

        var win = window.dialogArguments || opener || parent || top;
        win.kb_file_url = '<?php echo $kb3['url'] ?>';
    </script>
<?php
}

/* Hide panels from the Image Uploader and modify the insert button */
if (isset($_REQUEST['kb_change_iu']) && $_REQUEST['kb_change_iu'] == true):
    add_action('admin_print_footer_scripts', 'kb_hide_from_image_uploader');
endif;

function kb_hide_from_image_uploader()
{

    add_filter('media_upload_form_url', 'add_hidden_input', 10, 2);

    echo "
		<script type='text/javascript'>
		jQuery(document).ready( function($) {
			$('tr.image-size, .wp-post-thumbnail, tr.url, tr.align, tr.post_content, tr.post_excerpt, tr.image_alt, tr.post_title, #gallery-settings').hide();
			$('td.savesend .button').val('einfügen');
			$('.media-upload-form').prepend('<input type=\'hidden\' name=\'kb_change_iu\' value=\'true\' />');
			action = $('#gallery-form').attr('action');
			$('#gallery-form').attr('action', action + '&from_iframe=true');
			action_upload = $('#image-form').attr('action');
			$('#image-form').attr('action', action_upload + '&from_iframe=true');
			$('#sidemenu li a').each( function(i) {
				 target = $(this).attr('href');
				 new_target = target + '&kb_change_iu=true';
				 $(this).attr('href', new_target);
				
				});

			})
			</script>
			";
}


function add_hidden_input($url, $type)
{
    return $url . 'kb_change_iu=true';
}

if (isset($_GET['tab']) && $_GET['tab'] == 'type' && isset($_GET['kb_change_ui']) && $_GET['kb_change_iu'] == true):
    add_action('admin_print_footer_scripts', 'kb_add_hidden_identifier');
endif;

function kb_add_hidden_identifier()
{


    echo "
			<script type='text/javascript'>
			jQuery(document).ready( function($) {
				$('body').ajaxComplete(function(){

				$('tr.image-size, .wp-post-thumbnail, tr.url, tr.align, #gallery-settings').hide();
				$('td.savesend .button').val('einfügen');
					});

				})
				</script>
				";
}

/*
  -------------------------------------------------------------
  kb_wp_editor
  ------------------------------------------------------------- */

function kb_wp_editor($block_id, $data, $name = NULL, $media = true, $args = array())
{
//
//    $first_init = array(
//        'theme' => 'modern',
//        'skin' => 'lightgray',
//        'language' => self::$mce_locale,
//        'resize' => 'vertical',
//        'formats' => "{
//						alignleft: [
//							{selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles: {textAlign:'left'}},
//							{selector: 'img,table,dl.wp-caption', classes: 'alignleft'}
//						],
//						aligncenter: [
//							{selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles: {textAlign:'center'}},
//							{selector: 'img,table,dl.wp-caption', classes: 'aligncenter'}
//						],
//						alignright: [
//							{selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles: {textAlign:'right'}},
//							{selector: 'img,table,dl.wp-caption', classes: 'alignright'}
//						],
//						strikethrough: {inline: 'del'}
//					}",
//        'relative_urls' => false,
//        'remove_script_host' => false,
//        'convert_urls' => false,
//        'browser_spellcheck' => true,
//        'fix_list_elements' => true,
//        'entities' => '38,amp,60,lt,62,gt',
//        'entity_encoding' => 'raw',
//        'menubar' => false,
//        'keep_styles' => false,
//        'paste_remove_styles' => true,
//
//        // Limit the preview styles in the menu/toolbar
//        'preview_styles' => 'font-family font-size font-weight font-style text-decoration text-transform',
//
//        'wpeditimage_disable_captions' => $no_captions,
//        'plugins' => implode( ',', $plugins ),
//    );
//
    $plugins = array_unique( apply_filters( 'tiny_mce_plugins', array(
        'charmap',
        'hr',
        'media',
        'paste',
        'tabfocus',
        'textcolor',
        'fullscreen',
        'wordpress',
        'wpeditimage',
        'wpgallery',
        'wplink',
        'wpdialogs',
        'wpview',
    ) ) );
    $settings = array(
        'wpautop' => false, // use wpautop?
        'media_buttons' => false, // show insert/upload button(s)
        'textarea_name' => $name, // set the textarea name to something different, square brackets [] can be used here
        'tabindex' => '',
        'editor_css' => '',
        'editor_class' => 'kb_editor_textarea', // add extra class(es) to the editor textarea
        'teeny' => false, // output the minimal editor config used in Press This
        'dfw' => false, // replace the default fullscreen with DFW (needs specific DOM elements and css)
        'tinymce' => array(
            'height' => '250px',
            'resize' => 'vertical',
            'paste_remove_styles' => true,
            'menubar' => false,
            'preview_styles' => 'font-family font-size font-weight font-style text-decoration text-transform',
            'plugins' => implode(',', $plugins)

        ), // load TinyMCE, can be used to pass settings directly to TinyMCE using an array()
        'quicktags' => true
    );

    if (!empty($args))
        $settings = wp_parse_args($args, $settings);

    wp_editor($data, $block_id . 'editor', $settings);
}