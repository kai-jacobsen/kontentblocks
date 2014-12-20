<?php

namespace core\Fields;


class FieldForm
{

    public $TestField;

    public $TestForm;

    public function setUp()
    {
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


        $this->TestForm = new \Kontentblocks\Fields\FieldForm($this->TestField);

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

}