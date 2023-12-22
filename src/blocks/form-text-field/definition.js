import { __ } from '@wordpress/i18n'

const definition = {
	'text': {
		'label': __( 'Text', 'bigup-forms' ),
		'placeholder': __( 'Type placeholder text', 'bigup-forms' ),
		'limits': [
			'minlength',
			'maxlength',
			'pattern',
			'size'
		]
	},
	'textarea': {
		'label': __( 'Text Large', 'bigup-forms' ),
		'placeholder': __( 'Type placeholder text', 'bigup-forms' ),
		'limits': [
			'minlength',
			'maxlength',
			'pattern',
			'size',
			'rows'
		]
	},
	'email': {
		'label': __( 'Email', 'bigup-forms' ),
		'placeholder': __( 'Type email placeholder text', 'bigup-forms' ),
		'limits': [
			'minlength',
			'maxlength',
			'pattern',
			'size'
		]
	},
	'tel': {
		'label': __( 'Phone', 'bigup-forms' ),
		'placeholder': __( 'Type phone placeholder text', 'bigup-forms' ),
		'limits': [
			'minlength',
			'maxlength',
			'pattern',
			'size'
		]
	},
	'password': {
		'label': __( 'Password', 'bigup-forms' ),
		'placeholder': __( 'Type password placeholder text', 'bigup-forms' ),
		'limits': [
			'minlength',
			'maxlength',
			'pattern',
			'size'
		]
	},
	'url': {
		'label': __( 'URL', 'bigup-forms' ),
		'placeholder': __( 'Type URL placeholder text', 'bigup-forms' ),
		'limits': [
			'minlength',
			'maxlength',
			'pattern',
			'size'
		]
	},
	'number': {
		'label': __( 'Number', 'bigup-forms' ),
		'limits': [
			'min',
			'max',
			'step'
		]
	},
	'date': {
		'label': __( 'Date', 'bigup-forms' ),
		'limits': [
			'min',
			'max'
		]
	},
	'time': {
		'label': __( 'Time', 'bigup-forms' ),
		'limits': [
			'min',
			'max',
			'step'
		]
	},
}

 export { definition }
