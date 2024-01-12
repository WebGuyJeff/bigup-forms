import { __ } from '@wordpress/i18n'

const inputTypeConditionals = {
	'text': [
		'minlength',
		'maxlength',
		'pattern',
		'size'
	],
	'textarea': [
		'minlength',
		'maxlength',
		'pattern',
		'size',
		'rows'
	],
	'email': [
		'minlength',
		'maxlength',
		'pattern',
		'size'
	],
	'tel': [
		'minlength',
		'maxlength',
		'pattern',
		'size'
	],
	'password': [
		'minlength',
		'maxlength',
		'pattern',
		'size'
	],
	'url': [
		'minlength',
		'maxlength',
		'pattern',
		'size'
	],
	'number': [
		'min',
		'max',
		'step'
	],
	'date': [
		'min',
		'max'
	],
	'time': [
		'min',
		'max',
		'step'
	]
}

 export { inputTypeConditionals }
