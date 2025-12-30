import { __ } from '@wordpress/i18n'
import { validationDefinitions } from '../../common/_wp-inlined-script'
import {
	LogoEmail,
	LogoName,
	LogoNumber,
	LogoTel,
	LogoText,
	LogoTextarea,
	LogoUrl
} from './svg'

const Variations = [
	{
		name: 'custom_text',
		title: __( 'Custom Text', 'bigup-forms' ),
		icon: LogoText,
		description: __( 'Custom text input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'text' ],
		attributes: {
			'HTMLTag': 'input',
			'type': 'text',
			'formFieldKey': 'custom_text',
			'label': __( 'Custom Text', 'bigup-forms' ),
			'autocomplete': 'off',
			'placeholder': __( 'Type here', 'bigup-forms' ),
			'variation': 'custom_text',
			'validationDefinition': 'custom_text',
			'required': true,
			...validationDefinitions[ 'custom_text' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'custom_text' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'text'
		}
	},
	{
		name: 'number',
		title: __( 'Number', 'bigup-forms' ),
		icon: LogoNumber,
		description: __( 'Number input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'number' ],
		attributes: {
			'HTMLTag': 'input',
			'type': 'number',
			'formFieldKey': 'number',
			'label': __( 'Number', 'bigup-forms' ),
			'autocomplete': 'off',
			'placeholder': __( 'Enter a number', 'bigup-forms' ),
			'variation': 'number',
			'validationDefinition': 'number',
			'required': true,
			...validationDefinitions[ 'number' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'number' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'number'
		}
	},
	{
		name: 'name',
		title: __( 'Name', 'bigup-forms' ),
		icon: LogoName,
		description: __( 'Name input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'name' ],
		attributes: {
			'HTMLTag': 'input',
			'type': 'text',
			'formFieldKey': 'name',
			'label': __( 'Name', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter a name', 'bigup-forms' ),
			'variation': 'name',
			'validationDefinition': 'name',
			'required': true,
			...validationDefinitions[ 'name' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'name' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'name'
		}
	},
	{
		name: 'email',
		title: __( 'Email', 'bigup-forms' ),
		icon: LogoEmail,
		description: __( 'Email address input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'email' ],
		attributes: {
			'HTMLTag': 'input',
			'type': 'email',
			'formFieldKey': 'email',
			'label': __( 'Email', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter an email', 'bigup-forms' ),
			'variation': 'email',
			'validationDefinition': 'email',
			'required': true,
			...validationDefinitions[ 'email' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'email' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'email'
		}
	},
	{
		name: 'url',
		title: __( 'URL', 'bigup-forms' ),
		icon: LogoUrl,
		description: __( 'URL input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'url' ],
		attributes: {
			'HTMLTag': 'input',
			'type': 'url',
			'formFieldKey': 'url',
			'label': __( 'URL', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter a URL', 'bigup-forms' ),
			'variation': 'url',
			'validationDefinition': 'url',
			'required': true,
			...validationDefinitions[ 'url' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'url' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'url'
		}
	},
	{
		name: 'phone',
		title: __( 'Phone', 'bigup-forms' ),
		icon: LogoTel,
		description: __( 'Phone number input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'phone' ],
		attributes: {
			'HTMLTag': 'input',
			'type': 'tel',
			'formFieldKey': 'phone',
			'label': __( 'Phone', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter a phone number', 'bigup-forms' ),
			'variation': 'phone',
			'validationDefinition': 'phone',
			'required': true,
			...validationDefinitions[ 'phone' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'phone' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'phone'
		}
	},
	{
		name: 'message',
		title: __( 'Message', 'bigup-forms' ),
		icon: LogoTextarea,
		description: __( 'Message input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'message' ],
		attributes: {
			'HTMLTag': 'textarea',
			'type': 'textarea',
			'formFieldKey': 'message',
			'label': __( 'Message', 'bigup-forms' ),
			'autocomplete': 'off',
			'placeholder': __( 'Type your message...', 'bigup-forms' ),
			'variation': 'message',
			'validationDefinition': 'message_body',
			'rows': '8',
			'required': true,
			...validationDefinitions[ 'message_body' ].rules
		},
		validationAttrs: Object.keys( validationDefinitions[ 'message_body' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'message'
		}
	}
]

export { Variations }
