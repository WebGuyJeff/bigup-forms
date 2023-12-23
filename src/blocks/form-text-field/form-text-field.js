import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { Logo } from './svg'
import Edit from './edit'
import save from './save'
import metadata from './block.json'

console.log( metadata.name + ' BLOCK LOADED' )
// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes() 

/**
 * Register the block.
 */
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
				description: __( 'Name input field.' ),
				keywords: [ "form", "input", "name" ],
				attributes: {
					"type": "text",
					"name": "name",
					"label": "Name",
					"required": true,
					"autocomplete": "on",
					"placeholder": "Enter your name",
					"minlength": "2",
					"maxlength": "70",
					"variation": "name"
				},
				isActive: ( blockAttributes, variationAttributes ) => { 
					return blockAttributes.variation === "name"
				}
			},
			{
				name: 'email',
				title: 'Email',
				icon: Logo,
				description: __( 'Email address input field.' ),
				keywords: [ "form", "input", "email" ],
				attributes: {
					"type": "email",
					"name": "email",
					"label": "Email",
					"required": true,
					"autocomplete": "on",
					"placeholder": "Enter your email",
					"minlength": "6",
					"maxlength": "320",
					/*
					 * @link https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
					 * Unescaped regex: ^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$
					 */
					"pattern": '^(([^<>()[\\]\\\\.,;:\\s@\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\"]+)*)|.(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
					"variation": "email"
				},
				isActive: ( blockAttributes, variationAttributes ) => { 
					return blockAttributes.variation === "email"
				}
			},
			{
				name: 'phone',
				title: 'Phone',
				icon: Logo,
				description: __( 'Phone number input field.' ),
				keywords: [ "form", "input", "phone" ],
				attributes: {
					"type": "tel",
					"name": "phone",
					"label": "Phone",
					"required": true,
					"autocomplete": "on",
					"placeholder": "Enter your phone number",
					"minlength": "6",
					"maxlength": "29",
					// Unescaped regex: ^(\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$
					"pattern": '^(\\+[1-9]{1}[0-9]{3,14})?([0-9]{9,14})$',
					"variation": "phone"
				},
				isActive: ( blockAttributes, variationAttributes ) => { 
					return blockAttributes.variation === "phone"
				}
			}
		],
		edit: Edit,
		save,
	}
)
