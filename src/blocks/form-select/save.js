import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'

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
		defaultText,
		required
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
	if ( required ) {
		conditionalProps.required = 'required=""'
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
			<div className={ 'bigupForms__selectWrap' }>
				<select
					name={ name }
					className={ 'bigupForms__select' }
					{ ...conditionalProps }
				>
					<option
						className={ 'bigupForms__selectDefaultText' }
						value=''
						disabled
						selected
						hidden
					>{ defaultText }</option>
					{
						Object.keys( options ).length > 0 && (
							options.map( ( { value, text }, index ) => {
								return (
									<option
										key={ index }
										value={ value }
									>
										{ text }
									</option>
								)
							} )
						)
					}
				</ select>
			</div>
		</div>
	)
}
