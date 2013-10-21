<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\Fieldgroup,
    Kontentblocks\Fields\FieldSingle;

class Refield
{

    protected $parentClassName;
    protected $moduleId;
    protected $structure;

    public function __construct( $module )
    {
        //TODO Check
        $this->parentClassName = get_class( $module );
        $this->moduleId        = $module->instance_id;
        $this->data            = $module->new_instance;
        return $this;

    }

    public function addGroup( $id )
    {
        if ( !$this->idExists( $id ) ) {
            $this->structure[ $id ] = new Fieldgroup( $id );
            return $this->structure[ $id ];
        }

    }

    public function idExists( $id )
    {
        // TODO Test for right inheritance / abstract class
        return (isset( $this->structure[ $id ] ));

    }

    public function addSingleField( $id )
    {
        if ( !$this->idExists( $id ) ) {
            $this->structure[ $id ] = new FieldSingle( $id );
            return $this->structure[ $id ];
        }

    }

    public function save($data)
    {
        $collection = array();
        foreach($this->structure as $definition){
            $definition->save($data);
        }
        d($collection);
        exit;
    }

    public function render()
    {
        echo "<pre>";
        foreach ( $this->structure as $definition ) {
            $this->renderSectionHeader( $definition );
            $this->renderSectionBody( $definition );
        }
        echo "</pre>";

    }

    public function renderSectionHeader( $definition )
    {
        echo "<h2>{$definition->id}</h2>";

    }

    public function renderSectionBody( $definition )
    {
        echo "<div>";
        $definition->render( $this->moduleId, $this->data );
        echo "</div>";

    }

}
