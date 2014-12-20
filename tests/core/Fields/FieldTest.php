<?php

namespace core\Fields;

use ReflectionClass;

class FieldTest extends \WP_UnitTestCase
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    public $TestField;

    public function setUp()
    {
        parent::setUp();

        $Registry = \Kontentblocks\Kontentblocks::getService( 'registry.fields' );
        $this->TestField = $Registry->getField( 'text', 'dummyid', 'dummysubkey', 'okey' );
        $this->TestField->setData( 'Testvalue' );
        $this->TestField->setArgs(
            array(
                'label' => 'Testlabel',
                'description' => 'Testdescription',
                'callbacks' => array(
                    'output' => array( $this, 'outputCallback' ),
                    'input' => array( $this, 'invalid' )
                )
            )
        );

    }


    /**
     * getKey() should return the set key unmodified
     */
    public function testGetKey()
    {
        $key = $this->TestField->getKey();
        $this->assertEquals( $key, 'okey' );
    }

    /**
     * getBaseId()
     * return whatever string was set
     */
    public function testGetBaseId()
    {
        $id = $this->TestField->getBaseId();
        $this->assertEquals( $id, 'dummyid[dummysubkey]' );
    }

    /**
     *
     */
    public function testSetBaseId()
    {
        $this->TestField->setBaseId( 'changedid', 'sub' );
        $this->assertEquals( $this->TestField->getBaseId(), 'changedid[sub]' );
    }

    /**
     * getInputFieldId();
     * return whatever id was set
     */
    public function testGetFieldId()
    {
        $fid = $this->TestField->getFieldId();
        $this->assertEquals( $fid, 'dummyid' );
    }


    public function testValidCallback()
    {
        $this->assertEquals( is_callable( $this->TestField->getCallback( 'output' ) ), true );
    }

    public function testInvalidCallback()
    {
        $this->assertEquals( $this->TestField->getCallback( 'input' ), null );
        $this->assertEquals( $this->TestField->getCallback( 'invalidType' ), null );
    }

    /**
     * @dataProvider providerTestGetFieldName
     * @param mixed $seg1
     * @param mixed $seg2
     * @param mixed $seg3
     * @param string $expected
     */
    public function testGetFieldName( $seg1, $seg2, $seg3, $expected )
    {

        $this->assertEquals( $this->TestField->getFieldName( $seg1, $seg2, $seg3 ), $expected );

    }

    public function providerTestGetFieldName()
    {
        return array(
            array( null, null, null, 'dummyid[dummysubkey][okey]' ),
            array( true, null, null, 'dummyid[dummysubkey][okey][]' ),
            array( 'key1', true, null, 'dummyid[dummysubkey][okey][key1][]' ),
            array( 'key1', 'key2', null, 'dummyid[dummysubkey][okey][key1][key2]' ),
            array( 'key1', 'key2', true, 'dummyid[dummysubkey][okey][key1][key2][]' ),
            array( 'key1', true, 'key3', 'dummyid[dummysubkey][okey][key1][][key3]' )
        );
    }

    /**
     * createUID should always return the same
     */
    public function testCreateUID()
    {
        $id1 = $this->TestField->createUID();
        $id2 = $this->TestField->createUID();

        $this->assertEquals( $id1, $id2 );
    }

    public function testGetSetting()
    {
        // valid setting
        $this->assertEquals( $this->TestField->getSetting( 'type' ), 'text' );
        // invalid setting
        $this->assertEquals( $this->TestField->getSetting( 'invalid' ), null );

    }

    public function testGetArg()
    {
        // existing arg
        $this->assertEquals( $this->TestField->getArg( 'label' ), 'Testlabel' );

        // non existing, with default parameter
        $this->assertEquals( $this->TestField->getArg( 'something', 'default' ), 'default' );

    }

    public function testSetArgs()
    {
        $this->assertTrue($this->TestField->setArgs(array('label' => 'Another')));
        $this->assertFalse($this->TestField->setArgs(array()));
    }


    /*
     * ----------------------------------
     * Helper
     * ----------------------------------
     */


    public function outputCallback( $value )
    {
        return $value;
    }

    public function tearDown()
    {
        parent::tearDown();
    }

}