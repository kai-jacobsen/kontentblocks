<?php

namespace Kontentblocks\Utils;

class GlobalData
{

    protected $templates;
    protected $areas;

    public function __construct()
    {
        $this->templates = $this->_setupTemplates();
    }

    public function getTemplate( $id )
    {
        if ( isset( $this->templates[ $id ] ) ) {
            return $this->templates[ $id ];
        }
        else {
            return null;
        }

    }
    
    private function _setupTemplates(){
        return get_option('kb_block_templates');
    }

}
