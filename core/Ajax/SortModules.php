<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\GlobalData,
    Kontentblocks\Utils\MetaData;

class SortModules
{

    protected $postId;
    protected $data;
    protected $old;
    protected $dataHandler;

    public function __construct()
    {

        if ( !isset( $_POST[ 'data' ] ) || !is_array( $_POST[ 'data' ] ) )
            wp_send_json_error( 'No valid data sent' );

        $this->postId      = $_POST[ 'post_id' ];
        $this->data        = $_POST[ 'data' ];
        $this->dataHandler = $this->_setupDataHandler();
        $this->old         = $this->_getOldData();

        $this->resort();

    }

    public function _setupDataHandler()
    {
        if ( $this->postId == -1 ) {
            return new GlobalData();
        }
        else {
            return new MetaData( $this->postId );
        }

    }

    public function _getOldData()
    {
        return $this->dataHandler->getIndex();

    }

    public function resort()
    {
        $new = array();
        foreach ( $this->data as $area => $string ):

            parse_str( $string, $result );

            foreach ( $result as $k => $v ):
                foreach ( $this->old as $id => $module ):
                    if ( $id === $k ) {
                        unset( $this->old[ $k ] );
                    }

                    if ( $module[ 'area' ] === $area && $module[ 'instance_id' ] === $k ):
                        $new[ $module[ 'instance_id' ] ] = $module;
                    endif;
                endforeach;
            endforeach;
        endforeach;

        $save   = array_merge( $this->old, $new );
        $update = $this->dataHandler->saveIndex( $save );
        wp_send_json( $update );

    }

}
