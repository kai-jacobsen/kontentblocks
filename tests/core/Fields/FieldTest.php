<?php

namespace core\Fields;

use ReflectionClass;

/**
 * Class FieldTest
 * @package core\Fields
 */
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
        $this->TestField->setValue( 'Testvalue' );
        $this->TestField->setArgs(
            array(
                'label' => 'Testlabel',
                'description' => 'Testdescription',
                'callbacks' => array(
                    'output' => array( $this, 'outputCallback' ),
                    'input' => array( $this, 'invalid' )
                ),
                'conditions' => array(
                    'viewfile' => array('test.tpl')
                )
            )
        );

    }

    public function testGetValue()
    {
        $this->assertEquals( $this->TestField->getValue(), 'Testvalue' );

    }

    public function testGetUserValue()
    {
        // output callback calls strtoupper
        $this->assertEquals( $this->TestField->getUserValue(), 'TESTVALUE' );

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

        $this->TestField->setBaseId( 'singleid', null );
        $this->assertEquals( $this->TestField->getBaseId(), 'singleid' );
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


    public function testValidCondition()
    {
        $viewfiles = $this->TestField->getCondition('viewfile');
        $this->assertContains('test.tpl', $viewfiles);

    }

    public function testInvalidCondition()
    {
        $this->assertFalse($this->TestField->getCondition('notSet'));
    }


    public function testInvalidCallback()
    {
        $this->assertEquals( $this->TestField->getCallback( 'input' ), null );
        $this->assertEquals( $this->TestField->getCallback( 'invalidType' ), null );
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
        $this->assertTrue( $this->TestField->setArgs( array( 'label' => 'Another' ) ) );
        $this->assertEquals( $this->TestField->getArg( 'label' ), 'Another' );
        $this->assertFalse( $this->TestField->setArgs( array() ) );
    }


    /*
     * ----------------------------------
     * Helper
     * ----------------------------------
     */


    public function outputCallback( $value )
    {
        return strtoupper( $value );
    }

    public function tearDown()
    {
        parent::tearDown();
    }

}