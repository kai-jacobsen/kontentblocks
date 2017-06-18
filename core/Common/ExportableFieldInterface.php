<?php

namespace Kontentblocks\Common;


use Kontentblocks\Fields\FieldExport;

/**
 * Interface ExportableFieldInterface
 * @package Kontentblocks\Common
 */
interface ExportableFieldInterface
{

    public function export(FieldExport $exporter);

}