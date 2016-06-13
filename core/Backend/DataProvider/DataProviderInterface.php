<?php
namespace Kontentblocks\Backend\DataProvider;

/**
 * Interface DataProviderInterface
 * @package Kontentblocks\Backend\DataProvider
 */
interface DataProviderInterface
{

    public function get( $key );

    public function getAll();

    public function update( $key, $value );

    public function add( $key, $value );

    public function delete( $key );

    public function reset();

    public function addSlashes();

} 