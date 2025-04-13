import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
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
		validationAttrs,
		label,
		showLabel,
		required,
		autocomplete,
		rows,
		type,
		name,
		placeholder
	}                = attributes
	const blockProps = useBlockProps.save()

	const blockIdSuffix = '-' + blockId
	const labelId       = name + '-label' + blockIdSuffix

	// Set the HTML tag to either input or textarea.
	let InputTagName = ''
	const conditionalProps = {}
	if ( type === 'textarea' ) {
		InputTagName = 'textarea'
		conditionalProps.rows = rows
	} else {
		// All <input> elements set to type="text" to allow inline placeholder editing.
		InputTagName = 'input'
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
					<label
						id={ labelId }
						className="bigup__form_inputLabel"
						htmlFor={ name + blockIdSuffix }
					>
						{ label }
					</label>
				}
				<InputWrap>
					<InputTagName
						name={ name }
						id={ name + blockIdSuffix }
						className={ 'bigup__form_input' }
						placeholder={ placeholder }
						onFocus={ ( e ) => { e.target.placeholder = '' } }
						onBlur={ ( e ) => { e.target.placeholder = placeholder } }
						autoComplete={ autocomplete }
						{ ...conditionalProps }
					/>
				</InputWrap>
			</div>
		</>
	)
}
