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
		validationAttrs,
		label,
		showLabel,
		required,
		autocomplete,
		rows,
		InputTag,
		type,
		name,
		placeholder
	}                = attributes
	const blockProps = useBlockProps.save()

	const blockIdSuffix = '-' + blockId
	const labelId       = name + '-label' + blockIdSuffix

	const conditionalProps = {}
	if ( type === 'textarea' ) {
		conditionalProps.rows = rows
	} else {
		conditionalProps.type = type
	}
	if ( required ) {
		conditionalProps.required = 'required=""'
	}
	if ( showLabel ) {
		conditionalProps[ 'aria-labelledby' ] = labelId
	} else {
		conditionalProps[ 'aria-label' ] = label
	}

	// Get the html input validation attributes.
	validationAttrs.forEach( attr => {
		if ( attributes[ attr ] !== "" ) {
			conditionalProps[ attr ] = attributes[ attr ]
		}
	} )

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
				<InputTag
					name={ name }
					id={ name + blockIdSuffix }
					className={ 'bigupForms__input' }
					placeholder={ placeholder }
					onFocus={ ( e ) => { e.target.placeholder = '' } }
					onBlur={ ( e ) => { e.target.placeholder = placeholder } }
					autoComplete={ autocomplete }
					data-inputtagname={ InputTag }
					data-type={ type }
					data-rows={ rows }
					{ ...conditionalProps }
				/>
			</div>
		</>
	)
}
