<?php

namespace Kontentblocks\tests\core\Backend\Screen;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\EditScreens\PostEditScreen;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class EditScreenTest
 * @package Kontentblocks\tests\core\Backend\Screen
 */
class EditScreenTest extends \WP_UnitTestCase
{

    /**
     * @var PostEditScreen
     */
    private $EditScreen;

    public static function setUpBeforeClass()
    {
        (!defined('DOING_AJAX')) ? define('DOING_AJAX', true) : null;
        add_filter(
            'wp_die_ajax_handler',
            array(__CLASS__, 'dump'),
            99
        );
        \Kontentblocks\Hooks\Capabilities::setup();
        \Kontentblocks\registerArea(array(
            'id' => 'dump',
            'postTypes' => array('post')
        ));

        \Kontentblocks\registerArea(array(
            'id' => 'demo-content',
            'postTypes' => array('post')
        ));
    }

    public function setUp()
    {
        global $pagenow;
        $pagenow = 'post.php';
        parent::setUp();
        $this->EditScreen = new PostEditScreen();
        add_post_type_support('post', 'kontentblocks');

    }

    public function testHooksSetup()
    {
        $addInterface = has_action('add_meta_boxes', array($this->EditScreen, 'renderUserInterface'));
        $save = has_action('save_post', array($this->EditScreen, 'save'));
        $footer = has_action('admin_footer', array($this->EditScreen, 'toJSON'));
        $this->assertEquals(10, $addInterface);
        $this->assertEquals(5, $save);
        $this->assertEquals(1, $footer);
    }

    public function testUserInterface()
    {
        $post = $this->factory->post->create_and_get();
        $this->EditScreen->renderUserInterface($post->post_type, $post);
        $out = $this->EditScreen->userInterface();
        $this->assertContains("id='kontentblocks-core-ui'", $out);
        $this->assertContains("</div> <!--end ks -->", $out);
        $this->assertContains("id='demo-content'", $out);

    }

    public function tearDown()
    {
        parent::tearDown();
    }

}