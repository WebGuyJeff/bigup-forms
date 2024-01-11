import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'
import { typeDefinitions } from './type-definitions'


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
		type,
		name,
		label,
		labelID,
		labelIsHidden,
		required,
		autocomplete,
		placeholder,
		format,
		size,
		visibilityPermissions
	} = attributes

	const blockProps = useBlockProps.save()

	// Set the HTML tag to either input or textarea.
	const InputTagName = ( type === 'textarea' ) ? 'textarea' : 'input'

	// Get limit attributes from definition and get any saved values from block attributes.
	const availableLimits = typeDefinitions[ type ].limits
	const savedLimits = {}
	availableLimits.forEach( attr => {
		if ( attributes[ attr ] ) {
			savedLimits[ attr ] = attributes[ attr ]
		}
	} )
	// Build attributes to apply to the component.
    const conditionalAttributes = {
		...savedLimits
    }
	if ( type !== 'textarea' ) conditionalAttributes.type = type

	return (

		<>
			<div { ...blockProps }>
				{ label && ! labelIsHidden &&
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
						dataFormat={ format }
						{ ...conditionalAttributes }
						required={ required }
					/>
				</InputWrap>
			</div>
		</>
	)
}
