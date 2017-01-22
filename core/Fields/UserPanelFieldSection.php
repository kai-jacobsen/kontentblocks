<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Panels\TermPanel;
use Kontentblocks\Panels\UserPanel;

/**
 * Class UserPanelFieldSection
 */
class UserPanelFieldSection extends StandardFieldSection
{


    /**
     * @var UserPanel
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
