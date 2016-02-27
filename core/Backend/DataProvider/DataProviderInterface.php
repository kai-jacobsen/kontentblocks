<?php
namespace Kontentblocks\Backend\DataProvider;

/**
 * Interface DataProviderInterface
 * @package Kontentblocks\Backend\DataProviderController
 */
interface DataProviderInterface
{

    public function __construct( $postId );

    public function get( $key );

    public function getAll();

    public function update( $key, $value );

    public function add( $key, $value );

    public function delete( $key );

    public function reset();

    public function addSlashes();

} 