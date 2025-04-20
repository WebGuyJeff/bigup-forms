import { __ } from '@wordpress/i18n'
import { useBlockProps, RichText } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'

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
		required,
		placeholder
	}                = attributes
	const blockProps = useBlockProps.save()

	const blockIdSuffix = '-' + blockId
	const labelId       = name + '-label' + blockIdSuffix

	const conditionalProps = {}
	if ( required ) {
		conditionalProps.required = 'required=""'
	}
	if ( showLabel ) {
		conditionalProps[ 'aria-labelledby' ] = labelId
	} else {
		conditionalProps[ 'aria-label' ] = label
	}

	return (

		<>
			<div { ...blockProps }>
				{ showLabel &&
					<RichText.Content
						id={ labelId }
						className={ 'bigupForms__label' }
						tagName={ 'label' }
						htmlFor={ name + blockIdSuffix }
						value={ label }
					/>
				}
				<InputWrap>
					<select
						name={ name }
						className={ 'bigupForms__input' }
						placeholder={ placeholder }
						{ ...conditionalProps }
					>
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
				</InputWrap>
			</div>
		</>
	)
}
