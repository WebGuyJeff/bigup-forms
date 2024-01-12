import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { Logo } from './svg'
import Edit from './edit'
import save from './save'
import metadata from './block.json'

console.log( metadata.name + ' BLOCK LOADED' )
// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes()

registerBlockType(
	metadata.name,
	{
		...metadata,
		icon: Logo,
		variations: [
			{
				name: 'name',
				title: 'Name',
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
					'required': true
				},
				// If isActive is not set, the Editor cannot distinguish between the original block and your variation, so the original block information will be displayed.
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'name'
				}
			},
			{
				name: 'email',
				title: 'Email',
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
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'email'
				}
			},
			{
				name: 'phone',
				title: 'Phone',
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
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'phone'
				}
			},
			{
				name: 'message',
				title: 'Message',
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
					'format': 'none',
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'text-large'
				}
			},
			{
				name: 'custom',
				title: 'Custom',
				icon: Logo,
				description: __( 'Create a custom text input field.', 'bigup-forms' ),
				keywords: [ 'form', 'input', 'custom' ],
				attributes: {
					'type': 'text',
					'name': 'custom',
					'label': __( 'Custom', 'bigup-forms' ),
					'autocomplete': 'off',
					'placeholder': __( 'Type here', 'bigup-forms' ),
					'variation': 'custom',
					'format': 'none',
					'required': true
				},
				isActive: ( blockAttributes ) => { 
					return blockAttributes.variation === 'custom'
				}
			}
		],
		edit: Edit,
		save,
	}
)
