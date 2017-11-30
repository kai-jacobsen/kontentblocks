<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\ChangeArea;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Modules\ModuleWorkshop;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class ChangeAreaTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class ChangeAreaTest extends \WP_UnitTestCase
{
    protected $userId;

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
            'id' => 'dump'
        ));

    }

    public static function dump()
    {
        return '__return_null';
    }

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create(array('role' => 'administrator'));
        wp_set_current_user($this->userId);

    }

    public function testRun()
    {
        $post = $this->factory->post->create_and_get();

        $workshop = new ModuleWorkshop(
            new PostEnvironment($post->ID, $post), array(
                'class' => 'ModuleKitas'
            )
        );

        $workshop->create();
        $module = $workshop->getDefinitionArray();

        $_POST = array(
            'postId' => $post->ID,
            'area_id' => 'dump',
            'areaContext' => 'dump',
            'mid' => $module['mid']
        );

        $Response = ChangeArea::run(Request::createFromGlobals());
        $this->assertTrue($Response->getStatus());
        $Storage = new ModuleStorage($post->ID);
        $def = $Storage->getModuleDefinition($module['mid']);
        $this->assertEquals($def['area'], $_POST['area_id']);
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}