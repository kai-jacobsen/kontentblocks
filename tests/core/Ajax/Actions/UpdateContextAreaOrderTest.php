<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\UpdateContextAreaOrder;
use Kontentblocks\Common\Data\ValueStorage;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class UpdateContextAreaOrderTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class UpdateContextAreaOrderTest extends \WP_UnitTestCase
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

        $this->post = $this->factory->post->create_and_get();


    }

    public function testRunValid()
    {

        $_POST = array(
            'postId' => $this->post->ID,
            'areaId' => 'dump',
            'data' => array(
                'side' => array( 'dump' => '' )

            )
        );

        $response = UpdateContextAreaOrder::run( Request::createFromGlobals() );
        $this->assertTrue( $response->getStatus() );

    }

    public function testRunNoInvalidContext(){
        $_POST = array(
            'postId' => $this->post->ID,
            'areaId' => 'dump',
            'data' => array(
                'side' => array( 'dump' => '' ),
                'qwer' => array( 'dump' => '' )
            )
        );

        $failInvalidContext = UpdateContextAreaOrder::run( Request::createFromGlobals() );
        $this->assertFalse($failInvalidContext->getStatus());

    }

    public function testRunInvalidArea(){
        $_POST = array(
            'postId' => $this->post->ID,
            'areaId' => 'dump',
            'data' => array(
                'side' => array( 'dump' => '' ),
                'normal' => array( 'nonexisiting' => '' )
            )
        );

        $failInvalidContext = UpdateContextAreaOrder::run( Request::createFromGlobals() );
        $this->assertFalse($failInvalidContext->getStatus());

    }

    public function testRunNoArray(){
        $_POST = array(
            'postId' => $this->post->ID,
            'areaId' => 'dump',
            'data' => 'string'
        );

        $failNoArray = UpdateContextAreaOrder::run( Request::createFromGlobals() );
        $this->assertFalse($failNoArray->getStatus());

    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user( 0 );
    }


}