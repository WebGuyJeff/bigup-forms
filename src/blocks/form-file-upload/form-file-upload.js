import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { LogoFile } from './svg'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { debug } from '../../common/_wp-inlined-script'

if ( debug ) {
	console.log( metadata.name + ' BLOCK LOADED' )
	// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes() 
}

/**
 * Register the block.
 */
registerBlockType( metadata.name, {
	...metadata,
	icon: LogoFile,

	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
} )
