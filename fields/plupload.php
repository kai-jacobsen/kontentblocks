<?php

kb_register_field( 'plupload', 'KB_Plupload' );

Class KB_Plupload extends KB_Field
{

	function __construct()
	{

		add_action( 'wp_ajax_plupload_upload', array( __CLASS__, 'handle_upload' ) );
		add_action( 'wp_ajax_kb_field_plupload_img', array( __CLASS__, 'kb_field_plupload_img_cb' ) );
		add_action( 'wp_ajax_kb_plupload_delete_item', array( __CLASS__, 'kb_plupload_delete_item_cb' ) );
		add_action( 'wp_ajax_kb_plupload_gallery_tab', array( __CLASS__, 'kb_plupload_gallery_tab_cb' ) );
		add_action( 'wp_ajax_kb_plupload_medialibrary_tab', array( __CLASS__, 'kb_plupload_medialibrary_tab_cb' ) );
		add_action( 'wp_ajax_kb_field_plupload_update', array( __CLASS__, 'kb_field_plupload_update_cb' ) );
		add_action( 'wp_ajax_kb-field-plupload-resort', array( __CLASS__, 'kb_field_plupload_resort_cb' ) );

		add_filter( 'kb_pre_save_field_plupload', array( __CLASS__, 'plupload_save_filter' ) );
	}

	static function admin_print_styles()
	{
		global $post;
		$post_id = (!empty($post->ID)) ? $post->ID : null;
		wp_enqueue_script( 'plupload-all' );

		wp_enqueue_script( 'kb-plupload', KB_FIELD_JS . 'plupload.js', array( 'jquery-ui-sortable', 'jquery-ui-tabs', 'wp-ajax-response', 'plupload-all', 'jquery-ui-progressbar' ), NULL, true );

		wp_localize_script( 'kb-plupload', 'kb_plupload_defaults', array(
			'runtimes' => 'html5,silverlight,flash,html4',
			'file_data_name' => 'async-upload',
			'multiple_queues' => true,
			'max_file_size' => wp_max_upload_size() . 'b',
			'url' => admin_url( 'admin-ajax.php' ),
			'flash_swf_url' => includes_url( 'js/plupload/plupload.flash.swf' ),
			'silverlight_xap_url' => includes_url( 'js/plupload/plupload.silverlight.xap' ),
			'filters' => array( array( 'title' => __( 'Allowed Image Files' ), 'extensions' => 'jpg,gif,png' ) ),
			'multipart' => true,
			'urlstream_upload' => true,
			// additional post data to send to our ajax hook
			'multipart_params' => array(
				'_ajax_nonce' => wp_create_nonce( 'plupload' ),
				'action' => 'plupload_upload', // the ajax action name
				'post_id' => $post_id
			)
		) );
	}

	function html($key, $args, $data)
	{
		global $post, $Kontentblocks;
		/*if (false === $Kontentblocks->post_context)
		{
			echo 'Field currently not supported for dynamic areas';
			return;
		}*/
		if (isset($_POST['post_id']))
		{
			$post_id = $_POST['post_id'];
		}
		elseif (!empty($post))
		{
			$post_id = $post->ID;
		}
		else
		{
			$post_id = 0;
		}
		
		
		$html = '';
		$value = ( empty( $data[$key] ) ) ? $args['std'] : $data[$key];
		$name = $this->get_field_name( $key );
		$id = $this->get_field_id( $key );
		$caption = (isset($args['caption']) && $args['caption'] == true) ? true : false;
		$imgsize = (isset($args['imgsize'])) ? $args['imgsize'] : null;
		if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );
		}
		$html .= $this->get_description($args);

		$i18n_msg			= _x( 'Hochgeladene Dateien', 'image upload', 'kontentblocks' );
		$i18n_del_file		= _x( 'Diese Datei löschen', 'image upload', 'kontentblocks' );
		$i18n_delete		= _x( 'Entfernen', 'image upload', 'kontentblocks' );
		$i18n_edit			= _x( 'Bearbeiten', 'image upload', 'kontentblocks' );
		$i18n_title			= _x( 'Dateien hochladen', 'image upload', 'kontentblocks' );
		$i18n_more			= _x( 'weitere Dateien', 'image upload', 'kontentblocks' );

		// Filter to change the drag & drop box background string
		$i18n_drop = _x( 'Bild hier hineinziehen', 'image upload', 'Kontentblocks' );
		$i18n_select = _x( 'Bilder auswählen', 'Kontentblocks' );
		$img_prefix = "{$id}";
		
		$blockid = $this->blockid;

		$html .= wp_nonce_field( "kb-delete-file_{$id}", "kb-delete-file_{$id}", false, false );
		$html .= wp_nonce_field( "kb-reorder-images_{$id}", "nonce-reorder-images_{$id}", false, false );
		$html .= "<input type='hidden' class='field-id kb-plupload-id' value='{$id}' />";
		$html .= "<input type='hidden' class='field-key kb-plupload-key' value='{$key}' />";
		$html .= "<input type='hidden' class='block-id kb-plupload-block-id' value='{$this->blockid}' />";
		//Uploaded images
		$html .= "<div id='{$img_prefix}-container'>";
		$html .= "	<h4 class='kb-uploaded-title'>{$i18n_msg}</h4>";
		$html .= "		<ul class='kb-plupload-list kb-uploaded'>";

							if ( !empty( $data[$key] ) && is_array( $data[$key] ) )
							{
								foreach ( $data[$key] as $image )
								{
									
									$html .= self::list_item_html( $image['id'], $image['caption'] , $key, $blockid );
								}
							}
							else
							{
								$html .= '<p>Noch keine Dateien hinzugefügt.</p>';
							}

		$html .=		'</ul>';

		// Show form upload
		$html .= "		<div class='tabs'>";
		$html .= "			<ul>
								<li><a href='#plupload-tab'>Plupload</a></li>
								<li><a href='admin-ajax.php?action=kb_plupload_gallery_tab&block={$this->blockid}&key={$key}&post_id=$post_id<>'><span>Gallery</span></a></li>
								<li><a href='admin-ajax.php?action=kb_plupload_medialibrary_tab&block={$this->blockid}&key={$key}&post_id=$post_id'><span>Media Library</span></a></li>
							</ul>";
		$html .= "		<div id='plupload-tab'>";
		$html .= "
							<h4>{$i18n_title}</h4>
								<div id='{$img_prefix}-dragdrop' class='kb-drag-drop hide-if-no-js'>
									<div class = 'kb-drag-drop-inside'>
										<p>{$i18n_drop}</p>
										<p>oder</p>
										<p><input id='{$img_prefix}-browse-button' type='button' value='{$i18n_select}' class='button' /></p>
									</div>
								</div>
								<div class='kb-queue'></div>";

								// old style if no js
								$html .= "
								<div class='new-files hide-if-js'>
										<div class='file-input'><input type='file' name='{$name}[]' /></div>
										<a class='kb-add-file' href='#'>{$i18n_more}</a>
								</div>";

		$html .= "		</div>"; // end tab plupload
		$html .= "	</div>"; // end tabs container
		$html .= "</div>"; // endplupload


		return $html;
	}

	static function handle_upload()
	{
		header( 'Content-Type: text/html; charset=UTF-8' );

		if ( !defined( 'DOING_AJAX' ) )
			define( 'DOING_AJAX', true );

		check_ajax_referer( 'plupload' );

		$post_id = 0;
		if ( is_numeric( $_REQUEST['post_id'] ) )
			$post_id = (int) $_REQUEST['post_id'];

		// you can use WP's wp_handle_upload() function:
		$file = $_FILES['async-upload'];
		$file_attr = wp_handle_upload( $file, array( 'test_form' => true, 'action' => 'plupload_upload' ) );
		$attachment = array(
			'post_mime_type' => $file_attr['type'],
			'post_title' => preg_replace( '/\.[^.]+$/', '', basename( $file['name'] ) ),
			'post_content' => '',
			'post_status' => 'inherit'
		);

		// Adds file as attachment to WordPress
		$id = wp_insert_attachment( $attachment, $file_attr['file'], $post_id );
		if ( !is_wp_error( $id ) )
		{
			//$response = new WP_Ajax_Response();
			wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $file_attr['file'] ) );
			if ( isset( $_REQUEST['blockid'] ) )
			{
				// Save file ID in meta field
				$key = $_REQUEST['field_key'];
				$blockid = $_REQUEST['blockid'];

				$meta = get_post_meta( $post_id, '_' . $blockid, true );
				if ( $meta )
				{
					if ( !is_array( $meta ) )
					{
						$meta = array( );
					}
					$meta[$key][$id] = $id;
					update_post_meta( $post_id, '_' . $blockid, $meta );
				}
				else
				{
					$new = array(
						$key => array( $id )
					);
					add_post_meta( $post_id, '_' . $blockid, $new );
				}
			}
			$src = wp_get_attachment_image_src( $id, 'thumbnail' );
			
			$response =  array(
				'what' => 'kb_plupload_response',
				'data' => $id,
				'supplemental' => array(
					'thumbnail' => $src[0],
					'edit_link' => get_edit_post_link( $id ),
					'blockid' => $blockid,
					'key'	=> $key
				)
			 );
			wp_send_json($response);
		}
		// faster than die();
		exit;
	}

	static function kb_field_plupload_img_cb()
	{
		
		
		
		if ( isset( $_POST['blockid'] ) )
		{
			
			$blockid = $_POST['blockid'];
			$attachment = $_POST['attachment'];
			$key = $_POST['key'];
			
			//$post = get_post($attachment);
			$caption = ''; //$post->post_title;

			echo self::list_item_html( $attachment, $caption, $key, $blockid );

			exit;
		}
	}

	static function kb_field_plupload_resort_cb()
	{

		if ( isset( $_POST['blockid'] ) )
		{
			$result = array();
			$blockid = $_POST['blockid'];
			$serialized = $_POST['serialized'];
			$key = $_POST['key'];
			$post_id = $_POST['post_id'];
			
			parse_str( $serialized, $result );
			$ids = $result['id'];
			
			$meta = get_post_meta( $post_id, '_' . $blockid, true );
			
			$meta[$key] = $ids;
			$update = update_post_meta( $post_id, '_' . $blockid, $meta );
			if ( $update )
			{
				echo 1;
			}
			else
			{
				echo 0;
			}
			exit;
		}
	}

	static function kb_field_plupload_update_cb()
	{
		if ( isset( $_POST['blockid'] ) )
		{

			$blockid = $_POST['blockid'];
			$attachment = $_POST['attachment'];
			$key = $_POST['key'];
			$post_id = $_POST['post_id'];

			$meta = get_post_meta( $post_id, '_' . $blockid, true );
			$meta[$key][] = $attachment;
			$update = update_post_meta( $post_id, '_' . $blockid, $meta );
			if ( TRUE === $update )
			{
				echo 1;
			}
			else
			{
				echo 0;
			}
			exit;
		}
	}

	static function kb_plupload_delete_item_cb()
	{
		if ( isset( $_POST['blockid'] ) )
		{

			$blockid = $_POST['blockid'];
			$attachment = $_POST['attachment'];
			$key = $_POST['key'];
			$post_id = $_POST['post_id'];



			$meta = get_post_meta( $post_id, '_' . $blockid, true );

			$thisfield = $meta[$key];
			$keyx = array_search( $attachment, $thisfield );
			unset( $thisfield[$keyx] );

			$meta[$key] = $thisfield;
			$update = update_post_meta( $post_id, '_' . $blockid, $meta );
			if ( $update )
			{
				echo 1;
			}
			else
			{
				echo 0;
			}
				
			exit;
		}
	}

	static function list_item_html($attachment, $caption,  $key, $blockid, $echo = false, $imgsize = 'thumbnail')
	{
		$html = '';

		$src = wp_get_attachment_image_src( $attachment, $imgsize );
		$src = $src[0];
		// $link = get_edit_post_link( $image );

		$html .= "
                <li id='attachment_id_{$attachment}' data-id='{$attachment}' class='plupload-image-item gradient'>
                    <div class='kb_plupload_image-wrap'>
                        <img src='{$src}' />
                        <a href='#' class='ui-icon ui-icon-circle-close kb_plupload_delete'>delete</a>
						<input type='hidden' name='{$blockid}[$key][id][]' value='{$attachment}' />
					</div>
					<textarea class='quicktags' name='{$blockid}[$key][caption][]'>{$caption}</textarea>
                </li>";

		if ( TRUE === $echo )
		{
			echo $html;
		}

		return $html;
	}

	static function kb_plupload_gallery_tab_cb()
	{
		global $post;
		
		$html = '';
		$class = 'gradient';
		$blockid = $_GET['block'];
		$key = $_GET['key'];
		$post_id = $_GET['post_id'];

		$meta = get_post_meta( $post_id, '_' . $blockid, true );
		$images = ( ! empty($meta[$key]) ) ? $meta[$key] : '';

		$attachments = get_posts( array( 'post_type' => 'attachment', 'post_parent' => $post_id ) );
		$html .= "<a href='#' class='gallery-tab-add'>Auswahl hinzufügen</a>";
		$html .= "<ul class='kb-gallery-tab-list'>";
					if ( is_array( $attachments ) )
					{
						foreach ( $attachments as $image ) 
						{
							if ( is_array( $images ) )
							{
								$class = (in_array( $image->ID, $images )) ? 'gradient exists' : 'gradient';
							}
				
							$src = wp_get_attachment_image_src( $image->ID, 'thumbnail' );
							$filename = basename( get_attached_file( $image->ID ) );
							$title = $image->post_title;

		$html .= "			<li class='{$class}' data-id='$image->ID'>
								<div class='item-wrapper'>
									<div class='item-image'><img src='{$src[0]}' /></div>
									<div class='item-description'>
										<h4>{$title}</h4>
										<p>{$filename}</p>
									</div>
								</div>
							</li>";
						}
					}
		$html .= "</ul>";
		echo $html;

		exit;
	}

	static function kb_plupload_medialibrary_tab_cb()
	{
		$html = '';
		$class = 'gradient';
		$blockid = $_GET['block'];
		$key = $_GET['key'];
		$post_id = $_GET['post_id'];

		$meta = get_post_meta( $post_id, '_' . $blockid, true );
		$images = ( ! empty($meta[$key]) ) ? $meta[$key] : '';

		$attachments = get_posts( array( 'post_type' => 'attachment', 'numberposts' => -1, 'showposts' => -1 ) );
		
		$html .= "	<div class='kb-search-wrapper'>
						<a href='#' class=' gallery-tab-add'>Auswahl hinzufügen</a>
						<div class='kb-search-inner'>
							<p class='kb-search-label'>Suchen</p>
							<input type='text' class='regular-text kb-search' name='s' autocomplete='off' />
						</div>
						
					</div>
					<ul class='kb-gallery-tab-list media-library'>";
						if ( is_array( $attachments ) )
						{
							foreach ( $attachments as $image ) 
							{
								if ( is_array( $images ) )
								{
									$class = (in_array( $image->ID, $images )) ? 'gradient exists' : 'gradient';
								}
							
						
								$src = wp_get_attachment_image_src( $image->ID, 'thumbnail' );
								$filename = basename( get_attached_file( $image->ID ) );
								$title = $image->post_title;

				$html .= "		<li class='{$class}' data-id='$image->ID'>
									<div class='item-wrapper'>
									<div class='item-image'><img src='{$src[0]}' /></div>
										<div class='item-description'>
											<h4>{$title}</h4>
											<p>{$filename}</p>
										</div>
									</div>
								</li>";
								
							}
						}
		$html .= "</ul>";
		
		echo $html;

		exit;
	}

	public static function plupload_save_filter($data)
	{

	$items = array();
		if ( !empty( $data ))
			foreach ( $data['id'] as $k => $v ) {
				if ( isset( $data['id'][$k] ) )
				{
					$items[] = array(
						'id' => $data['id'][$k],
						'caption' =>  $data['caption'][$k] 
					);
				}
			}
		return $items;
	}

}