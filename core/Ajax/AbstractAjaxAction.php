<?php

namespace Kontentblocks\Ajax;

use Symfony\Component\HttpFoundation\Request;

/**
 * Class AbstractAjaxAction
 * @package Kontentblocks\Ajax
 */
class AbstractAjaxAction implements AjaxActionInterface
{

    /**
     * @param Request $request
     * @return AjaxErrorResponse
     */
    public static function run(Request $request)
    {
        if (!self::canRun()) {
            return new AjaxErrorResponse('action is permitted');
        }
        return static::action($request);
    }

    /**
     * @return bool
     */
    private static function canRun()
    {
        if (!is_user_logged_in()) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        return true;
    }

    /**
     * @param Request $request
     * @return AjaxErrorResponse
     */
    protected static function action(Request $request)
    {
        return new AjaxErrorResponse('no action implemented');
    }
}