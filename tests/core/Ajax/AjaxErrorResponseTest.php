<?php
namespace Kontentblocks\tests\core\Ajax;

use Kontentblocks\Ajax\AjaxErrorResponse;

/**
 * Class AjaxCallbackHandlerTest
 * @package core\Ajax
 */
class AjaxErrorResponseTest extends \WP_UnitTestCase
{

    public $Response;

    public function setUp()
    {
        parent::setUp();

        $this->Response = new AjaxErrorResponse(
            'Success message', array(
                'data' => 'Some string'
            )
        );
    }

    public function testGetMessage()
    {
        $this->assertEquals( $this->Response->getMessage(), 'Success message' );
    }

    public function testGetStatus()
    {
        $this->assertFalse( $this->Response->getStatus() );
    }

    public function testGetData()
    {
        $data = $this->Response->getData();
        $this->assertEquals( $data['data'], 'Some string' );
    }

    public function tearDown()
    {
        parent::tearDown();
    }


}