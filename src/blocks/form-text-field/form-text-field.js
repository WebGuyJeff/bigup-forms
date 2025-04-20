import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { Variations } from './variations'
import { LogoText } from './svg'
import { bigupFormsInlinedVars } from '../../js/common/_wp-inlined-script'
import './form-text-field.scss'

if ( bigupFormsInlinedVars.debug ) {
	console.log( metadata.name + ' BLOCK LOADED' )
	// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes() 
}

registerBlockType(
	metadata.name,
	{
		...metadata,
		icon: LogoText,
		variations: Variations,
		edit: Edit,
		save,
	}
)
