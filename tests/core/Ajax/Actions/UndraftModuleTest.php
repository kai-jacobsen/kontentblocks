<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\UndraftModule;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Modules\ModuleWorkshop;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class AfterAreaChangeTest
 */
class UndraftModuleTest extends \WP_UnitTestCase
{
    protected $postId;

    public static function setUpBeforeClass()
    {
        (!defined('DOING_AJAX')) ? define('DOING_AJAX', true) : null;
        add_filter(
            'wp_die_ajax_handler',
            array(__CLASS__, 'dump'),
            99
        );

        \Kontentblocks\Hooks\Capabilities::setup();

    }

    public static function dump()
    {
        return '__return_null';
    }

    public function setUp()
    {
        parent::setUp();
        $this->postId = $this->factory->user->create(array('role' => 'administrator'));
        wp_set_current_user($this->postId);

    }

    public function testRun()
    {
        $post = $this->factory->post->create_and_get();

        $workshop = new ModuleWorkshop(
            new PostEnvironment($post->ID, $post), array(
                'class' => 'ModuleText'
            )
        );

        $workshop->create();
        $module = $workshop->getDefinitionArray();

        $_POST = array(
            'postId' => $post->ID,
            'mid' => $module['mid'],
            'module' => $module
        );

        $Response = UndraftModule::run(Request::createFromGlobals());
        $this->assertTrue($Response->getStatus());
        $Storage = new ModuleStorage($post->ID);
        $def = $Storage->getModuleDefinition($module['mid']);
        $this->assertFalse($def['state']['draft']);
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}