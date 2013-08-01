<?php

/* Module_WYSIWYG.html */
class __TwigTemplate_68f90e8424ad72f9309618c80f45697a extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        if (isset($context["data"])) { $_data_ = $context["data"]; } else { $_data_ = null; }
        echo $_data_;
        echo "
";
    }

    public function getTemplateName()
    {
        return "Module_WYSIWYG.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  19 => 1,);
    }
}
