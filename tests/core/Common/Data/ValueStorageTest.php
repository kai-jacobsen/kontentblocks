<?php

namespace Kontentblocks\tests\core\Common\Data;

use Kontentblocks\Common\Data\ValueStorage;


/**
 * Class TestPostInputData
 * @package core\Fields
 */
class ValueStorageTest extends \WP_UnitTestCase
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
        $Storage = new ValueStorage( $data );

        $this->assertEquals( $Storage->get( 'testkey' ), '<scri<script>pt>asdf1234</script>' );
        $this->assertNull( $Storage->get( 'unset', null ) );
    }

    public function testSet()
    {
        wp_unslash('das');
        $Storage = new ValueStorage();
        $Storage->set( 'hello', 'World!' );
        $this->assertEquals( 'World!', $Storage->get( 'hello' ) );
    }

    public function testDelete()
    {
        $Storage = new ValueStorage();
        $Storage->set( 'hello', 'World!' );
        $Storage->delete( 'hello' );
        $this->assertEquals( null, $Storage->get( 'hello', null ) );
    }

    public function testExport()
    {
        $Storage = new ValueStorage();
        $Storage->set(
            'hello',
            array(
                'who' => 'World'
            )
        );

        $export = $Storage->export();
        $this->assertEquals( 'World', $export['hello']['who'] );

    }


    public function testImportFromObject()
    {
        $obj = new \stdClass();
        $obj->array = array('what' => 'Hello');
        $obj->say = 'Hello';

        $Storage = new ValueStorage();
        $Storage->import($obj);

        $this->assertEquals('Hello', $Storage->get('array')['what']);
    }


    public function tearDown()
    {
        parent::tearDown();
    }

}