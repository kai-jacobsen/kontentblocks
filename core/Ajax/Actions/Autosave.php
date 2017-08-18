<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\DataProvider\DataProvider;
use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Panels\PostPanel;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 *
 * Class Autosave
 *
 */
class Autosave extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     *
     * @since 0.1.0
     * @param Request $request
     * @return AjaxSuccessResponse|AjaxErrorResponse
     */
    protected static function action(Request $request)
    {
        $data = wp_unslash($request->request->get('data')); // remove slashes from ajax
        $postEnvironment = Utilities::getPostEnvironment($data['post_ID']);


        $panels = $postEnvironment->getPanels();
        $index = $postEnvironment->getStorage()->getIndex();

        $moduleBags = [];
        /** @var Module $module */
        foreach ($index as $module) {

            if (isset($data[$module['mid']])) {
                $moduleBags[$module['mid']] = $data[$module['mid']];
            }

        }


        $panelBags = [];

        /** @var PostPanel $panel */
        foreach ($panels as $panel) {
            if (isset($data[$panel->getId()])) {
                $panelBags[$panel->getId()] = $data[$panel->getId()];
            }
        }

        $revisions = wp_get_post_revisions($postEnvironment->getId());
        if (!is_array($revisions)) {
            return new AjaxErrorResponse('no revisions');
        }

        $current = current($revisions);
        $isAutosave = is_numeric(wp_is_post_autosave($current->ID));

        if (!$isAutosave) {
            return new AjaxErrorResponse('no autosave revision');
        }
//
        $dataProvider = new DataProvider($current->ID,'post');
        $moduleStorage = new ModuleStorage($current->ID, $dataProvider);
//
        $moduleStorage->saveIndex($index);
        $moduleStorage->saveModules($moduleBags);


        foreach ($panelBags as $k => $panelBag) {
            $dataProvider->update($k, $panelBag);
        }

        return new AjaxSuccessResponse('data saved to autosave revision');
    }

}
