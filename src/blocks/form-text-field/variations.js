import { __ } from '@wordpress/i18n'
import { bigupFormsInlinedVars } from '../../js/common/_wp-inlined-script'
import {
	LogoEmail,
	LogoName,
	LogoNumber,
	LogoTel,
	LogoText,
	LogoTextarea,
	LogoUrl
} from './svg'

const { dataFormats } = bigupFormsInlinedVars

const Variations = [
	{
		name: 'text',
		title: __( 'Custom Text', 'bigup-forms' ),
		icon: LogoText,
		description: __( 'Customisable input field for any text type.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'text' ],
		attributes: {
			'InputTag': 'input',
			'type': 'text',
			'name': 'text',
			'label': __( 'Text', 'bigup-forms' ),
			'autocomplete': 'off',
			'placeholder': __( 'Type here', 'bigup-forms' ),
			'variation': 'text',
			'format': 'any_text',
			'required': true,
			...dataFormats[ 'any_text' ].rules
		},
		validationAttrs: Object.keys( dataFormats[ 'any_text' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'text'
		}
	},
	{
		name: 'number',
		title: __( 'Custom Number', 'bigup-forms' ),
		icon: LogoNumber,
		description: __( 'Customisable input field for any number type.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'number' ],
		attributes: {
			'InputTag': 'input',
			'type': 'number',
			'name': 'number',
			'label': __( 'Number', 'bigup-forms' ),
			'autocomplete': 'off',
			'placeholder': __( 'Type here', 'bigup-forms' ),
			'variation': 'number',
			'format': 'any_number',
			'required': true,
			...dataFormats[ 'any_number' ].rules
		},
		validationAttrs: Object.keys( dataFormats[ 'any_number' ].rules ),
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
			'InputTag': 'input',
			'type': 'text',
			'name': 'name',
			'label': __( 'Name', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter your name', 'bigup-forms' ),
			'variation': 'name',
			'format': 'human_name',
			'required': true,
			...dataFormats[ 'human_name' ].rules
		},
		validationAttrs: Object.keys( dataFormats[ 'human_name' ].rules ),
		// If isActive is not set, the Editor cannot distinguish between the original block and your variation, so the original block information will be displayed.
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
			'InputTag': 'input',
			'type': 'email',
			'name': 'email',
			'label': __( 'Email', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter your email', 'bigup-forms' ),
			'variation': 'email',
			'format': 'email_non_rfc',
			'required': true,
			...dataFormats[ 'email_non_rfc' ].rules
		},
		validationAttrs: Object.keys( dataFormats[ 'email_non_rfc' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'email'
		}
	},
	{
		name: 'phone',
		title: __( 'Phone', 'bigup-forms' ),
		icon: LogoTel,
		description: __( 'Phone number input field.', 'bigup-forms' ),
		keywords: [ 'form', 'input', 'phone' ],
		attributes: {
			'InputTag': 'input',
			'type': 'tel',
			'name': 'phone',
			'label': __( 'Phone', 'bigup-forms' ),
			'autocomplete': 'on',
			'placeholder': __( 'Enter your phone number', 'bigup-forms' ),
			'variation': 'phone',
			'format': 'phone_number',
			'required': true,
			...dataFormats[ 'phone_number' ].rules
		},
		validationAttrs: Object.keys( dataFormats[ 'phone_number' ].rules ),
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
			'InputTag': 'textarea',
			'type': 'textarea',
			'name': 'message',
			'label': __( 'Message', 'bigup-forms' ),
			'autocomplete': 'off',
			'placeholder': __( 'Type your message...', 'bigup-forms' ),
			'variation': 'message',
			'format': 'any_text',
			'rows': '8',
			'required': true,
			...dataFormats[ 'any_text' ].rules
		},
		validationAttrs: Object.keys( dataFormats[ 'any_text' ].rules ),
		isActive: ( blockAttributes ) => { 
			return blockAttributes.variation === 'message'
		}
	}
]

export { Variations }
