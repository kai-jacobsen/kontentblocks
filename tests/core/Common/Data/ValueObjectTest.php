<?php

namespace Kontentblocks\tests\core\Common\Data;

use Kontentblocks\Common\Data\ValueObject;


/**
 * Class TestPostInputData
 * @package core\Fields
 */
class ValueObjectTest extends \WP_UnitTestCase
{

    public $valueObject;

    public function setUp()
    {
        parent::setUp();
        $this->valueObject = new ValueObject([
            'string' => 'Hello World',
            'bool' => true
        ]);
    }


    public function testMagicGet()
    {
        $string = $this->valueObject->string;
        $this->assertEquals('Hello World', $string);
    }

    public function testOffsetGet(){
        $string = $this->valueObject['string'];
        $this->assertEquals('Hello World', $string);
    }

    public function testGet(){
        $string = $this->valueObject->get('string');
        $this->assertEquals('Hello World', $string);

        $default = $this->valueObject->get('undefined', 'udef');
        $this->assertEquals('udef', $default);
    }

    public function testSet(){
        $this->valueObject->reset()->set([
            'string' => 'Different'
        ]);
        $this->assertEquals('Different', $this->valueObject->get('string'));

    }

    public function tearDown()
    {
        parent::tearDown();
    }

}