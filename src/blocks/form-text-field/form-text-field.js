import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { Logo } from './svg'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { wpInlinedVars } from '../../js/common/_wp-inlined-script'

console.log( metadata.name + ' BLOCK LOADED' )
// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes()

const { validationFormats } = wpInlinedVars

registerBlockType(
	metadata.name,
	{
		...metadata,
		icon: Logo,
		variations: [
			{
				name: 'number',
				title: 'Number Field',
				icon: Logo,
				description: __( 'Customisable input field for any number type.', 'bigup-forms' ),
				keywords: [ 'form', 'input', 'number' ],
				attributes: {
					'type': 'number',
					'name': 'number',
					'label': __( 'Number', 'bigup-forms' ),
					'autocomplete': 'off',
					'placeholder': __( 'Type here', 'bigup-forms' ),
					'variation': 'number',
					'format': 'any_number',
					'validation': validationFormats[ 'any_number' ].props,
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'number'
				}
			},
			{
				name: 'name',
				title: 'Name Field',
				icon: Logo,
				description: __( 'Name input field.', 'bigup-forms' ),
				keywords: [ 'form', 'input', 'name' ],
				attributes: {
					'type': 'text',
					'name': 'name',
					'label': __( 'Name', 'bigup-forms' ),
					'autocomplete': 'on',
					'placeholder': __( 'Enter your name', 'bigup-forms' ),
					'variation': 'name',
					'format': 'human_name',
					'validation': validationFormats[ 'human_name' ].props,
					'required': true
				},
				// If isActive is not set, the Editor cannot distinguish between the original block and your variation, so the original block information will be displayed.
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'name'
				}
			},
			{
				name: 'email',
				title: 'Email Field',
				icon: Logo,
				description: __( 'Email address input field.', 'bigup-forms' ),
				keywords: [ 'form', 'input', 'email' ],
				attributes: {
					'type': 'email',
					'name': 'email',
					'label': __( 'Email', 'bigup-forms' ),
					'autocomplete': 'on',
					'placeholder': __( 'Enter your email', 'bigup-forms' ),
					'variation': 'email',
					'format': 'email_non_rfc',
					'validation': validationFormats[ 'email_non_rfc' ].props,
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'email'
				}
			},
			{
				name: 'phone',
				title: 'Phone Field',
				icon: Logo,
				description: __( 'Phone number input field.', 'bigup-forms' ),
				keywords: [ 'form', 'input', 'phone' ],
				attributes: {
					'type': 'tel',
					'name': 'phone',
					'label': __( 'Phone', 'bigup-forms' ),
					'autocomplete': 'on',
					'placeholder': __( 'Enter your phone number', 'bigup-forms' ),
					'variation': 'phone',
					'format': 'phone_number',
					'validation': validationFormats[ 'phone_number' ].props,
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'phone'
				}
			},
			{
				name: 'message',
				title: 'Message Field',
				icon: Logo,
				description: __( 'Message input field.', 'bigup-forms' ),
				keywords: [ 'form', 'input', 'message' ],
				attributes: {
					'type': 'textarea',
					'name': 'message',
					'label': __( 'Message', 'bigup-forms' ),
					'autocomplete': 'off',
					'placeholder': __( 'Type your message...', 'bigup-forms' ),
					'variation': 'message',
					'format': 'any_text',
					'validation': validationFormats[ 'any_text' ].props,
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'text-large'
				}
			}
		],
		edit: Edit,
		save,
	}
)
