<?php

namespace Kontentblocks\tests\core\Backend\Environment;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Hooks\Capabilities;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;


/**
 * Class AfterAreaChangeTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class AfterAreaChangeTest extends \WP_UnitTestCase
{

    protected $userId;

    protected $post;

    /**
     * @var PostEnvironment
     */
    protected $environment;

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
        $this->post = $this->factory->post->create_and_get(array('post_type' => 'page'));
        $this->environment = Utilities::getPostEnvironment($this->post->ID);

    }


    public function testGetAreasforContext(){

        $normal = $this->environment->getAreasForContext('normal');
        $side = $this->environment->getAreasForContext('side');
        $none = $this->environment->getAreasForContext('none');

        $this->assertCount(1, $normal);
        $this->assertCount(1, $side);
        $this->assertCount(0, $none);
    }

    public function testGetAreaDefinition(){
        $content = $this->environment->getAreaDefinition('contentarea');
        $this->assertAttributeEquals('contentarea', 'id', $content);

        $fail = $this->environment->getAreaDefinition('none');
        $this->assertEquals(false,$fail);

    }

    public function testGetPostObject(){
        $obj = $this->environment->getPostObject();
        $hash1 = md5(json_encode($this->post));
        $hash2 = md5(json_encode($obj));
        $this->assertEquals($hash1, $hash2);
    }

    public function testStorageId(){
        $pid = $this->environment->getId();
        $this->assertEquals($this->post->ID, $pid);
    }

    public function testGetPageTemplate()
    {
        $tpl = $this->environment->getPageTemplate();
        $this->assertEquals('default', $tpl);

        update_post_meta($this->post->ID, '_wp_page_template', 'some-test-tpl.php');
        $tpl = $this->environment->getPageTemplate();
        $this->assertNotEquals('default', $tpl);
        $this->assertEquals('some-test-tpl.php', $tpl);

    }


    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}