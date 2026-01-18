import { __ } from '@wordpress/i18n'
import { registerBlockType } from '@wordpress/blocks'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { Variations } from './variations'
import { LogoText } from './svg'
import { debug } from '../../common/_wp-inlined-script'

if ( debug ) {
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
