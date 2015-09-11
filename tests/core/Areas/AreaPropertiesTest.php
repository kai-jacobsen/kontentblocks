<?php


namespace Kontentblocks\tests\core\Areas;

use Kontentblocks\Areas\AreaProperties;


/**
 * Class AreaPropertiesTest
 */
class AreaPropertiesTest extends \WP_UnitTestCase
{

    /**
     * @var \Kontentblocks\Areas\AreaProperties
     */
    protected $area;

    public function setUp()
    {
        parent::setUp();

        $this->area = new AreaProperties(array(
            'id' => 'demo-content', // unique id of area used in do_action('area',...) call
            'name' => 'Demo Page Content', // public shown name
            'description' => 'A single demo area', // public description
            'postTypes' => array( 'post' ), // array of post types where this area is available to
            'pageTemplates' => array( 'default' ), // array of page template names where this area is available to
            'assignedModules' => array(), // array of classnames
            'layouts' => array( 'default', '2-columns', '3-columns' ),
            'dynamic' => false, // whether this is an dynamic area
            'manual' => true, // true if set by code
            'limit' => 0, // how many modules are allowed
            'order' => 0, // order index for sorting
            'context' => 'normal', // location on the edit screen,
            'sortable' => true
        ));

    }

    public function testGet()
    {
        $this->assertEquals('demo-content', $this->area->get('id'), 'Id should be demo-content');
    }

    public function testGetOnUndefined()
    {
        $this->assertNull($this->area->get('something'),'Undefined property should be null');
    }

    public function testConnect()
    {
        $this->area->connect('TestModule');
        $this->assertContains('TestModule', $this->area->get('assignedModules'));
    }

    public function testToString(){

        $this->assertEquals($this->area->get('id'), $this->area);
    }

    public function tearDown()
    {
        parent::tearDown();
    }


}