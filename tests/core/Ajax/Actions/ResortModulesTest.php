<?php
namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Common\Data\ValueStorage;

/**
 * Class ResortModulesTest
 * @package core\Ajax
 */
class ResortModulesTest extends \WP_UnitTestCase
{

    public static function setUpBeforeClass()
    {
        (!defined('DOING_AJAX')) ? define( 'DOING_AJAX', TRUE ) : null;
        add_filter(
            'wp_die_ajax_handler',
            array( __CLASS__, 'dump' ),
            99
        );
    }

    public function setUp()
    {
        parent::setUp();
    }


    public function testRunInvalidData()
    {
        $res = \Kontentblocks\Ajax\Actions\SortModules::run( new ValueStorage() );
        $this->assertFalse( $res->getStatus() );
    }

    public function testRunValidData()
    {
        $data = array(
            'data' => array(
                'demo-content' => "module_52_2[]=2&module_52_3[]=3",
                'side-content' => ""
            ),
            'post_id' => '1'
        );

        $res = \Kontentblocks\Ajax\Actions\SortModules::run( new ValueStorage( $data ) );
        $this->assertTrue( $res->getStatus() );
    }

    public static function dump()
    {
        return '__return_null';
    }


    public function tearDown()
    {
        parent::tearDown();
    }


}