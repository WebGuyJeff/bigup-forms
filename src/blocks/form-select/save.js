import { __ } from '@wordpress/i18n'
import { useBlockProps, RichText } from '@wordpress/block-editor'

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save( { attributes } ) {

	const {
		blockId,
		label,
		showLabel,
		name,
		options,
		defaultText
	}                = attributes
	const blockProps = useBlockProps.save()

	const blockIdSuffix = '-' + blockId
	const labelId       = name + '-label' + blockIdSuffix

	const conditionalProps = {}
	if ( showLabel ) {
		conditionalProps[ 'aria-labelledby' ] = labelId
	} else {
		conditionalProps[ 'aria-label' ] = label
	}

	return (
		<div { ...blockProps }>
			{ showLabel && label &&
				<label
					id={ labelId }
					className={ 'bigupForms__label' }
				>
					{ label }
				</label>
			}
			<select
				name={ name }
				className={ 'bigupForms__select' }
				{ ...conditionalProps }
			>
				<option
					className={ 'bigupForms__selectDefaultText' }
					value={ defaultText }
					disabled
					selected
				>{ defaultText }</option>
				{
					options.length > 0 && (
						options.map( ( option, index ) => {
							return (
								<option
									key={ index }
									value={ option }
								>
									{ option }
								</option>
							)
						} )
					)
				}
			</ select>
		</div>
	)
}
