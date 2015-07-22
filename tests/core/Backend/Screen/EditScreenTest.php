<?php

namespace Kontentblocks\tests\core\Backend\Screen;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Screen\EditScreen;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class EditScreenTest
 * @package Kontentblocks\tests\core\Backend\Screen
 */
class EditScreenTest extends \WP_UnitTestCase
{

    private $EditScreen;

    public function setUp()
    {
        global $pagenow;
        $pagenow = 'post.php';
        parent::setUp();
        $this->EditScreen = new EditScreen();

        \Kontentblocks\registerArea(
            array(
                'id' => 'demo-content', // unique id of area used in do_action('area',...) call
                'name' => 'Demo Page Content', // public shown name
                'description' => 'A single demo area', // public description
                'postTypes' => array( 'post' ), // array of post types where this area is available to
                'pageTemplates' => array( 'default' ), // array of page template names where this area is available to
                'assignedModules' => array(), // array of classnames
                'layouts' => array( 'default', '2-columns', '3-columns' ),
                'dynamic' => false, // whether this is an dynamic area
                'manual' => true, // true if set by code
                'limit' => 0, // how many modules are allowed
                'order' => 0, // order index for sorting
                'context' => 'normal', // location on the edit screen,
                'sortable' => true
            )
        );
    }

    public function testHooksSetup()
    {
        $addInterface = has_action( 'edit_form_after_editor', array( $this->EditScreen, 'renderUserInterface' ) );
        $save = has_action( 'save_post', array( $this->EditScreen, 'save' ) );
        $footer = has_action( 'admin_footer', array( $this->EditScreen, 'toJSON' ) );
        $this->assertEquals( 10, $addInterface );
        $this->assertEquals( 10, $save );
        $this->assertEquals( 1, $footer );
    }

    public function testUserInterface()
    {
        $post = $this->factory->post->create_and_get();
        add_post_type_support( 'post', 'kontentblocks' );
        $out = $this->EditScreen->renderUserInterface( $post->post_type, $post );
        $out = $this->EditScreen->userInterface(  $post );
        $this->assertContains( "id='kontentblocks-core-ui'", $out );
        $this->assertContains( "</div> <!--end ks -->", $out );
        $this->assertContains( "id='demo-content'", $out );

    }

    public function tearDown()
    {
        parent::tearDown();
    }

}