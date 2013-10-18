<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\Fieldgroup,
    Kontentblocks\Fields\FieldSingle;

class Refield
{

    protected $structure;

    public function __construct($instance_id)
    {
        d($instance_id);
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
        $definition->render();
        echo "</div>";

    }

}
