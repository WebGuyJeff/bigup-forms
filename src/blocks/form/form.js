import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { LogoForm } from './svg'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { Variations } from './variations'
import { debug } from '../../common/_wp-inlined-script'
import './form.scss'

if ( debug ) {
	console.log( metadata.name + ' BLOCK LOADED' )
	// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes() 
}


/**
 * Register the block.
 */
registerBlockType( metadata.name, {
	...metadata,
	icon: LogoForm,
	styles: [
		{
			name: 'none',
			label: __( 'None' ),
			isDefault: true
		},
		{
			name: 'outline',
			label: __( 'Outline' )
		},
		{
			name: 'round',
			label: __( 'Round' )
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
	variations: Variations,
	edit: Edit,
	save,
} )
