<?php
namespace Kontentblocks\tests\core\Ajax;

use Kontentblocks\Ajax\AjaxSuccessResponse;

/**
 * Class AjaxCallbackHandlerTest
 * @package core\Ajax
 */
class AjaxSuccessResponseTest extends \WP_UnitTestCase
{

    public $Response;

    public function setUp()
    {
        parent::setUp();

        $this->Response = new AjaxSuccessResponse(
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
        $this->assertTrue( $this->Response->getStatus() );
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