<?php

namespace Kontentblocks\Interfaces;

interface DataHandlerInterface
{

    /**
     * Get the index of the attached modules
     * 
     * Returns an array of module definitions as arrays
     * @return array 
     */
    public function getIndex();

    /**
     * Saves the index to the database
     * 
     * @param index Full array of module Definitions
     * @return boolean Indicates whether update was successful or failed
     */
    public function saveIndex( $index );

    /**
     * Add a module definition to the index
     * Index should get updated  afterwards
     * @param string $id Unique id of module i.e. instance_id
     * @param array $args module definition array
     * @return boolean Indicates whether update was succesful or failed
     */
    public function addToIndex( $id, $args );
}
