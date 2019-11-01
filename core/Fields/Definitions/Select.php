<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Select extends Field
{

    public static $settings = array(
        'type' => 'select',
        'forceSave' => true,
    );

    public function prepareTemplateData($data)
    {
        $options = $this->getArg('options', []);
        if (is_callable($options)) {
            $options = call_user_func($options, $this);

            if (!is_array($options)) {
                $options = [];
            }
            $this->setArgs(array('options' => $options));
        }

        if ($this->getArg('taxonomy', false)) {
            $terms = get_terms(['taxonomy' => $this->getArg('taxonomy'), 'hide_empty' => false]);
            $options = [];
            foreach ($terms as $term) {
                $options[] = [
                    'name' => $term->name,
                    'value' => $term->term_id
                ];
            }
            $this->setArgs(['options' => $options]);
        }

        if ($this->getArg('postType', false)) {
            $posts = get_posts(['post_type' => $this->getArg('postType'), 'posts_per_page' => -1]);
            $options = [];
            foreach ($posts as $post) {
                $options[] = [
                    'name' => $post->post_title,
                    'value' => $post->ID
                ];
            }
            $this->setArgs(['options' => $options]);
        }

        return $data;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        if (is_numeric($val)) {
            return filter_var($val, FILTER_SANITIZE_NUMBER_INT);
        } else if (is_string($val)) {
            return filter_var($val, FILTER_SANITIZE_STRING);
        }
        $options = $this->getArg('options', []);
        if (is_callable($options)) {
            $options = call_user_func($options, $this);

            if (!is_array($options)) {
                $options = [];
            }
        }


        if ($this->getArg('select2', false) && is_array($val)) {
            $collect = array();

            $toValue = $this->sortToValue($options);

            foreach ($val as $someValue) {
                if (isset($toValue[$someValue])) {
                    $collect[$someValue] = $toValue[$someValue];
                    unset($toValue[$someValue]);
                }
            }

            foreach (array_reverse($collect) as $item) {
                array_unshift($toValue, $item);
            }

            $this->setArgs(array('options' => $toValue));
        }


        return $val;
    }

    private function sortToValue($options)
    {
        $collect = array();
        foreach ($options as $option) {
            $collect[$option['value']] = $option;
        }
        return $collect;
    }

    /**
     * Fields saving method
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed
     */
    public function save($new, $old)
    {
        if ($this->getArg('select2', false)) {
            if ($this->getArg('multiple', false) === true) {
                if (!is_array($new)) {
                    $new = array();
                }
                if (is_array($old)) {
                    foreach (array_keys($old) as $index) {
                        if (!isset($new[$index])) {
                            $new[$index] = null;
                        }
                    }
//                    return $new;
                }
            }
        }

        if (is_null($new)) {
            return null;
        }

        if ($taxonomy = $this->getArg('taxonomy', false)) {
            if (!$this->getArg('multiple', false)) {
                if (!empty($new)) {
                    $new = [$new];
                }
            }
            if (!is_array($new)) {
                $new = [];
            }
            foreach ($new as $index => $maybeId) {
                if (!is_numeric($maybeId)) {
                    $newTerm = wp_insert_term($maybeId, $taxonomy);
                    if (is_wp_error($newTerm)) {
                        $term = get_term_by('slug', $maybeId, $taxonomy);
                        if (is_a($term, \WP_Term::class)) {
                            $new[$index] = $term->term_id;
                        }
                    }
                    if (is_array($newTerm) && isset($newTerm['term_id'])) {
                        $new[$index] = $newTerm['term_id'];
                    }
                }

                if (is_numeric($maybeId)) {
                    $new[$index] = absint($maybeId);
                }
            }

            if (!$this->getArg('multiple', false)) {
                if (is_array($new)) {
                    $new = current($new);
                }
            }
        }
        return $new;
    }
}