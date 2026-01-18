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
		uniqueID,
		validationAttrs,
		validationDefinition,
		label,
		showLabel,
		required,
		autocomplete,
		rows,
		HTMLTag,
		type,
		formFieldKey,
		placeholder
	} = attributes

	const blockProps = useBlockProps.save( {
		'data-unique-id': uniqueID,
		className: 'bigupForms__blockWrap',
	} )

	const inputID = 'input-' + uniqueID
	const labelID = 'label-' + uniqueID

	const conditionalProps = {}
	if ( type === 'textarea' ) {
		conditionalProps.rows = rows
	} else {
		conditionalProps.type = type
	}
	if ( showLabel ) {
		conditionalProps[ 'aria-labelledby' ] = labelID
	} else {
		conditionalProps[ 'aria-label' ] = label
	}
	if ( required ) {
		conditionalProps[ 'required' ] = 'required'
		conditionalProps[ 'aria-required' ] = 'true'
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
				{ showLabel && label &&
					<RichText.Content
						id={ labelID }
						className={ 'bigupForms__label' }
						tagName={ 'label' }
						htmlFor={ inputID }
						value={ label }
					/>
				}
				<HTMLTag
					name={ formFieldKey }
					id={ inputID }
					className={ 'bigupForms__input' }
					placeholder={ placeholder }
					onFocus={ ( e ) => { e.target.placeholder = '' } }
					onBlur={ ( e ) => { e.target.placeholder = placeholder } }
					autoComplete={ autocomplete }
					data-html-tag={ HTMLTag }
					data-type={ type }
					data-rows={ rows }
					data-validation-definition={ validationDefinition }
					{ ...conditionalProps }
				/>
				<output
					className={ 'bigupForms__inlineErrors' }
					htmlFor={ inputID }
					role={ 'alert' }
					aria-live={ 'polite' }
				></output>
			</div>
		</>
	)
}
