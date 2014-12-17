<?php

namespace core\Fields;

class FieldTest extends \WP_UnitTestCase
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    public $Field;

    public function setUp()
    {
        parent::setUp();

        $Registry = \Kontentblocks\Kontentblocks::getService( 'registry.fields' );
        $this->Field = $Registry->getField( 'text' );
        $this->Field->setKey( 'testkey' );
        $this->Field->setData( 'Testvalue' );
        $this->Field->setArgs(
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
        $key = $this->Field->getKey();
        $this->assertEquals( $key, 'testkey' );
    }

    /**
     * setkey() must raise an Exception if key was already set
     * key was already set in setUp method
     */
    public function testSetKeyWhenKeyAlreadySet()
    {
        $this->setExpectedException( 'LogicException' );
        $this->Field->setKey( 'overwrite' );
    }


    public function testValidCallback()
    {
        $this->assertEquals( is_callable( $this->Field->getCallback( 'output' ) ), true );
    }

    public function testInvalidCallback()
    {
        $this->assertEquals( $this->Field->getCallback( 'input' ), null );
        $this->assertEquals( $this->Field->getCallback( 'invalidType' ), null );
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