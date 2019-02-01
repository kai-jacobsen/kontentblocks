<?php

namespace Kontentblocks\tests\core\Fields;

use Kontentblocks\Kontentblocks;
use ReflectionClass;

/**
 * Class FieldTest
 * @package core\Fields
 */
class TextTest extends \WP_UnitTestCase
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    public $TestField;

    public function setUp()
    {
        parent::setUp();

        $Registry = Kontentblocks::getService('registry.fields');
        $this->TestField = $Registry->getField('text', 'dummyid', 'dummysubkey', 'okey');

    }

    public function testSetFormValue()
    {
        $input = '<script>alert("hello")</script>';
        $esc = $this->TestField->prepareFormValue($input);
        $this->assertEquals(esc_attr($input), $esc);
    }


    public function tearDown()
    {
        parent::tearDown();
    }

}