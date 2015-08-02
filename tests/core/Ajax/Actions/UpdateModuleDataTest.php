<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\DuplicateModule;
use Kontentblocks\Ajax\Actions\RemoveModules;
use Kontentblocks\Ajax\Actions\UpdateModuleData;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class UpdateModuleDataTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class UpdateModuleDataTest extends \WP_UnitTestCase
{

    public $userId;


    public static function setUpBeforeClass()
    {
        ( !defined( 'DOING_AJAX' ) ) ? define( 'DOING_AJAX', TRUE ) : null;
        add_filter(
            'wp_die_ajax_handler',
            array( __CLASS__, 'dump' ),
            99
        );
        \Kontentblocks\Hooks\Capabilities::setup();

        \Kontentblocks\registerArea(
            array(
                'id' => 'dump'
            )
        );
    }

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $this->userId );
    }


    public function testRun()
    {
        $post = $this->factory->post->create_and_get();

        $workshop = new ModuleWorkshop(
            new Environment( $post->ID, $post ), array(
                'class' => 'ModuleText',
                'area' => 'dump'
            )
        );

        $workshop->setData(
            array(
                'demotest' => 'Original string'
            )
        );

        $workshop->create();

        $data = array(
            'post_id' => $post->ID,
            'module' => $workshop->getDefinitionArray(),
            'data' => array(
                'demotest' => 'Manipulated string'
            )
        );

        $Response = UpdateModuleData::run( new ValueStorage( $data ) );
        $this->assertTrue( $Response->getStatus() );

        $Environment = new Environment( $post->ID, $post );
        $module = $Environment->getModuleById( $workshop->getNewId() );

        $this->assertEquals( $data['data']['demotest'], $module->model->get( 'demotest' ) );
    }


    public static function dump()
    {
        return '__return_null';
    }


    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user( 0 );
    }


}