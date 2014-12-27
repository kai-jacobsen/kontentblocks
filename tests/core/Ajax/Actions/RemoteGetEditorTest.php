<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\RemoteGetEditor;
use Kontentblocks\Common\Data\ValueStorage;


/**
 * Class RemoteGetEditorTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class RemoteGetEditorTest extends \WP_UnitTestCase
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

        $data = array(
            'editorId' => 'test_editor',
            'editorName' => 'test_editor_name',
            'editorContent' => 'Hello World!111!',
            'args' => array(
                'media_buttons' => false
            )
        );

        $Response = RemoteGetEditor::run( new ValueStorage( $data ) );
        $this->assertTrue( $Response->getStatus() );
        $this->assertContains( 'Hello World!111!', $Response->getData()['html'] );
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