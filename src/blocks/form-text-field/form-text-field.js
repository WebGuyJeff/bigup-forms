import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { Variations } from './variations'
import { Logo } from './svg'
import { wpInlinedVars } from '../../js/common/_wp-inlined-script'

if ( wpInlinedVars.debug ) {
	console.log( metadata.name + ' BLOCK LOADED' )
	// RUN IN CONSOLE TO SEE REGISTERED BLOCKS: wp.blocks.getBlockTypes() 
}

registerBlockType(
	metadata.name,
	{
		...metadata,
		icon: Logo,
		variations: Variations,
		edit: Edit,
		save,
	}
)
