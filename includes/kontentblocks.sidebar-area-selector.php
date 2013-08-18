<?php

class KB_Sidebar_Area_Selector
{

	function __construct()
	{
		$this->setup_actions();
	}

	function setup_actions()
	{
		global $pagenow, $typenow;

		if ( $pagenow == 'nav-menus.php' )
			return;

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'save_post', array( $this, 'save' ), 5 );  //save early
		add_action( 'context_box_side', array( $this, 'sidebar_selector_content' ), 10, 1 );
		add_action( 'admin_footer', array( $this, 'modal_markup' ) );
	}

	/*
	 * cases to handle:
	 * 1. fresh,unedited page: no data, no timestamp
	 * 2. data and timestamp
	 * 3. timestamp only, all sidebars deactivated
	 */

	function sidebar_selector_content( $context )
	{
		global $Kontentblocks, $Kontentbox;

		if ( empty( $Kontentbox->areas[ 'side' ] ) )
			return;

		// saved sidebar settings
		if (isset($_GET['post']))
		{
			$data = get_post_meta( $_GET['post'], 'active_sidebar_areas', true );
			$flag	 = get_post_meta( $_GET['post'], '_sidebars_updated', true );
		}
		else
		{
			$data = __return_empty_array ( );
			$flag = false;
		}
		
		
		// init output
		$out	 = '';

		// get dynamic areas, dynamic areas currently are only used for sidebars
		$dynamic_areas	 = $Kontentbox->_find_available_areas( $Kontentblocks->get_areas('side'), false );
		$extracted		 = self::extract_areas( $dynamic_areas );

		// get regular side areas
		$post_sidebars = !empty( $Kontentbox->areas[ 'side' ] ) ? self::extract_areas( $Kontentbox->areas[ 'side' ] ) : __return_empty_array();
		
		// all available areas
		$areas = (is_array( $extracted ) && is_array( $post_sidebars )) ? array_merge( $extracted, $post_sidebars ) : null;
		
		// all areas 
		$allareas = $Kontentblocks->get_areas();
		// remove box if there are no areas to chose from
		
		$hide = (count( $areas ) < 2 ) ? 'hide' : '';
		
		$out .= "
				<div class='context-header orange {$hide}'>
					<h2>globale Sidebars</h2>
					<p class='description'>Eine kurze Erklärung hierzu.</p>
				</div>
				<div class='area_sidebars {$hide}'>
					<div class='context-box area-context'>
				<div class='active_dynamic_areas_wrapper'>
				
				<input type='hidden' name='_sidebars_updated' value='" . time() . "' />
				<ul class='connect' style='min-height:25px;' id='active-dynamic-areas'>";


		// if there is no stored data, active sidebar equals $post_sidebars
		if ( empty( $data ) and empty( $flag ) )
		{
			
			foreach ( $post_sidebars as $area )
			{
				if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] or $area[ 'dynamic' ] )
					continue;;

				$disabled = (true == $area[ 'dynamic' ]) ? '' : 'ui-state-disabled';
				$out .= "<li class='dynamic-area-active' id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";

				if ( true == $area[ 'dynamic' ] )
				{
					$out .= "<span><a class='reveal' data-url='admin-ajax.php?action=tb_edit_dynamic_areas&area={$area[ 'id' ]}&daction=show&context={$context}&TB_iframe=1'>edit</a></span>";
				}
				$out .= "<input id='{$area[ 'id' ]}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$area[ 'id' ]}' /></li>";

				//remove area from collection
				unset( $areas[ $area[ 'id' ] ] );
			}
		} // endif
		// we have data
		elseif ( !empty( $data ) and isset( $flag ) )
		{
			
			if ( !is_array( $data ) )
				return;

			foreach ( $data as $area )
			{

				if ( empty( $allareas[ $area ] ) )
				{
					unset( $areas[ $area[ 'id' ] ] );
					continue;
				}


				$area		 = $allareas[ $area ];
				$disabled	 = (true == $area[ 'dynamic' ]) ? '' : 'ui-state-disabled';
				$out .= "<li class='dynamic-area-active' id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";
				if ( true == $area[ 'dynamic' ] )
				{
					$out .= "<span><a class='reveal' data-url='admin-ajax.php?action=tb_edit_dynamic_areas&area={$area[ 'id' ]}&daction=show&context={$context}&TB_iframe=1'>edit</a></span>";
				}
				$out .= "<input id='{$area[ 'id' ]}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$area[ 'id' ]}' /></li>";
				//unset from dynamic areas
				unset( $areas[ $area[ 'id' ] ] );
			}
		}
		elseif ( empty( $data ) and !empty( $flag ) )
		{
			
		}
		{
			
		}

		$out .= "</ul>
					</div>";


		$out .= "<div  class='dynamic-area-selector-wrapper'>
					<h4>Inaktive Sidebars</h4>
					<ul class='connect' style='min-height:25px;' id='existing-areas'>";
		if ( !empty( $areas ) )
		{
			foreach ( $areas as $area )
			{
				if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] )
					continue;;
				$out .= "<li id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";
				if ( true == $area[ 'dynamic' ] )
				{
					$out .= "<span><a class='reveal' data-url='admin-ajax.php?action=tb_edit_dynamic_areas&area={$area[ 'id' ]}&daction=show&TB_iframe=1'>edit</a></span>";
				};
				$out .= "</li>";
			}
		}
		else
		{
			$out .= "<p>Keine Bereiche verfügbar.</p>";
		}


		$out .= "</ul>
					</div>
					</div>
					</div>";
		echo $out;
	}

	/**
	 * Form Callback 
	 */
	function sidebar_selector_content_old( $context )
	{
		global $Kontentblocks, $post, $Kontentbox;

		if ( empty( $Kontentbox->areas[ 'side' ] ) )
			return;

		$data	 = get_post_meta( $post->ID, 'active_sidebar_areas', true );
		$out	 = __return_null();

		$dynamic_areas = $Kontentbox->_find_available_areas( $Kontentblocks->get_dynamic_areas(), false );

		$extracted = self::extract_areas( $dynamic_areas );

		$post_sidebars	 = !empty( $Kontentbox->areas[ 'side' ] ) ? self::extract_areas( $Kontentbox->areas[ 'side' ] ) : __return_empty_array();
		$areas			 = (is_array( $extracted ) && is_array( $post_sidebars )) ? array_merge( $extracted, $post_sidebars ) : null;

		$flag = (!empty( $post_sidebars )) ? true : false;

		if ( count( $areas ) < 2 )
			return;

		if ( !empty( $areas ) or true == $flag )
		{

			$out .= "<div class='area_sidebars'>
					<div class='context-box area-context'>
					<div class='active_dynamic_areas_wrapper'>
					<div class='context-header'>
						<h2>Sidebars</h2>
						<p class='description'>Eine kurze Erklärung hierzu.</p>
					</div>
					<ul class='connect' id='active-dynamic-areas'>";

			if ( !empty( $data ) )
			{
				foreach ( $data as $area )
				{

					if ( empty( $Kontentblocks->areas[ $area ] ) )
					{
						unset( $areas[ $area[ 'id' ] ] );
						continue;
					}


					$area		 = $Kontentblocks->areas[ $area ];
					$disabled	 = (true == $area[ 'dynamic' ]) ? '' : 'ui-state-disabled';
					$out .= "<li class='dynamic-area-active' id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";
					if ( true == $area[ 'dynamic' ] )
					{
						$out .= "<span><a class='reveal' data-url='admin-ajax.php?action=tb_edit_dynamic_areas&area={$area[ 'id' ]}&daction=show&context={$context}&TB_iframe=1'>edit</a></span>";
					}
					$out .= "<input id='{$area[ 'id' ]}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$area[ 'id' ]}' /></li>";
					//unset from dynamic areas
					unset( $areas[ $area[ 'id' ] ] );
				}
			}
			else
			{
				if ( !empty( $post_sidebars ) )
				{

					foreach ( $post_sidebars as $area )
					{
						if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] )
							continue;;

						$disabled = (true == $area[ 'dynamic' ]) ? '' : 'ui-state-disabled';
						$out .= "<li class='dynamic-area-active' id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";

						if ( true == $area[ 'dynamic' ] )
						{
							$out .= "<span><a class='reveal' data-url='admin-ajax.php?action=tb_edit_dynamic_areas&area={$area[ 'id' ]}&daction=show&context={$context}&TB_iframe=1'>edit</a></span>";
						}
						$out .= "<input id='{$area[ 'id' ]}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$area[ 'id' ]}' /></li>";
						unset( $areas[ $area[ 'id' ] ] );
					}
				}
			}

			$out .= "</ul>
					</div>";

			$out .= "<div  class='dynamic-area-selector-wrapper'>
					<h4>Inaktive Sidebars</h4>
					<ul class='connect' id='existing-areas'>";
			if ( !empty( $areas ) )
			{
				foreach ( $areas as $area )
				{
					if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] )
						continue;;
					$out .= "<li id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";
					if ( true == $area[ 'dynamic' ] )
					{
						$out .= "<span><a class='reveal' data-url='admin-ajax.php?action=tb_edit_dynamic_areas&area={$area[ 'id' ]}&daction=show&TB_iframe=1'>edit</a></span>";
					};
					$out .= "</li>";
				}
			}
			else
			{
				$out .= "<p>Keine Bereiche verfügbar.</p>";
			}


			$out .= "</ul>
					</div>
					</div>
					</div>";

			echo $out;
		}
	}

	function save( $post_id )
	{
		if ( empty( $_POST ) )
			return;

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
			return;
		if ( defined( 'ONSITE_EDIT' ) )
			return;
		if ( !isset( $_POST[ 'post_type' ] ) )
			return;
		// verify this came from the our screen and with proper authorization,
		// because save_post can be triggered at other times
		/* if ( !empty($_POST) )
		  {
		  if (!wp_verify_nonce( $_POST['kb_noncename'], plugin_basename( __FILE__ ) ) )
		  return;
		  } */

		// Check permissions
		if ( 'page' == $_POST[ 'post_type' ] )
		{
			if ( !current_user_can( 'edit_page', $post_id ) )
				return;
		}
		else
		{
			if ( !current_user_can( 'edit_post', $post_id ) )
				return;
		}

		if ( !current_user_can( 'edit_kontentblocks' ) )
			return;

		// verification done

		if ( !empty( $_POST[ 'active_sidebar_areas' ] ) )
		{
			update_post_meta( $post_id, 'active_sidebar_areas', $_POST[ 'active_sidebar_areas' ] );
			update_post_meta( $post_id, '_sidebars_updated', time() );
		}
		else
		{
			delete_post_meta( $post_id, 'active_sidebar_areas' );
		}
	}

	function enqueue_scripts()
	{
		wp_enqueue_script( 'KBAreaSelector', KB_PLUGIN_URL . 'js/KBAreaSelector.js', array( 'jquery-ui-sortable' ) );
	}

	public static function extract_areas( $side_areas )
	{
		$extract = array( );
		if ( !empty( $side_areas ) )
		{
			foreach ( $side_areas as $area )
			{
				$extract[ $area[ 'id' ] ] = $area;
			}
		}
		return $extract;
	}
	
	public function modal_markup()
	{
		echo "<div id='da-modal' class='reveal large reveal-modal'><iframe seamless id='da-frame' src='' width='100%' height='400'></iframe></div>";
	}

}

add_action( 'init', 'add_selector_meta_box', 900 );

function add_selector_meta_box()
{
	new KB_Sidebar_Area_Selector();
}

?>
