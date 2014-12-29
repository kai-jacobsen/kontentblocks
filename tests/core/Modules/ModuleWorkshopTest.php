<?php

namespace Kontentblocks\tests\core\Modules;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class ModuleWorkshopTest
 * @package Kontentblocks\tests\core\Modules
 */
class ModuleWorkshopTest extends \WP_UnitTestCase
{


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
        $this->assertEquals( 'undefined', $merged['area'] );
    }

    public function testCreate()
    {
        $update = $this->getWorkshop()->create();
        $this->assertTrue( $update );
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
        $this->assertEquals( 'Lorem Ipsum', $Module->getData( 'content' ) );
    }


    public function tearDown()
    {
        parent::tearDown();
    }


    private function getWorkshop()
    {
        $oldargs = array(
            'class' => 'ModuleText',
            'overrides' => array(
                'name' => 'Oldname'
            )
        );
        $args = array(
            'class' => 'ModuleText',
            'overrides' => array(
                'name' => 'Newname'
            )
        );

        return new ModuleWorkshop( new PostEnvironment( 1 ), $args, $oldargs );
    }

}