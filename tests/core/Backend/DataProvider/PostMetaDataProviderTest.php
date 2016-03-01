<?php

namespace Kontentblocks\tests\core\Modules;

use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class ModuleWorkshopTest
 * @package Kontentblocks\tests\core\Modules
 */
class PostMetaDataProviderTest extends \WP_UnitTestCase
{

    public $post;

    public static function setUpBeforeClass()
    {
        \Kontentblocks\Hooks\Capabilities::setup();
    }


    public function setUp()
    {
        parent::setUp();
        $this->post = $this->factory->post->create();
    }

    public function testSetGet()
    {
        $provider = DataProviderService::getPostProvider($this->post);

        $provider->update('teststring1', 'test');
        $this->assertEquals('test', get_post_meta($this->post, 'teststring1', true));
        $this->assertEquals('test', $provider->get('teststring1'));

        $provider->add('teststring2', 'test');
        $this->assertEquals('test', get_post_meta($this->post, 'teststring2', true));
        $this->assertEquals('test', $provider->get('teststring2'));

    }

    public function testDelete()
    {
        $provider = DataProviderService::getPostProvider($this->post);
        $provider->update('teststring1', 'test');
        $this->assertEquals('test', get_post_meta($this->post, 'teststring1', true));
        $this->assertEquals('test', $provider->get('teststring1'));

        $provider->delete('teststring1');

        $this->assertEquals('', get_post_meta($this->post, 'teststring1', true));
        $this->assertNull($provider->get('teststring'));


    }


}