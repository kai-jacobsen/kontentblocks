<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\ChangeArea;
use Kontentblocks\Ajax\Actions\ChangeModuleStatus;
use Kontentblocks\Ajax\Actions\GetSanitizedId;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class GetSanitizedIdTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class GetSanitizedIdTest extends \WP_UnitTestCase
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

    public function testRunWithAreas()
    {

        $data = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'areas'
        );

        $Request = new ValueStorage( $data );
        $Response = GetSanitizedId::run( $Request );

        $this->assertTrue( $Response->getStatus() );
        $this->assertEquals( 'kb_da_my_perky_id', $Response->getData()['id'] );

    }

    public function testRunWithExistingArea()
    {
        $this->factory->post->create(array(
            'post_type' => 'kb-dyar',
            'post_name' => 'kb_da_my_perky_id'
        ));

        $data = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'areas'
        );

        $Request = new ValueStorage( $data );
        $Response = GetSanitizedId::run( $Request );

        $this->assertFalse( $Response->getStatus() );
    }

    public function testRunWithTemplates()
    {

        $data = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'templates'
        );

        $Request = new ValueStorage( $data );
        $Response = GetSanitizedId::run( $Request );

        $this->assertTrue( $Response->getStatus() );
        $this->assertEquals( 'kb_tpl_my_perky_id', $Response->getData()['id'] );

    }

    public function testRunWithExistingTemplate()
    {
        $this->factory->post->create(array(
            'post_type' => 'kb-mdtpl',
            'post_name' => 'kb_tpl_my_perky_id'
        ));

        $data = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'templates'
        );

        $Request = new ValueStorage( $data );
        $Response = GetSanitizedId::run( $Request );

        $this->assertFalse( $Response->getStatus() );
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