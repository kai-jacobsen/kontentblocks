<?php
namespace Kontentblocks\Backend\DataProvider;

/**
 * Interface DataProviderInterface
 * @package Kontentblocks\Backend\DataProvider
 */
interface DataProviderInterface
{

    public function __construct( $postId );

    public function get( $key );

    public function update( $key, $value );

    public function add( $key, $value );

    public function delete( $key );

} 