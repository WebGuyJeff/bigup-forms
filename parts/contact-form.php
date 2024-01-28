<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - HTML template contact form.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL3+
 * @link https://jeffersonreal.uk
 */

// Variables passed from caller.
[ $form_title, $message, $classes, $files ] = $variables;

// Exclude decorative wrappers when 'nostyles' option is true.
$decorative_markup = ! str_contains( $classes, 'is-style-nostyles' );
?>

<form name="contact" data-name="Contact Form" class="bigup__form <?php echo esc_attr( $classes ); ?>" method="post" accept-charset="utf-8" autocomplete="on">

	<header>
		<?php
			$form_title = ( $form_title ) ? '<h3 id="aria_form-title" class="bigup__form_title">' . $form_title . '</h3>' . "\n" : '';
			$message    = ( $message ) ? '<p id="aria_form-desc" class="bigup__form_message">' . $message . '</p>' . "\n" : '';
			echo $form_title . $message;
		?>
	</header>

	<div class="bigup__form_section">

		<input
			class="bigup__form_input saveTheBees"
			name="required_field"
			type="text"
			autocomplete="off"
			style="position:absolute;height:0;overflow:hidden;opacity:0;"
		>

		<div class="bigup__form_inputWrap bigup__form_inputWrap-short">
			<input
				class="bigup__form_input"
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
				<span class="bigup__form_flag bigup__form_flag-hover"></span>
				<span class="bigup__form_flag bigup__form_flag-focus"></span>
			<?php endif ?>
		</div>

		<div class="bigup__form_inputWrap bigup__form_inputWrap-short">
			<input
				class="bigup__form_input"
				name="email" type="email"
				maxlength="100" title="Email"
				required aria-label="Email"
				placeholder="Email (required)"
				onfocus="this.placeholder=''"
				onblur="this.placeholder='Email (required)'"
			>
			<?php if ( $decorative_markup ) : ?>
				<span class="bigup__form_flag bigup__form_flag-hover"></span>
				<span class="bigup__form_flag bigup__form_flag-focus"></span>
			<?php endif ?>
		</div>

		<div class="bigup__form_inputWrap bigup__form_inputWrap-wide">
			<textarea
				class="bigup__form_input"
				name="message"
				maxlength="3000"
				title="Message"
				rows="8"
				aria-label="Message"
				placeholder="Type your message here..."
				onfocus="this.placeholder=''"
				onblur="this.placeholder='Type your message...'"
			></textarea>
			<?php if ( $decorative_markup ) : ?>
				<span class="bigup__form_flag bigup__form_flag-hover"></span>
				<span class="bigup__form_flag bigup__form_flag-focus"></span>
			<?php endif ?>
		</div>

		<?php
		if ( true === ! ! $files ) {
			?>

			<div class="bigup__customFileUpload">
				<label class="bigup__customFileUpload_label">
					<input
						class="bigup__customFileUpload_input"
						title="Attach a File"
						type="file"
						name="files"
						multiple
					>
					<span class="bigup__customFileUpload_icon">
						<?php echo Util::get_contents( BIGUPFORMS_PATH . 'assets/svg/file.svg' ); ?>
					</span>	
					<?php _e( 'Attach file', 'bigup_forms' ); ?>
				</label>
				<div class="bigup__customFileUpload_output"></div>
				<template>
					<span class="bigup__customFileUpload_icon">
						<?php echo Util::get_contents( BIGUPFORMS_PATH . 'assets/svg/bin.svg' ); ?>
					</span>	
				</template>
			</div>

			<?php
		}
		?>

		<div className='bigup__form_controls'>
			<div className='bigup__form_buttonWrap'>
				<button class="button bigup__form_submit wp-element-button" type="submit" value="Submit" disabled>
					<span class="bigup__form_submitLabel-ready">
						<?php _e( 'Submit', 'bigup_forms' ); ?>
					</span>
					<span class="bigup__form_submitLabel-notReady">
						<?php _e( '[please wait]', 'bigup_forms' ); ?>
					</span>
				</button>
			</div>
		</div>

	</div>

	<footer>
		<div class="bigup__alert_output" style="display:none; opacity:0;"></div>
	</footer>

</form>
