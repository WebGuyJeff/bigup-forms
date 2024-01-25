<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Shortcode.
 *
 * This class handles all aspects of shortcode usage.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */
class Shortcode {


	/**
	 * This function is called by WordPress when the shortcode is used.
	 */
	public static function display_shortcode( $attrs = array() ) {

		wp_enqueue_script( 'bigup_forms_public_js' );
		wp_enqueue_style( 'bigup_forms_public_css' );

		if ( empty( $attrs['title'] ) ) {
			$attrs['title'] = false;
		}

		if ( empty( $attrs['message'] ) ) {
			$attrs['message'] = false;
		}

		if ( empty( $attrs['form'] ) ) {
			$attrs['form'] = 'contact';
		}

		// get the form markup built with the passed vars.
		$form = Form_Generator::get_form( $attrs );
		return $form;
	}
}
