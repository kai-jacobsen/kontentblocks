<?php

namespace core\Fields;


use Kontentblocks\Common\Data\PostInputData;
use Kontentblocks\Kontentblocks;

/**
 * Class TestPostInputData
 * @package core\Fields
 */
class TestPostInputData extends \WP_UnitTestCase
{

    public function setUp()
    {
        parent::setUp();
    }

    public function testGetFiltered()
    {
        $_POST['testkey'] = '<scri<script>pt>asdf1234</script>';
        $Post = new PostInputData();

        $this->assertEquals( $Post->getFiltered( 'testkey', FILTER_SANITIZE_STRING ), 'asdf1234' );
        $this->assertEquals( $Post->getFiltered( 'testkey', FILTER_SANITIZE_NUMBER_INT ), 1234 );
        $this->assertNull($Post->getFiltered('unset'));

    }

    public function testGet()
    {
        $_POST['testkey'] = '<scri<script>pt>asdf1234</script>';
        $Post = new PostInputData();

        $this->assertEquals( $Post->get( 'testkey' ), '<scri<script>pt>asdf1234</script>' );
        $this->assertNull($Post->get('unset'));
    }

    public function testMagicSet()
    {
        $Post = new PostInputData();
        $this->setExpectedException('BadMethodCallException');
        $Post->hello = 'some';
    }


    public function tearDown()
    {
        parent::tearDown();
    }


}