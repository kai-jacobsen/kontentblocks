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


    public function testGetFieldName()
    {
        $this->assertEquals( $this->TestField->getFieldName(), 'dummyid[dummysubkey][okey]' );
        $this->assertEquals( $this->TestField->getFieldName( true ), 'dummyid[dummysubkey][okey][]' );
        $this->assertEquals( $this->TestField->getFieldName( 'key1', true ), 'dummyid[dummysubkey][okey][key1][]' );
        $this->assertEquals(
            $this->TestField->getFieldName( 'key1', 'key2' ),
            'dummyid[dummysubkey][okey][key1][key2]'
        );
        $this->assertEquals(
            $this->TestField->getFieldName( 'key1', 'key2', true ),
            'dummyid[dummysubkey][okey][key1][key2][]'
        );
        $this->assertEquals(
            $this->TestField->getFieldName( 'key1', true, 'key3' ),
            'dummyid[dummysubkey][okey][key1][][key3]'
        );
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

}