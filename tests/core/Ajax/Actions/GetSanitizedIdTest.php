<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\GetSanitizedId;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class GetSanitizedIdTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class GetSanitizedIdTest extends \WP_UnitTestCase
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

        \Kontentblocks\Hooks\Capabilities::setup();

    }

    public static function dump()
    {
        return '__return_null';
    }

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create(array('role' => 'administrator'));
        wp_set_current_user($this->userId);

    }

    public function testRunWithAreas()
    {

        $_POST = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'areas'
        );

        $Response = GetSanitizedId::run(Request::createFromGlobals());

        $this->assertTrue($Response->getStatus());
        $this->assertEquals('kb_da_my_perky_id', $Response->getData()['id']);

    }

    public function testRunWithExistingArea()
    {
        $this->factory->post->create(array(
            'post_type' => 'kb-dyar',
            'post_name' => 'kb_da_my_perky_id'
        ));

        $_POST = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'areas'
        );

        $Response = GetSanitizedId::run(Request::createFromGlobals());

        $this->assertFalse($Response->getStatus());
    }

    /**
     *
     */
    public function testRunWithTemplates()
    {

        $_POST = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'gmodules'
        );

        $Response = GetSanitizedId::run(Request::createFromGlobals());

        $this->assertTrue($Response->getStatus());
        $this->assertEquals('kb_gm_my_perky_id', $Response->getData()['id']);

    }

    public function testRunWithExistingTemplate()
    {
        $this->factory->post->create(array(
            'post_type' => 'kb-gmd',
            'post_name' => 'kb_tpl_my_perky_id'
        ));

        $_POST = array(
            'inputvalue' => 'my perky id',
            'checkmode' => 'templates'
        );

        $Response = GetSanitizedId::run(Request::createFromGlobals());

        $this->assertFalse($Response->getStatus());
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user(0);
    }


}