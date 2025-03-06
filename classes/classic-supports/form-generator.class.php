<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Template Builder.
 *
 * This class builds form templates.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
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

		$saved_settings = get_option( 'bigup_forms_settings' );
		$nostyles       = $saved_settings['nostyles'] ?? false;
		$styles         = $saved_settings['styles'] ?? false;
		$files          = $saved_settings['files'] ?? false;
		$files          = isset( $attrs['files'] ) ? $attrs['files'] : $files;
		$classes        = '';
		$form_title     = $attrs['title'] ? $attrs['title'] : false;
		$message        = $attrs['message'] ? $attrs['message'] : false;

		// This needs a refactor to account for new styles e.g. ".is-style-inset-light".

		if ( $nostyles ) {
			$classes .= 'is-style-nostyles';
		} else {
			$classes .= $styles ? 'is-style-inset-dark' : 'is-style-vanilla';
		}
		$classes .= ' ' . $align;

		// Include the form template with the widget vars.
		$form = Util::include_with_vars(
			$template,
			array(
				$form_title,
				$message,
				$classes,
				$files,
			)
		);
		return $form;
	}
}
