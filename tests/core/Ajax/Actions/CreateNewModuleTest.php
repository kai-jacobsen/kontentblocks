<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\CreateNewModule;
use Kontentblocks\Ajax\Actions\UpdateModuleData;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class CreateNewModuleTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class CreateNewModuleTest extends \WP_UnitTestCase
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
                'id' => 'dump',
                'postTypes' => array('post')
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
                'area' => 'dump',
                'areaContext' => 'normal'
            )
        );

        $requestdata = $workshop->getDefinitionArray();

        $Response = CreateNewModule::run( new ValueStorage($requestdata));
        $this->assertTrue($Response->getStatus());
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