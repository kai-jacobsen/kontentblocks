<?php

use Kontentblocks\Modules\Module;


/**
 * Class ModuleText
 */
class ModuleText extends Module
{

    public static $settings = array(
        'publicName' => 'WYSIWYG',
        'name' => 'TinyMCE instance',
        'description' => 'Demo Editor',
        'globalModule' => true,
        'asTemplate' => true,
        'views' => true,
        'connect' => array( 'normal', 'side' ),
        'id' => 'wysiwyg',
        'controls' => array(
            'width' => 600
        )
    );

    public function render()
    {
        return $this->View->render();
    }


    /**
     * Backend, user-facing output must be echoed here
     *
     */
    /*public function form()
    {
       We're using the built Fields API, which handles form creation by itself
    }*/


    /**
     * Whatever data should be stored for this module
     * must be returned here
     *
     * @param array $data actual $_POST data for this module
     * @param array $old previous data or empty array
     *
     * @return array
     *
     */
    /*public function save($data, $old)
    {
       We're using the built Fields API, which handles form creation by itself
    }*/

    /**
     *
     */
    public function fields()
    {
        $this->Fields->addGroup( 'editor', array( 'label' => 'Editor' ) )
                     ->addField(
                         'editor', // field type
                         'demotest', // field key
                         array(
                             'label' => 'Editor',
                             'returnObj' => 'Element',
                             'conditions' => array(
                                 'areaContext' => array( 'normal' ) // only visible in 'normal' area context
                             )
                         )
                     );

    }

}
