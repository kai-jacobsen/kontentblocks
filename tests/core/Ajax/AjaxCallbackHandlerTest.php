<?php
namespace Kontentblocks\tests\core\Ajax;

use Kontentblocks\Kontentblocks;

/**
 * Class AjaxCallbackHandlerTest
 * @package core\Ajax
 */
class AjaxCallbackHandlerTest extends \WP_UnitTestCase
{

    protected $userId;

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $this->userId );

    }


    public function testAddAction()
    {
        /** @var \Kontentblocks\Ajax\AjaxCallbackHandler $Handler */
        $Handler = Kontentblocks::getService( 'utility.ajaxhandler' );

        $Handler->registerAction( 'myAction', array( $this, 'testCallback' ) );
        $Handler->registerAction( 'anotherAction', array( $this, 'anotherTestCallback' ) );

        $this->assertTrue( $Handler->actionExists( 'myAction' ) );
        $this->assertTrue( $Handler->actionExists( 'anotherAction' ) );
        $this->assertFalse( $Handler->actionExists( 'nonExisitingAction' ) );
    }

    /**
     * Does not actually test the method
     * rather if the method did setup all core hooks properly
     * setupHooks runs on init hook
     * @dataProvider providerSetupHooks
     * @param $hook
     */
    public function testSetupHooks( $hook )
    {
        $this->assertTrue( has_action( 'wp_ajax_' . $hook ) );
    }


    public function providerSetupHooks()
    {
        return array(
            array( 'resortModules' )
        );
    }


    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user( 0 );

    }


}