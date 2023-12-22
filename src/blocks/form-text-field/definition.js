import { __ } from '@wordpress/i18n'

const definition = {
	'text': {
		'label': __('Text', 'bigup-forms'),
		'placeholder': __('type placeholder text', 'bigup-forms'),
		'validationAttrs': [
			'maxlength',
			'pattern',
		]
	},
	'textarea': {
		'label': __('Text Large', 'bigup-forms'),
		'placeholder': __('type placeholder text', 'bigup-forms'),
		'validationAttrs': [
			'maxlength',
		]
	},
	'password': {
		'label': __('Password', 'bigup-forms'),
		'placeholder': __('******', 'bigup-forms'),
		'validationAttrs': [
			'maxlength',
			'pattern',
		]
	},
	'email': {
		'label': __('Email', 'bigup-forms'),
		'placeholder': __('type email placeholder text', 'bigup-forms'),
		'validationAttrs': [
			'maxlength',
			'pattern',
		]
	},
	'number': {
		'label': __('Number', 'bigup-forms'),
		'validationAttrs': [
			"min",
			"max",
			'step'
		]
	},
	'tel': {
		'label': __('Phone', 'bigup-forms'),
		'placeholder': __('type placeholder text', 'bigup-forms'),
		'validationAttrs': [
			'maxlength',
			'pattern',
		]
	},
	'url': {
		'label': __('URL', 'bigup-forms'),
		'placeholder': __('https://url.placeholder.text', 'bigup-forms'),
		'validationAttrs': [
			'maxlength',
			'pattern',
		]
	},
	'date': {
		'label': __('Date', 'bigup-forms'),
		'validationAttrs': [
			"min",
			"max",
			'step'
		]
	},
	'time': {
		'label': __('Time', 'bigup-forms'),
		'validationAttrs': [
			"min",
			"max",
			'step'
		]
	},
}

 export { definition }
