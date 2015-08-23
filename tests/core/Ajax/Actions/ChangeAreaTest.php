<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\ChangeArea;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class ChangeAreaTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class ChangeAreaTest extends \WP_UnitTestCase
{
    protected $userId;

    public static function setUpBeforeClass()
    {
        ( !defined( 'DOING_AJAX' ) ) ? define( 'DOING_AJAX', TRUE ) : null;
        add_filter(
            'wp_die_ajax_handler',
            array( __CLASS__, 'dump' ),
            99
        );

        \Kontentblocks\Hooks\Capabilities::setup();

    \Kontentblocks\registerArea(array(
        'id' => 'dump'
    ));

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
                'class' => 'ModuleText'
            )
        );

        $workshop->create();
        $module = $workshop->getDefinitionArray();

        $data = array(
            'postId' => $post->ID,
            'area_id' => 'dump',
            'areaContext' => 'dump',
            'mid' => $module['mid']
        );

        $Request = new ValueStorage( $data );
        $Response = ChangeArea::run( $Request );
        $this->assertTrue( $Response->getStatus() );
        $Storage = new ModuleStorage( $post->ID );
        $def = $Storage->getModuleDefinition( $module['mid'] );
        $this->assertEquals( $def['area'], $data['area_id'] );
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