import { __ } from '@wordpress/i18n'
import { bigupFormsInlinedVars } from '../../js/common/_wp-inlined-script'
import { LogoForm } from './svg'

const Variations = [
	{
		name: 'contact',
		title: 'Contact Form',
		icon: LogoForm,
		description: __( 'Contact form.', 'bigup-forms' ),
		category: 'forms',
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
		icon: LogoForm,
		description: __( 'Sign-up form.', 'bigup-forms' ),
		category: 'forms',
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
		icon: LogoForm,
		description: __( 'Login form.', 'bigup-forms' ),
		category: 'forms',
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
