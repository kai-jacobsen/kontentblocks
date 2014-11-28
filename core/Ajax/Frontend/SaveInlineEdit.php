<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\DataProvider\DataProviderController;

class SaveInlineEdit
{
    public static function run()
    {
        $data = $_POST['data'];
        $Handler = new DataProviderController( $data['postId'] );

        $old = $Handler->getModuleData( '_' . $data['module'] );

        if (!empty( $data['arraykey'] )) {
            $old[$data['arraykey']]['key'] = $data['data'];
        } else {
            $old[$data['key']] = $data['data'];
        }
        $Handler->saveModule( $data['module'], $old );

    }
}
