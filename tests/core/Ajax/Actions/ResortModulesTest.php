<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Common\Data\ValueStorage;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ResortModulesTest
 * @package core\Ajax
 */
class ResortModulesTest extends \WP_UnitTestCase
{

    public static function setUpBeforeClass()
    {
        (!defined('DOING_AJAX')) ? define('DOING_AJAX', true) : null;
        add_filter(
            'wp_die_ajax_handler',
            array(__CLASS__, 'dump'),
            99
        );
    }

    public static function dump()
    {
        return '__return_null';
    }

    public function setUp()
    {
        parent::setUp();
    }

    public function testRunInvalidData()
    {
        $_POST = array(
            'data' => '"module_52_2[]=2&module_52_3[]=3"',
            'postId' => '1'
        );
        $res = \Kontentblocks\Ajax\Actions\SortModules::run(Request::createFromGlobals());
        $this->assertFalse($res->getStatus());
    }

    public function testRunValidData()
    {
        $_POST = array(
            'data' => array(
                'demo-content' => "module_52_2[]=2&module_52_3[]=3",
                'side-content' => ""
            ),
            'postId' => '1'
        );

        $res = \Kontentblocks\Ajax\Actions\SortModules::run(Request::createFromGlobals());
        $this->assertTrue($res->getStatus());
    }

    public function tearDown()
    {
        parent::tearDown();
    }


}