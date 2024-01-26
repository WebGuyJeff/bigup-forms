<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Template Builder.
 *
 * This class builds form templates.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */

class Form_Generator {

	/**
	 * Template file paths.
	 */
	private const PATHS = array(
		'contact' => BIGUPFORMS_PATH . 'parts/contact-form.php',
		'signup'  => BIGUPFORMS_PATH . 'parts/signup-form.php',
	);


	/**
	 * Get Form
	 *
	 * Includes the correct template with the variables.
	 *
	 * @param array $attrs Attributes passed by caller from widget/shortcode settings.
	 */
	public static function get_form( $attrs = array() ) {

		$template = self::PATHS[ $attrs['form'] ];

		if ( ! isset( $attrs['align'] ) ) {
			$align = '';
		} elseif ( 'middle' === $attrs['align'] ) {
			$align = 'aligncenter';
		} elseif ( 'left' === $attrs['align'] ) {
			$align = 'alignleft';
		} elseif ( 'right' === $attrs['align'] ) {
			$align = 'alignright';
		} else {
			$align = '';
		}

		$saved_settings   = get_option( 'bigup_forms_settings' );
		$nostyles         = $saved_settings['nostyles'] ?? false;
		$styles           = $saved_settings['styles'] ?? false;
		$files            = $saved_settings['files'] ?? false;
		$attrs['classes'] = '';

		// This needs a refactor to account for new styles e.g. ".is-style-inset-light".

		if ( $nostyles ) {
			$attrs['classes'] .= 'is-style-nostyles';
		} else {
			$attrs['classes'] .= $styles ? 'is-style-inset-dark' : 'is-style-vanilla';
		}
		$attrs['classes'] .= ' ' . $align;
		$attrs['files']    = isset( $attrs['files'] ) ? $attrs['files'] : $files;

		// Include the form template with the widget vars.
		$form = Util::include_with_vars( $template, $attrs );
		return $form;
	}
}
