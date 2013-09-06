<?php
namespace Kontentfields;
use Kontentblocks\Fields\Field;
kb_register_field( 'cropImage', 'Kontentfields\CropImage' );

Class CropImage extends Field
{
	
	static $set_width;
	
	static $set_height;





	function __construct()
	{
		
		add_action('crop_image_iframe_header', array($this, 'enqueue_scripts'));
		add_action('wp_ajax_add_crop_image', array($this, 'add_crop_image_cb'),1);
		add_action('crop_image_step_2', array($this, 'enqueue_scripts_step2'));
		add_action('wp_ajax_kb_get_crop_image', array($this, 'get_crop_image'));
		
		
	}
	
	static public function admin_print_styles()
	{
		wp_enqueue_script( 'KBCropImage', KB_FIELD_JS.'KBCropImage.js', array('thickbox'), true );
		wp_enqueue_style('crop-image', KB_FIELD_CSS . 'cropimage.css');
	}

	public function enqueue_scripts()
	{
		wp_enqueue_style( 'global' );
		wp_enqueue_style( 'wp-admin' );
		wp_enqueue_style( 'colors' );
		wp_enqueue_style('crop-image', KB_FIELD_CSS . 'cropimage.css');
		do_action('admin_print_styles');
		do_action('admin_print_scripts');
		do_action('admin_head');
	}
	
	public function enqueue_scripts_step2()
	{
		wp_enqueue_style( 'global' );
		wp_enqueue_style( 'wp-admin' );
		wp_enqueue_style( 'colors' );
		wp_enqueue_style( 'ie' );
		wp_enqueue_style('imgareaselect');
		wp_enqueue_script('imgareaselect');
	}
	
	/**
	 * Form output function
	 * @param string $key
	 * @param array $args
	 * @param array $data
	 * @return string 
	 */
	function html($key, $args, $data)
	{


		$html = '';

		if ( !empty( $args['label'] ) ) :
			$html = $this->get_label( $key, $args['label'] );
		endif;

		$name = $this->get_field_name( $key );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$id = $this->get_field_id( $key );
		$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];
		
		$tag = null;
		
		if (!empty($value))
		{
			$img = wp_get_attachment_image_src($value, 'full');
			$tag = "<img src='{$img[0]}' >";
		}
		
		$button = (null != $tag) ? __('Bild ändern','kontentblocks') : __('Bild hinzufügen.', 'kontentblocks');
		
		
		$defaults = $this->get_defaults($args);
		// sizes
		$args = wp_parse_args($args, $defaults);
		
		
		
		
		$html = "
				<div class='crop-image-holder'>{$tag}</div>
				<a class='button-primary add-crop-image-link' rel='" . admin_url('admin-ajax.php') ."?action=add_crop_image&step=1&sizew={$args['width']}&sizeh={$args['height']}&blockid={$this->blockid}&TB_iframe=true&' title='{$button}'>{$button}</a>
		<input type='hidden' name='{$name}' value='{$value}' class='crop-image-data' />";
		
		

		return $html;
	}
	
	/**
	 * Initial IFrame Content / Look for step
	 * @global array $current_user
	 * @global array $wp_locale 
	 */
	
	public function add_crop_image_cb()
	{
		global $current_user, $wp_locale;
		?>
		
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" <?php do_action('admin_xml_ns'); ?> <?php language_attributes(); ?>>
		
		<head>
		<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php echo get_option('blog_charset'); ?>" />
		<title><?php bloginfo('name') ?> &rsaquo; <?php _e('Uploads'); ?> &#8212; <?php _e('WordPress'); ?></title>
		<script type="text/javascript">
		//<![CDATA[
		addLoadEvent = function(func){if(typeof jQuery!="undefined")jQuery(document).ready(func);else if(typeof wpOnload!='function'){wpOnload=func;}else{var oldonload=wpOnload;wpOnload=function(){oldonload();func();}}};
		var userSettings = {
				'url': '<?php echo SITECOOKIEPATH; ?>',
				'uid': '<?php if ( ! isset($current_user) ) $current_user = wp_get_current_user(); echo $current_user->ID; ?>',
				'time':'<?php echo time() ?>'
			},
			ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>',
			thousandsSeparator = '<?php echo addslashes( $wp_locale->number_format['thousands_sep'] ); ?>',
			decimalPoint = '<?php echo addslashes( $wp_locale->number_format['decimal_point'] ); ?>',
			isRtl = <?php echo (int) is_rtl(); ?>;
		//]]>
		</script>
		<?php
			do_action('crop_image_iframe_header');
			do_action("crop_image_step_{$_REQUEST['step']}");
		?>

		</head>
		<body>
			<div class='image-crop-wrapper'>
			<input type="hidden" id="step" value="<?php echo $_REQUEST['step']; ?>"  />
			
		<?php
			switch($_REQUEST['step'])
			{
				case 1:
					self::image_crop_step1();
				break;

				case 2:
					self::image_crop_step2();
				break;

				case 3:
					self::image_crop_step3();
				break;
			}

			do_action('admin_print_footer_scripts');
		?>
			</div>
		<script type="text/javascript">if(typeof wpOnload=='function')wpOnload();</script>
		</body>
		</html>
		<?php

			die();		
	}

	/**
	 * Step 1 
	 */
	public static function image_crop_step1()
	{
		
		//transient seize
		$meta = array(
			'height' => $_GET['sizeh'],
			'width' => $_GET['sizew'],
			'blockid' => $_GET['blockid']
		);
		set_transient('crop_image_meta', $meta, 60 * 60);

		echo "<div id='image-crop-step_1' class='image-crop-step'>";
		
		
			//self::get_uploaded_image();

			echo "<form enctype='multipart/form-data' id='upload-form' method='POST' action='admin-ajax.php?action=add_crop_image&step=2' >";
					wp_nonce_field('user-avatar');
					
			echo "
					<div class='upload-form'>
					<div class='context-box'>
					<h2>1. Bild auswählen.
					<label for='upload'>Bild auswählen</label><br>
					<input type='file' id='upload' name='crop_image_file' />
					</div>
					<div class='context-box'>
					<h2>2. Hochladen.</h2>
					<input type='hidden' name='sub_action' value='save' />
					<p class='submit'><input type='submit' value='hochladen' /></p>
					</div>
					</form>
					</div>";
					
		echo "</div>";
	}
	
	public static function image_crop_step2()
	{
		if ( !isset($_FILES['crop_image_file']))
		{
			echo "<div class='error'><p>".__("Bitte wähle zunächst eine Bilddatei von der Festplatte aus (.jpeg, .gif, .png).")."</p></div>";
			self::image_crop_step1();
		}
		
		// handle wrong filetype
		if ( !(($_FILES["crop_image_file"]["type"] == "image/gif") 
			|| ($_FILES["crop_image_file"]["type"] == "image/jpeg") 
			|| ($_FILES["crop_image_file"]["type"] == "image/png") 
			|| ($_FILES["crop_image_file"]["type"] == "image/pjpeg") 
			|| ($_FILES["crop_image_file"]["type"] == "image/x-png")))
			{
			echo "<div class='error'><p>".__("Bitte wähle zunächst eine Bilddatei von der Festplatte aus (.jpeg, .gif, .png).")."</p></div>";
			
			self::image_crop_step1();
			
			die();
			}
			
			$meta = get_transient('crop_image_meta');
			
			$init_width = $meta['width'];
			$init_height = $meta['height'];
			// handle file
			$overrides = array('test_form' => false);
			$file = wp_handle_upload($_FILES['crop_image_file'], $overrides);

			if ( isset($file['error']) ){
				die( $file['error'] );
			}
			
			//file data
			$url = $file['url'];
			$type = $file['type'];
			$file = $file['file'];
			$filename = basename($file);
			
			// temp save file info
			set_transient( "crop_image_{$meta['blockid']}", $file, 60 * 60 * 5 );
			
			$object = array(
			'post_title' => $filename,
			'post_content' => $url,
			'post_mime_type' => $type,
			'guid' => $url);

			// Save the data
			list($width, $height, $type, $attr) = getimagesize( $file );
			
			if (  $init_width > 900) {
				$oitar = $width / 450;
				$pitar = $init_width / 450;
				$image = wp_crop_image($file, 0, 0, $width, $height, 450, $height / $oitar, false, str_replace(basename($file), 'midsize-'.basename($file), $file));


				$url = str_replace(basename($url), basename($image), $url);
				$width = $width / $oitar;
				$height = $height / $oitar;
				$pwidth = $init_width / $pitar;
				$pheight = $init_height / $pitar;
			}
			else if ( $width > $init_width ) {
				$oitar = $width / $init_width;
				$image = wp_crop_image($file, 0, 0, $width, $height, $init_width, $height / $oitar, false, str_replace(basename($file), 'midsize-'.basename($file), $file));


				$url = str_replace(basename($url), basename($image), $url);
				$width = $width / $oitar;
				$height = $height / $oitar;
				$pwidth = $init_width / $oitar;
				$pheight = $init_height / $oitar;
			} else {
				$oitar = 1;
			}
			?>

			<form id="iframe-crop-form" method="POST" action="<?php echo admin_url('admin-ajax.php'); ?>?action=add_crop_image&step=3">

			<h4><?php _e('Wähle den Bildauschnitt aus','kontentblocks'); ?> <input type="submit" class="button" id="user-avatar-crop-button" value="<?php esc_attr_e('Bild zuschneiden','user-avatar'); ?>" /></h4>

			<div id="upload-wrap">
			<img src="<?php echo $url; ?>" id="upload" width="<?php echo esc_attr($width); ?>" height="<?php echo esc_attr($height); ?>" />
			</div>
			<div id="user-avatar-preview">
			<h4>Preview</h4>
			<div id="preview-wrap" style="width: <?php echo $pwidth / 1.4; ?>px; height: <?php echo $pheight / 1.4; ?>px; overflow: hidden;">
			<img src="<?php echo esc_url_raw($url); ?>" width="<?php echo esc_attr($width); ?>" height="<?php echo $height; ?>">
			</div>
			<p class="submit" >
			<input type="hidden" name="o_width" id="o_width" value="<?php echo $width; ?>" />
			<input type="hidden" name="o_width" id="o_height" value="<?php echo $height; ?>" />
			<input type="hidden" name="x1" id="x1" value="0" />
			<input type="hidden" name="y1" id="y1" value="0" />
			<input type="hidden" name="x2" id="x2" />
			<input type="hidden" name="y2" id="y2" />
			<input type="hidden" name="width" id="width" value="<?php echo esc_attr($width) ?>" />
			<input type="hidden" name="height" id="height" value="<?php echo esc_attr($height) ?>" />
			<input type="hidden" name="init_width" id="init_width" value="<?php echo esc_attr($init_width) ?>" />
			<input type="hidden" name="init_height" id="init_height" value="<?php echo esc_attr($init_height) ?>" />
			<input type="hidden" name="blockid" id="blockid" value="<?php echo esc_attr($meta['blockid']) ?>" />
			

			<input type="hidden" name="oitar" id="oitar" value="<?php echo esc_attr($oitar); ?>" />
			<?php wp_nonce_field('user-avatar'); ?>
			</p>
			</div>
			</form>
			<script>
				jQuery(document).ready( function($) {
		    var o_height = $('#o_height').val();
		    var o_width	 = $('#o_width').val();
		    var xinit = $('#init_width').val();
		    var yinit = $('#init_height').val();

		    var ratio = xinit / yinit;
		    var ximg = jQuery('img#upload').width();
		    var yimg = jQuery('img#upload').height();

		    if ( yimg < yinit || ximg < xinit ) 
			{
			    if ( ximg / yimg > ratio ) 
				{
				    yinit = yimg;
				    xinit = yinit * ratio;
				} 
				else 
				{
				    xinit = ximg;
				    yinit = xinit / ratio;
				}
			}
			
		    $('img#upload').imgAreaSelect({
			handles: true,
			keys: true,
			aspectRatio: xinit + ':' + yinit,
			show: true,
			x1: 0,
			y1: 0,
			x2: xinit,
			y2: yinit,
			onInit: function () {
				jQuery('#width').val(xinit);
				jQuery('#height').val(yinit);
			},
			onSelectChange: function(img, c) {
				jQuery('#x1').val(c.x1);
				jQuery('#y1').val(c.y1);
				jQuery('#width').val(c.width);
				jQuery('#height').val(c.height);
				
				
				
				if (!c.width || !c.height)
        			return;
    
			    var scaleX = xinit / c.width;
			    var scaleY = yinit / c.height;
				
			    jQuery('#preview-wrap img').css({
			        width: Math.round(scaleX * o_width),
			        height: Math.round(scaleY * o_height),
			        marginLeft: -Math.round(scaleX * c.x1),
			        marginTop: -Math.round(scaleY * c.y1)
			    });

			}
		});
					
				});
			</script>
		<?php
	}
	
	public static function image_crop_step3()
	{
		if ( $_POST['oitar'] > 1 ) 
			{
				$_POST['x1'] = $_POST['x1'] * $_POST['oitar'];
				$_POST['y1'] = $_POST['y1'] * $_POST['oitar'];
				$_POST['width'] = $_POST['width'] * $_POST['oitar'];
				$_POST['height'] = $_POST['height'] * $_POST['oitar'];
			}
	
		$original_file = get_transient( "crop_image_{$_POST['blockid']}" );
						 delete_transient("crop_image_{$_POST['blockid']}" );
	if( !file_exists($original_file) ) {
		echo "<div class='error'><p>". __('Sorry, No file available','user-avatar')."</p></div>";
		return true;
	}
		
	
	// update the files 
	$cropped_full = wp_crop_image( $original_file, $_POST['x1'], $_POST['y1'], $_POST['width'], $_POST['height'], $_POST['init_width'], $_POST['init_height'], false, str_replace(basename($original_file), 'final-'.basename($original_file), $original_file));
	
	//$cropped_thumb = wp_crop_image( $original_file, $_POST['x1'], $_POST['y1'], $_POST['width'], $_POST['height'], 200, 200, false );
	
	
	/* Remove the original */
	@unlink( $original_file );
		
	if ( is_wp_error( $cropped_full ) )
		wp_die( __( 'Image could not be processed.  Please go back and try again.' ), __( 'Image Processing Error' ) );
	
		//add_filter('intermediate_image_sizes_advanced', array(__CLASS__, 'remove_unused_sizes'), 9, 1);
		$wp_filetype = wp_check_filetype(basename($cropped_full), null );
		$wp_upload_dir = wp_upload_dir();
		$attachment = array(
			'guid' => $wp_upload_dir['baseurl'] . _wp_relative_upload_path( $cropped_full ), 
			'post_mime_type' => $wp_filetype['type'],
			'post_title' => preg_replace('/\.[^.]+$/', '', basename($cropped_full)),
			'post_content' => '',
			'post_status' => 'inherit'
		);
		$attach_id = wp_insert_attachment( $attachment, $cropped_full );
		// you must first include the image.php file
		// for the function wp_generate_attachment_metadata() to work
		require_once(ABSPATH . 'wp-admin/includes/image.php');
		$attach_data = wp_generate_attachment_metadata( $attach_id, $cropped_full );
		wp_update_attachment_metadata( $attach_id, $attach_data );
	
	
	?>
	<div id="user-avatar-step3">
		<script>
			parent.KBCropImage.attachment_id = <?php echo $attach_id; ?>
		</script>
		<h3><?php _e("Zurechtgeschnittenes Bild",'user-avatar'); ?></h3>
		<span style="float:left;">
		<?php
			echo wp_get_attachment_image($attach_id, 'medium');
		?>
		</span>
		<a id="user-avatar-step3-close" class="button-primary" onclick="self.parent.KBCropImage.insert();" ><?php _e('Schließen','kontentblocks'); ?></a>
	</div>
<?php	
	}
	
	// 
	public function remove_unused_sizes($sizes)
	{
		return __return_empty_array();
	}
	
	/**
	 * Get crop image by id 
	 */
	function get_crop_image()
	{
		$id = $_POST['id'];
		
		$src = wp_get_attachment_image_src($id, 'full');
		
		$json = array(
			'src' => $src[0],
			'width' => $src[1],
			'height' => $src[2]
		);
		
		echo json_encode($json);
		exit;
	}

	public function get_defaults($args)
	{
		
		$context = (!empty($this->area_context)) ? $this->area_context : null;
		$page_template = $this->page_template;
		
		if ( !empty($args['sizes']) and !empty($args['sizes']['template'][$page_template]) and is_array($args['sizes']['template'][$page_template]) )
		{
			return $args['sizes']['template'][$page_template]; 
		}
		elseif ( !empty($args['sizes']) and !empty($args['sizes']['context'][$context]) and is_array($args['sizes']['context'][$context]) )
		{
			return $args['sizes']['context'][$context]; 
		}
		elseif (!empty($args['sizes']) and !empty($args['sizes']['default'])) 
			
		{
			return $args['sizes']['default'];
		}
		else
		{
			
		switch($context)
		{
			default:
			return 	$defaults = array(
			'width'	=> 940,
			'height' => 300
		);
			break;
		}
	}
}
}