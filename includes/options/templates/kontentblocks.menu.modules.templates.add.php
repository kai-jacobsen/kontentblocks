<?php

namespace Kontentblocks\Backend\Templates;

global $Kontentblocks, $current_screen, $Kontentbox;

// TODO: check add nonce

// set Kontentblocks post context
$Kontentblocks->set_post_context(false);

if (!isset($_REQUEST['class']) or $_REQUEST['class'] === 'null' )
	wp_die ('Whooops, Big Whoop is not here!', 'I\'m Guybrush Threepwood');

$name = (!empty($_REQUEST['template_name'])) ? $_REQUEST['template_name'] : null;
$master = (!empty($_REQUEST['template_master'])) ? true : false; 

// saved templates
$option = get_option('kb_block_templates');

$tpl_count = _getID($option); 
if ( $tpl_count >= 1 )
	{
		$kb_tpl_count = $tpl_count + 1;
	}
	else
	{
		$kb_tpl_count = 1;
	};

$class = $_REQUEST['class'];

$kb_new_id = "kb_block_template_{$kb_tpl_count}";



// prepare new block data
$new_block = array(
	'id' => $kb_new_id,
	'instance_id' => $kb_new_id,
	'area' => null,
	'class' => $class,
	'name' => $name,
	'status' => '',
	'draft' => 'true',
	'locked' => 'false',
	'template' => true,
	'master' => $master
);

$option[$kb_new_id] = $new_block;


update_option('kb_block_templates', $option);


$location = 'admin.php?page=kontentblocks-templates&action=edit_template&template=' . $kb_new_id;

wp_redirect($location);





/*
 * Get possible id
 */
function _getID($blocks)
{
        $collect = array(0);
        if ( !empty( $blocks ) )
        {
            foreach ( $blocks as $block )
            {
                $block = maybe_unserialize( $block );
       
                $count = strrchr( $block['instance_id'], "_" );
                $id = str_replace( '_', '', $count );
                $collect[] = $id;
            }			
        }    
        return max( $collect );
}