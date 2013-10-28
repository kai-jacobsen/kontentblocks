<?php

namespace Kontentblocks\Menus\Sidebar;

global $current_screen, $Kontentfields;

use Kontentblocks\Utils\RegionRegistry,
    Kontentblocks\Admin\GlobalContextData,
    Kontentblocks\Helper as Helper;

if ( isset( $_GET[ 'area' ] ) ) {
    $area_id = $_GET[ 'area' ];
}
else {
    die( 'Something wrong here Baby!' );
}

$dataContainer = new GlobalContextData();
$area          = RegionRegistry::getInstance()->getArea( $area_id );

$Kontentfields->setup( 'SidebarEditScreen', 'new_area', $area );


// Area Edit Form

$dynamic = (true == $area[ 'dynamic' ]) ? 'true' : 'false';

echo "<form action='admin.php?page={$current_screen->parent_base}&action=update-settings&area={$area[ 'id' ]}' method='post' />
		" . wp_nonce_field( 'kb_edit_area', 'kb_edit_area_nonce' ) . "
		<input type='hidden' name='new_area[dynamic]' value='{$dynamic}' >
		<input type='hidden' name='new_area[context]' value='side' >
		<div class='kb_area_edit_form kb_page_wrap' >";

$Kontentfields->section_open( 'identifier', 'Identify', 'Some Description' );

$Kontentfields->start_tabs( 'ident' );

// Identifier Fields
$Kontentfields->start_group( 'id', array( 'tabname' => 'Id' ) );
$Kontentfields->field(
    'text', 'name', array(
    'label' => 'Name'
) );
$Kontentfields->field(
    'textarea', 'description', array(
    'label' => 'Description'
) );
$Kontentfields->field(
    'text', 'id', array(
    'label' => 'ID',
    'disabled' => true
) );
$Kontentfields->end_group();

// Output specific
$Kontentfields->start_group( 'output', array( 'tabname' => 'Settings' ) );

$Kontentfields->field(
    'text', 'before_area', array(
    'label' => 'Before Area'
) );

$Kontentfields->field(
    'text', 'after_area', array(
    'label' => 'After Area'
) );

$Kontentfields->end_group();


$Kontentfields->field(
    'checkboxGroup', 'post_type', array(
    'label' => 'Post Types',
    'options' => Helper\getPostTypes()
) );

$Kontentfields->field(
    'checkboxGroup', 'page_template', array(
    'label' => 'Page Templates',
    'options' => Helper\getPageTemplates()
) );

$Kontentfields->field(
    'checkboxGroup', 'available_blocks', array(
    'label' => 'Assigned Modules',
    'options' => Helper\getAssignedModules($dataContainer)
) );

$Kontentfields->field(
    'checkboxGroup', 'area_templates', array(
    'label' => 'Area Templates',
    'options' => Helper\getAreaTemplates()
) );


$Kontentfields->end_tabs();
$Kontentfields->section_close();


$Kontentfields->done();

echo"</div><input type='submit' class='button-primary' value='update area' > 
		</form>";
