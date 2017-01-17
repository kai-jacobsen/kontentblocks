<?php

namespace Kontentblocks\tests\core\Backend\Environment;

use Kontentblocks\Areas\AreaRegistry;
use Kontentblocks\Hooks\Capabilities;
use Kontentblocks\Kontentblocks;


/**
 */
class AreaRegistryTest extends \WP_UnitTestCase
{

    protected $userId;

    protected $post;

    protected $registry;

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
        add_post_type_support('page', 'kontentblocks');

        \Kontentblocks\registerArea(array(
            'id' => 'contentarea',
            'postTypes' => array('page'),
            'context' => 'normal'
        ));
        \Kontentblocks\registerArea(array(
            'id' => 'sidebararea',
            'postTypes' => array('page'),
            'context' => 'side'
        ));

        \Kontentblocks\registerArea(array(
            'id' => 'dynamicarea',
            'postTypes' => array('page'),
            'dynamic' => true
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
        set_current_screen('edit-post');
        $this->post = $this->factory->post->create_and_get(array('post_type' => 'page'));
        $this->registry = Kontentblocks::getService('registry.areas');
    }


    public function testRegistry()
    {
        $registry = new AreaRegistry();

        $registry->addArea(array(
            'id' => 'should be sanitized',
            'dynamic' => true
        ));
    }


    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}