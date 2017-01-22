<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Panels\TermPanel;

/**
 * Purpose of this Class:
 *
 * This serves as a collection handler for fields and offers
 * methods to interact with registered fields.
 */
class TermPanelFieldSection extends StandardFieldSection
{


    /**
     * @var TermPanel
     */
    public $entity;

    /**
     * Set visibility of field based on environment vars given by the module
     * By following a hierachie: PostType -> PageTemplate -> AreaContext
     *
     * @param \Kontentblocks\Fields\Field $field
     *
     * @return void
     */
    public function markVisibility(Field $field)
    {

        $field->setVisibility(true);
        $callback = $field->getCondition('callback');
        if (is_callable($callback)){
            $res = call_user_func_array($callback,[$this,$field]);
            if ($res === false){
                $field->setVisibility(false);
                $this->decreaseVisibleFields();
                return;
            }
        }
        return;
    }


}
