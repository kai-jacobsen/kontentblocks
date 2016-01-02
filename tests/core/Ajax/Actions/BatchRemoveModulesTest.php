<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\BatchRemoveModules;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class BatchRemoveModulesTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class BatchRemoveModulesTest extends \WP_UnitTestCase
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

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $this->userId );

        \Kontentblocks\registerArea(array(
            'id' => 'dump',
            'postTypes' => array('post')
        ));

    }


    public function testRun()
    {
        $post = $this->factory->post->create_and_get();

        $mod1 = new ModuleWorkshop(
            new PostEnvironment( $post->ID, $post ), array(
                'class' => 'ModuleText',
                'area' => 'dump'
            )
        );

        $mod2 = new ModuleWorkshop(
            new PostEnvironment( $post->ID, $post ), array(
                'class' => 'ModuleText',
                'area' => 'dump'
            )
        );

        $mod1->create();
        $mod2->create();
        $module1 = $mod1->getDefinitionArray();
        $module2 = $mod2->getDefinitionArray();

        $data = array(
            'postId' => $post->ID,
            'modules' => array($module1['mid'], $module2['mid'])
        );

        $Response = BatchRemoveModules::run( new ValueStorage( $data ) );
        $this->assertTrue( $Response->getStatus() );

        $Storage = new ModuleStorage($post->ID);
        $mdef = $Storage->getModuleDefinition($module1['mid']);
        $this->assertFalse($mdef);
        $mdef2 = $Storage->getModuleDefinition($module2['mid']);
        $this->assertFalse($mdef2);

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