<?php

namespace Kontentblocks\tests\core\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\Actions\Frontend\ApplyContentFilter;
use Kontentblocks\Common\Data\ValueStorage;
use Symfony\Component\HttpFoundation\Request;


/**
 * Class AfterAreaChangeTest
 */
class ApplyContentFilterTest extends \WP_UnitTestCase
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

    }

    public function testRun()
    {
        $post = $this->factory->post->create();
        $_POST = array(
            'content' => 'Hello World',
            'postId' => $post
        );

        $Response = ApplyContentFilter::run(Request::createFromGlobals());
        $this->assertTrue($Response->getStatus());

        $filtered = $Response->getData()['content'];
        $this->assertContains('<p>Hello World</p>', $filtered);
    }

    public function tearDown()
    {
        parent::tearDown();
    }


}