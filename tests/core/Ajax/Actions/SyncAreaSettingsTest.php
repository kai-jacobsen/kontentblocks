<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\SyncAreaSettings;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class SyncAreaSettingsTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class SyncAreaSettingsTest extends \WP_UnitTestCase
{

    public static function setUpBeforeClass()
    {
        ( !defined( 'DOING_AJAX' ) ) ? define( 'DOING_AJAX', TRUE ) : null;
        add_filter(
            'wp_die_ajax_handler',
            array( __CLASS__, 'dump' ),
            99
        );
        \Kontentblocks\Hooks\Capabilities::setup();

    }

    public static function dump()
    {
        return '__return_null';
    }

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $this->userId );

        \Kontentblocks\registerArea(
            array(
                'id' => 'dump',
                'postTypes' => array( 'post' )
            )
        );

    }

    public function testRun()
    {
        $post = $this->factory->post->create_and_get();

        $settings = array(
            'foo' => 'bar',
            'active' => 1,
            'attached' => 'true',
            'bar' => 'foo'
        );

        $_POST = array(
            'postId' => $post->ID,
            'areaId' => 'dump',
            'settings' => $settings
        );

        $response = SyncAreaSettings::run(Request::createFromGlobals());
        $this->assertTrue( $response->getStatus() );

    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user( 0 );

    }


}