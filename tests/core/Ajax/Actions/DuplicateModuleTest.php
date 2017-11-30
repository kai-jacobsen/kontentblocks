<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\DuplicateModule;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleWorkshop;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class DuplicateModuleTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class DuplicateModuleTest extends \WP_UnitTestCase
{

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
                'class' => 'ModuleKitas',
                'area' => 'dump'
            )
        );

        $workshop->create();
        $module = $workshop->getDefinitionArray();

        $_POST = array(
            'postId' => $post->ID,
            'module' => $module['mid'],
            'class' => $module['class']
        );

        $Response = DuplicateModule::run(Request::createFromGlobals());
        $this->assertTrue($Response->getStatus());

    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);

    }


}