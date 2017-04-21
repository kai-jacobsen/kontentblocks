<?php

namespace Kontentblocks\Common;


use Kontentblocks\Fields\FieldExport;

interface ExportableFieldInterface
{

    public function export(FieldExport $exporter);

}