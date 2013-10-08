<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\GlobalData,
    Kontentblocks\Utils\MetaData;

class SortModules
{

    protected $postId;
    protected $areaId = null;
    protected $data;
    protected $old;
    protected $dataHandler;

    public function __construct()
    {

        if ( !isset( $_POST[ 'data' ] ) || !is_array( $_POST[ 'data' ] ) )
            wp_send_json_error( 'No valid data sent' );

        $this->postId      = $_POST[ 'post_id' ];
        $this->data        = $_POST[ 'data' ];
        $this->areaId      = $this->_getAreaId();
        $this->dataHandler = $this->_setupDataHandler();
        $this->old         = $this->_getOldData();


        $this->resort();

    }

    public function _setupDataHandler()
    {
        if ( $this->postId == -1 ) {
            return new GlobalData;
        }
        else {
            return new MetaData( $this->postId );
        }

    }

    public function _getAreaId()
    {
        if ( $this->postId == -1 ) {
            return $_POST[ 'area_id' ];
        }
        else {
            return null;
        }

    }

    public function _getOldData()
    {
        if ( is_a( $this->dataHandler, 'Kontentblocks\Utils\GlobalData' ) ) {
            return $this->dataHandler->getRawIndexForArea( $this->areaId);
        }
        elseif ( is_a( $this->dataHandler, 'Kontentblocks\Utils\MetaData' ) ) {
            return $this->dataHandler->getIndex();
        }

    }

    public function resort()
    {
        if ( is_a( $this->dataHandler, 'Kontentblocks\Utils\GlobalData' ) ) {
            $this->sortGlobal();
        }
        elseif ( is_a( $this->dataHandler, 'Kontentblocks\Utils\MetaData' ) ) {
            $this->sortPost();
        }

    }

    public function sortPost()
    {
        $new = array();
        
        foreach ( $this->data as $area => $string ):

            parse_str( $string, $result );

            foreach ( $result as $k => $v ):

                foreach ( $this->old as $id => $module ):

                    if ( $id === $k )
                        unset( $this->old[ $k ] );

                    if ( $module[ 'area' ] === $area && $module[ 'instance_id' ] === $k ):
                        $new[ $module[ 'instance_id' ] ] = $module;
                    endif;
                endforeach;
            endforeach;
        endforeach;

        $save = array_merge( $this->old, $new );
        $update = $this->dataHandler->saveIndex($new);
        wp_send_json($update);
    }

    public function sortGlobal()
    {
        $new = array();
        foreach ( $this->data as $area => $v ):

			parse_str( $v, $result );
		
			foreach ( $result as $k => $v ):

				foreach ( $this->old as $module ):

					if ( $module['instance_id'] == $k ):
						$new[$module['instance_id']] = $module;
					endif;
				endforeach;
			endforeach;
		endforeach;
        
        $update = $this->dataHandler->updateAreaInIndex($this->areaId, $new);
        wp_send_json($update);
            
    }

}
