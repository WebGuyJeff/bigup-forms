import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { Logo } from './svg'
import './form.scss'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { wpInlinedVars } from '../../js/common/_wp-inlined-script'
import './form.scss'

if ( wpInlinedVars.debug ) {
	console.log( metadata.name + ' BLOCK LOADED' )
	// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes() 
}

/**
 * Register the block.
 */
registerBlockType( metadata.name, {
	...metadata,
	icon: Logo,
	styles: [
		{
			name: 'default',
			label: __( 'None' ),
			isDefault: true
		},
		{
			name: 'vanilla',
			label: __( 'Vanilla' )
		},
		{
			name: 'inset-dark',
			label: __( 'Inset Dark' )
		},
		{
			name: 'inset-light',
			label: __( 'Inset Light' )
		}
	],
	variations: [
		{
			name: 'contact',
			title: 'Contact',
			icon: Logo,
			description: __( 'Contact form.', 'bigup-forms' ),
			keywords: [ 'form', 'contact' ],
			attributes: {
				'variation': 'contact',
			},
			// If isActive is not set, the Editor cannot distinguish between the original block and your variation, so the original block information will be displayed.
			isActive: ( blockAttributes ) => { 
				return blockAttributes.variation === 'contact'
			}
		},
		{
			name: 'signup',
			title: 'Sign-up',
			icon: Logo,
			description: __( 'Sign-up form.', 'bigup-forms' ),
			keywords: [ 'form', 'signup' ],
			attributes: {
				'variation': 'signup',
			},
			isActive: ( blockAttributes ) => { 
				return blockAttributes.variation === 'signup'
			}
		},
		{
			name: 'login',
			title: 'Login',
			icon: Logo,
			description: __( 'Login form.', 'bigup-forms' ),
			keywords: [ 'form', 'login' ],
			attributes: {
				'variation': 'login',
			},
			isActive: ( blockAttributes ) => { 
				return blockAttributes.variation === 'login'
			}
		}
	],
	edit: Edit,
	save,
} )
