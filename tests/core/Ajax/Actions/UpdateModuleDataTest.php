<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\UpdateModuleData;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleWorkshop;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class UpdateModuleDataTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class UpdateModuleDataTest extends \WP_UnitTestCase
{

    public $userId;


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

        $workshop->setData(
            array(
                'demotest' => 'Original string'
            )
        );

        $workshop->create();

        $_POST = array(
            'postId' => $post->ID,
            'module' => $workshop->getDefinitionArray(),
            'data' => array(
                'demotest' => 'Manipulated string'
            )
        );

        $Response = UpdateModuleData::run(Request::createFromGlobals());
        $this->assertTrue($Response->getStatus());

        $Environment = new PostEnvironment($post->ID, $post);
        $module = $Environment->getModuleRepository()->getModuleObject($workshop->getNewId());

        $this->assertEquals($_POST['data']['demotest'], $module->model->get('demotest'));
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}