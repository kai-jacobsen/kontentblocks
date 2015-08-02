<?php

namespace Kontentblocks\tests\core\Modules;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class ModuleWorkshopTest
 * @package Kontentblocks\tests\core\Modules
 */
class ModuleWorkshopTest extends \WP_UnitTestCase
{

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


    }

    public function testModuleDefinitionArgs()
    {
        $merged = $this->getWorkshop()->getDefinitionArray();
        // test recursive merge
        $this->assertEquals( 'Newname', $merged['overrides']['name'] );
        // test defaults
        $this->assertEquals( 'dump', $merged['area'] );
    }

    public function testCreate()
    {
        $update = $this->getWorkshop()->create();
        $this->assertTrue( $update );
    }

    public function testOldIdIsUnset()
    {
        $Workshop = $this->getWorkshop();
        $id = $Workshop->getNewId();
        $this->assertNotEquals( $id, 'some_old_id' );
    }

    public function testSetId()
    {
        $Workshop = $this->getWorkshop(array(
            'mid' => 'set_new_id'
        ));

        $this->assertEquals('set_new_id', $Workshop->getNewId());
    }

    public function testCreateisLocked()
    {
        $Workshop = $this->getWorkshop();
        $first = $Workshop->create();
        $second = $Workshop->create();

        $this->assertTrue( $first );
        $this->assertFalse( $second );

        $third = $Workshop->createAndGet();
        $this->assertFalse( $third );

        $Module = $Workshop->getModule();
        $this->assertInstanceOf( '\Kontentblocks\Modules\Module', $Module );


    }

    public function testModuleSetData()
    {
        $Workshop = $this->getWorkshop();
        $Workshop->setData(
            array(
                'content' => 'Lorem Ipsum'
            )
        );

        $Module = $Workshop->createAndGet();
        $this->assertInstanceOf( '\Kontentblocks\Modules\Module', $Module );
        $this->assertEquals( 'Lorem Ipsum', $Module->model->get( 'content' ) );
    }


    public function tearDown()
    {
        parent::tearDown();
    }


    private function getWorkshop( $cArgs = array() )
    {
        $oldargs = array(
            'class' => 'ModuleText',
            'mid' => 'some_old_id',
            'overrides' => array(
                'name' => 'Oldname'
            )
        );
        $args = array(
            'class' => 'ModuleText',
            'overrides' => array(
                'name' => 'Newname'
            ),
            'area' => 'dump'
        );

        $args = wp_parse_args( $cArgs, $args );

        $post = $this->factory->post->create_and_get();
        return new ModuleWorkshop( new Environment( $post->ID, $post ), $args, $oldargs );
    }

}