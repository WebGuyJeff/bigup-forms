import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import { LogoFile } from './svg'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { bigupFormsInlinedVars } from '../../js/common/_wp-inlined-script'
import './form-file-upload.scss'

if ( bigupFormsInlinedVars.debug ) {
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
