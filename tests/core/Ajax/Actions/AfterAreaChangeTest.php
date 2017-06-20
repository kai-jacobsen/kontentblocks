<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\AfterAreaChange;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Hooks\Capabilities;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class AfterAreaChangeTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class AfterAreaChangeTest extends \WP_UnitTestCase
{

    protected $userId;

    public static function setUpBeforeClass()
    {
        (!defined('DOING_AJAX')) ? define('DOING_AJAX', true) : null;
        add_filter(
            'wp_die_ajax_handler',
            array(__CLASS__, 'dump'),
            99
        );

        Capabilities::setup();
        Kontentblocks::getService('registry.modules')->add(TESTS_DIR . '/assets/ModuleText/ModuleText.php');

        \Kontentblocks\registerArea(array(
            'id' => 'dump'
        ));

    }

    public static function dump()
    {
        return '__return_null';
    }

    /**
     *
     */
    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create(array('role' => 'administrator'));
        wp_set_current_user($this->userId);

    }

    public function testRun()
    {
        $post = $this->factory->post->create_and_get();
        $workshop = new ModuleWorkshop(
            new PostEnvironment($post->ID, $post), array(
                'class' => 'ModuleHomeEvent',
                'area' => 'dump'
            )
        );

        $_POST = array(
            'postId' => $post->ID,
            'module' => $workshop->getDefinitionArray()
        );

        $Response = AfterAreaChange::run(Request::createFromGlobals());
        $this->assertTrue($Response->getStatus());
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}