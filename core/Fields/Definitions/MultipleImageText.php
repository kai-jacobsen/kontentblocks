<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Templating\FieldTemplate;
use Kontentblocks\Utils\JSONBridge;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class MultipleImageText extends Field
{

    // Defaults
    public static $defaults = array(
        'returnObj' => false,
        'type' => 'mltpl-image-text'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        $tpl = new FieldTemplate('mltpl-image-text.twig', array());
        $tpl->render(true);
        $this->description();

    }

    public function outputFilter($data)
    {
        if (empty($data) || !is_array($data)) {
            return array();
        }
        $pre = array();
        foreach ($data as $item) {

            $item['imgsrc'] = (isset($item['imgid'])) ? wp_prepare_attachment_for_js($item['imgid']) : null;
            $pre[] = $item;
        }
        $data = $pre;
        $Bridge = JSONBridge::getInstance();
        $Bridge->registerFieldData($this->parentModuleId, $this->type, $data);

        return $data;
    }
}