<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - HTML template signup form.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// Variables passed from caller.
[ $form_title, $message, $classes, $files ] = $variables;

// Exclude decorative wrappers when 'nostyles' option is true.
$decorative_markup = ! str_contains( $classes, 'is-style-nostyles' );
?>

<form name="signup" data-name="Signup Form" class="bigupForms__form <?php echo esc_attr( $classes ); ?>" method="post" accept-charset="utf-8" autocomplete="on">

	<header>
		<?php
			$title   = ( $title ) ? '<h3 id="aria_form-title" class="bigupForms__form_title">' . $title . '</h3>' . "\n" : '';
			$message = ( $message ) ? '<p id="aria_form-desc" class="bigupForms__form_message">' . $message . '</p>' . "\n" : '';
			echo $title . $message;
		?>
	</header>

	<div class="bigupForms__form_section">

		<input
			class="bigupForms__form_input saveTheBees"
			name="required_field"
			type="text"
			autocomplete="off"
			style="position:absolute;height:0;overflow:hidden;opacity:0;"
		>

		<?php if ( $decorative_markup ) : ?>
			<div class="bigupForms__form_inputWrap bigupForms__form_inputWrap-short">
		<?php endif ?>

				<input
					class="bigupForms__form_input"
					name="name"
					type="text"
					maxlength="100"
					title="Name"
					required aria-label="Name"
					placeholder="Name (required)"
					onfocus="this.placeholder=''"
					onblur="this.placeholder='Name (required)'"
				>

		<?php if ( $decorative_markup ) : ?>
				<span class="bigupForms__form_flag bigupForms__form_flag-hover"></span>
				<span class="bigupForms__form_flag bigupForms__form_flag-focus"></span>
			</div>
			<div class="bigupForms__form_inputWrap bigupForms__form_inputWrap-short">
		<?php endif ?>

				<input
					class="bigupForms__form_input"
					name="email" type="email"
					maxlength="100" title="Email"
					required aria-label="Email"
					placeholder="Email (required)"
					onfocus="this.placeholder=''"
					onblur="this.placeholder='Email (required)'"
				>

		<?php if ( $decorative_markup ) : ?>
				<span class="bigupForms__form_flag bigupForms__form_flag-hover"></span>
				<span class="bigupForms__form_flag bigupForms__form_flag-focus"></span>
			</div>
		<?php endif ?>

		<div className='bigupForms__form_controls'>
			<div className='bigupForms__form_buttonWrap'>
				<button class="button bigupForms__button-submit wp-element-button" type="submit" value="Submit" disabled>
					<span class="bigupForms__submitLabel-ready">
						<?php _e( 'Submit', 'bigup_forms' ); ?>
					</span>
					<span class="bigupForms__submitLabel-notReady">
						<?php _e( '[please wait]', 'bigup_forms' ); ?>
					</span>
				</button>
			</div>
		</div>

	</div>

	<footer>
		<div class="bigupForms__alert_output" style="display:none; opacity:0;"></div>
	</footer>

</form>
