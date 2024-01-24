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
		validation,
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

	// Set the HTML tag to either input or textarea.
	const InputTagName = ( type === 'textarea' ) ? 'textarea' : 'input'

	const conditionalProps = {}
	if ( type === 'textarea' ) {
		conditionalProps.rows = rows
	} else if ( validation?.step !== undefined && validation.step !== null ) {
		conditionalProps.step = validation.step
	} else {
		conditionalProps.type = type
	}

	// Generate ID to associate the input and label.
	const labelID = name

	console.log( 'labelID', name )


	return (

		<>
			<div { ...blockProps }>
				{ label && showLabel &&
					<label
						htmlFor={ labelID }
						className="bigup__form_inputLabel"
					>
						{ label }
					</label>
				}
				<InputWrap>
					<InputTagName
						name={ name }
						className={ 'bigup__form_input' }
						id={ labelID }
						title={ label }
						aria-label={ label }
						placeholder={ placeholder }
						onFocus={ ( e ) => { e.target.placeholder = '' } }
						onBlur={ ( e ) => { e.target.placeholder = placeholder } }
						autoComplete={ autocomplete }
						{ ...conditionalProps }
						required={ required }
					/>
				</InputWrap>
			</div>
		</>
	)
}
