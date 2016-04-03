<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\ChangeArea;
use Kontentblocks\Ajax\Actions\ChangeModuleStatus;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class ChangeModuleStatusTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class ChangeModuleStatusTest extends \WP_UnitTestCase
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
            new PostEnvironment( $post->ID, $post ), array(
                'class' => 'ModuleText'
            )
        );

        $workshop->create();
        $module = $workshop->getDefinitionArray();

        $_POST = array(
            'postId' => $post->ID,
            'module' => $module['mid']
        );

        $Response = ChangeModuleStatus::run( Request::createFromGlobals() );
        $this->assertTrue( $Response->getStatus() );
        $Storage = new ModuleStorage( $post->ID );
        $def = $Storage->getModuleDefinition( $module['mid'] );
        $this->assertFalse( $def['state']['active'] );
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