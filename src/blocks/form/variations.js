import { __ } from '@wordpress/i18n'
import { bigupFormsInlinedVars } from '../../js/common/_wp-inlined-script'
import { Logo } from './svg'

const { dataFormats } = bigupFormsInlinedVars

const Variations = [
	{
		name: 'contact',
		title: 'Contact Form',
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
		title: 'Sign-up Form',
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
		title: 'Login Form',
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
]

export { Variations }
