<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\AfterAreaChange;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class AfterAreaChangeTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class AfterAreaChangeTest extends \WP_UnitTestCase
{

    protected $userId;

    public static function setUpBeforeClass()
    {
        ( !defined( 'DOING_AJAX' ) ) ? define( 'DOING_AJAX', TRUE ) : null;
        add_filter(
            'wp_die_ajax_handler',
            array( __CLASS__, 'dump' ),
            99
        );

        \Kontentblocks\Hooks\Capabilities::setup();
        Kontentblocks::getService( 'registry.modules' )->add( TESTS_DIR . '/assets/ModuleText.php' );

    }

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $this->userId );

    }

    public function testRun()
    {
        $post = $this->factory->post->create_and_get();
        $workshop = new ModuleWorkshop(
            new ModuleStorage( $post->ID ), array(
                'class' => 'ModuleText'
            )
        );

        $data = array(
            'post_id' => $post->ID,
            'module' => $workshop->getDefinitionArray()
        );

        $Response = AfterAreaChange::run( new ValueStorage( $data ) );
        $this->assertTrue( $Response->getStatus() );
    }


    public static function dump()
    {
        return '__return_null';
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user( 0 );
    }


}