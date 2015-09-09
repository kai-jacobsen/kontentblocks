<?php

namespace Kontentblocks\tests\core\Fields;


use Kontentblocks\Kontentblocks;

class FieldFormTest extends \WP_UnitTestCase
{

    public $TestField;

    public $TestForm;

    public function setUp()
    {
        $Registry = Kontentblocks::getService( 'registry.fields' );
        $this->TestField = $Registry->getField( 'text', 'dummyid', 'dummysubkey', 'okey' );
        $this->TestField->setData( 'Testvalue' );
        $this->TestField->setArgs(
            array(
                'label' => 'Testlabel',
                'description' => 'Testdescription',
                'placeholder' => 'Placeholder',
                'callbacks' => array(
                    'output' => array( $this, 'outputCallback' ),
                    'input' => array( $this, 'invalid' )
                )
            )
        );


        $this->TestForm = new \Kontentblocks\Fields\FieldFormController( $this->TestField );

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

        $this->assertEquals( $this->TestForm->getFieldName( $seg1, $seg2, $seg3 ), $expected );

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

    public function testGetPlaceholder()
    {
        $this->assertEquals( $this->TestForm->getPlaceholder( 'Placeholder' ), 'Placeholder' );
    }

    public function testGetInputFieldid()
    {
        $this->assertEquals( $this->TestForm->getInputFieldId(), 'dummyid_okey' );

    }

}