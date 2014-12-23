<?php

namespace core\Fields;


use Kontentblocks\Common\Data\ValueStorage;

/**
 * Class TestPostInputData
 * @package core\Fields
 */
class TestValueStorage extends \WP_UnitTestCase
{

    public function setUp()
    {
        parent::setUp();
    }

    public function testGetFiltered()
    {
        $data['testkey'] = '<scri<script>pt>asdf1234</script>';
        $Post = new ValueStorage( $data );

        $this->assertEquals( $Post->getFiltered( 'testkey', FILTER_SANITIZE_STRING ), 'asdf1234' );
        $this->assertEquals( $Post->getFiltered( 'testkey', FILTER_SANITIZE_NUMBER_INT ), 1234 );
        $this->assertNull( $Post->getFiltered( 'unset' ) );

    }

    public function testGet()
    {
        $data['testkey'] = '<scri<script>pt>asdf1234</script>';
        $Post = new ValueStorage( $data );

        $this->assertEquals( $Post->get( 'testkey' ), '<scri<script>pt>asdf1234</script>' );
        $this->assertNull( $Post->get( 'unset' ) );
    }


    public function tearDown()
    {
        parent::tearDown();
    }

}