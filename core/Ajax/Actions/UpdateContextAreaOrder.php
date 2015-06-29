<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class UpdateContextAreaOrder
 * Runs when area order inside a context changes
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class UpdateContextAreaOrder implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $Request )
    {

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $data = $Request->get( 'data' );

        $Environment = Utilities::getEnvironment( $postId );
        $DataProvider = $Environment->getDataProvider();
        $update = $DataProvider->update('kb.contexts', $data);

        if ($update) {
            new AjaxSuccessResponse( 'Area order updated', $data );
        } else {
            new AjaxErrorResponse( 'Area order not updated. There was an error', $data );
        }

    }
}
