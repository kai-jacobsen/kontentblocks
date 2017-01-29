<?php

namespace Kontentblocks\Common;


use Kontentblocks\Fields\FieldExport;

interface Exportable
{

    public function export(FieldExport $exporter);

}