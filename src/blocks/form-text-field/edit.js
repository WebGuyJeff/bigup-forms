import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'
import { makeNameAttributeSafe, escapeRegex, unescapeRegex, stringToRegex } from '../../js/common/_util'
import { wpInlinedVars } from '../../js/common/_wp-inlined-script'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( props ) {

	// Don't destructure props to avoid clash between block name and input name.
	const blockName       = props.name
	const attributes      = props.attributes
	const setAttributes   = props.setAttributes
	const blockProps      = useBlockProps()
	const blockVariations = Object.values( wp.blocks.getBlockType( blockName ).variations )
	const {
		variation, // The block variation name.
		validation, // An object of validation rules used on front and back end for consistency.
		format, // Name of the data format which determines the default validation rules.
		label, // Text content for the field label element.
		labelIsHidden, // Boolean flag to hide/show the label element.
		required, // Boolean flag to enable/disable HTML 'required' attribute.
		autocomplete, // Boolean flag to enable/disable HTML 'autocomplete' attribute.
		rows, // Number of rows displayed in a textarea field.
		type, // HTML 'type' attribute for <input> elements.
		name, // HTML name attribute which is the unique field key for the submitted form.
		placeholder // Text content of the field placeholder.
	}                     = attributes
	const { dataFormats } = wpInlinedVars // Predefined validation formats from the server.
	const inputTypes      = [
		'textarea',
		'text',
		'email',
		'tel',
		'password',
		'url',
		'number',
		'date',
		'time'
	]

	// Changing (data) format sets validation rules.
	const onChangeFormat = ( newFormat ) => {
		setAttributes( {
			format: newFormat,
			validation: dataFormats[ newFormat ].props
		} )
	}

	// Changing block variation sets default variation attributes.
	const onChangeVariation = ( newVariation ) => {
		blockVariations.forEach( variation => {
			if ( newVariation === variation.name ) {
				setAttributes( {
					variation: newVariation,
					...variation.attributes,
				} )
			}
		} )
	}

	// Variation select control values.
	const variationOptions = []
	blockVariations.forEach( variation => variationOptions.push( { value: variation.name, label: variation.title } ) )

	// Input type select control values.
	const typeOptions = []
	inputTypes.forEach( type => typeOptions.push( { value: type, label: type } ) )

	// Validation format select control values.
	const formatOptions = []
	Object.entries( dataFormats ).forEach( ( [ key, val ] ) => {
		if ( val.types.includes( type ) ) {
			formatOptions.push( { value: key, label: val.label } )
		}
	} )

	const conditionalProps = {}
	if ( type === 'textarea' ) {
		conditionalProps.rows = rows
	} else {
		// All <input> elements set to type="text" to allow inline placeholder editing.
		conditionalProps.type = 'text'
	}

	// Set the HTML tag when switching between input[type='text']/textarea.
	const InputTagName = ( type === 'textarea' ) ? 'textarea' : 'input'

	const editPlaceholder = placeholder ? placeholder : 'Type a placeholder...'

	return (

		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings' ) }
					initialOpen={ true } 
				>
					<SelectControl
						label={ __( 'Field Variation' ) }
						labelPosition="top"
						title="Form Variation"
						value={ variation }
						options={ variationOptions }
						onChange={ ( newValue ) => onChangeVariation( newValue ) }
					/>
					<TextControl
						label={ __( 'Label' ) }
						type="text"
						value={ label }
						onChange={ ( newValue ) => { setAttributes( { label: newValue, } ) } }
						disabled={ labelIsHidden }
					/>
					<CheckboxControl
						label={ __( 'Hide Label' ) }
						checked={ labelIsHidden }
						onChange={ ( newValue ) => { setAttributes( { labelIsHidden: newValue, } ) } }
					/>
					<CheckboxControl
						label={ __( 'Required' ) }
						checked={ required }
						onChange={ ( newValue ) => { setAttributes( { required: newValue, } ) } }
					/>
					<CheckboxControl
						label={ __( 'Autocomplete' ) }
						checked={ ( autocomplete === "on" ) ? true : false }
						onChange={ ( newValue ) => { setAttributes( { autocomplete: newValue ? "on" : "off", } ) } }
						help={ __( 'Allow browser-assisted form-filling.' ) }
					/>
					{ variation === 'any_text' || variation === 'any_number' &&
						<SelectControl
							label={ __( 'HTML Type' ) }
							labelPosition="top"
							title={ __( 'HTML Type' ) }
							value={ type }
							options={ typeOptions }
							onChange={ ( newValue ) => { setAttributes( { type: newValue, } ) } }
						/>
					}
					{ type === 'textarea' &&
						<TextControl
							label={ __( 'Line rows' ) }
							type="number"
							value={ rows }
							onChange={ ( newValue ) => { setAttributes( { rows: newValue, } ) } }
							help={ __( 'Height of the input in text rows.' ) }
						/>
					}
				</PanelBody>
			</InspectorControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Validation' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Data Format' ) }
						labelPosition="top"
						title={ __( 'Data Format' ) }
						options={ formatOptions }
						value={ format }
						onChange={ ( newValue ) => onChangeFormat( newValue ) }
						help={ __( 'The format you want the input to conform to.' ) }
					/>
					{ 'minlength' in validation &&
						<TextControl
							label={ __( 'Minimum length' ) }
							type="number"
							value={ validation.minlength }
							onChange={ ( newValue ) => { setAttributes( { validation: { ...validation, minlength: newValue } } ) } }
							help={ __( 'Minimum length of the text.' ) }
						/>
					}
					{ 'maxlength' in validation &&
						<TextControl
							label={ __( 'Maximum length' ) }
							type="number"
							value={ validation.maxlength }
							onChange={ ( newValue ) => { setAttributes( { validation: { ...validation, maxlength: newValue } } ) } }
							help={ __( 'Maximum length of the text.' ) }
						/>
					}
					{ 'min' in validation &&
						<TextControl
							label={ __( 'Minimum' ) }
							type="number"
							value={ validation.min }
							onChange={ ( newValue ) => { setAttributes( { validation: { ...validation, min: newValue } } ) } }
							help={ __( 'Minimum value.' ) }
						/>
					}
					{ 'max' in validation &&
						<TextControl
							label={ __( 'Maximum' ) }
							type="number"
							value={ validation.max }
							onChange={ ( newValue ) => { setAttributes( { validation: { ...validation, max: newValue } } ) } }
							help={ __( 'Maximum value.' ) }
						/>
					}
					{ 'step' in validation &&
						<TextControl
							label={ __( 'Step' ) }
							type="number"
							value={ validation.step }
							onChange={ ( newValue ) => { setAttributes( { validation: { ...validation, step: newValue } } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.' ) }
						/>
					}
					{ 'pattern' in validation &&
						<TextControl
							label={ __( 'Regular Expression (advanced)' ) }
							value={ validation.pattern }
							onChange={ ( newValue ) => { setAttributes( { validation: { ...validation, pattern: newValue } } ) } }
							help={ __( 'A regular expression pattern to validate the input against. Must be both PCRE2 and EMCA compatible.' ) }
						/>
					}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="advanced">
				<TextControl
					label={ __( 'HTML Input Name' ) }
					autoComplete="off"
					value={ name }
					onChange={ ( newValue ) => { setAttributes( { name: makeNameAttributeSafe( newValue ), } ) } }
					help={ __( 'Identity of the field which must be unique on this form. Must consist of lowercase letters, numbers, hyphens, underscores and begin with a letter.' ) }
				/>
			</InspectorControls>

			<div { ...blockProps } >
				{ ! labelIsHidden &&
					<RichText
						tagName="label"
						className="bigup__form_inputLabel"
						value={ label }
						onChange={ ( newValue ) => setAttributes( { label: newValue } ) }
						aria-label={ label ? __( 'Label' ) : __( 'Empty label' ) }
						placeholder={ __( 'Add a label to this input' ) }
					/>
				}
				<InputWrap>
					<InputTagName
						name={ name }
						className={ 'bigup__form_input' }
						title={ label }
						aria-label={ label }
						onChange={ ( e ) => setAttributes( { placeholder: e.target.value } ) }
						placeholder={ editPlaceholder }
						onFocus={ ( e ) => { e.target.value = editPlaceholder } }
						onBlur={ ( e ) => { e.target.value = '' } }
						autoComplete={ autocomplete }
						{ ...conditionalProps }
						required={ required }
					/>
				</InputWrap>
			</div>
		</>
	)
}

Edit.propTypes = {
	name: PropTypes.string,
	attributes: PropTypes.object,
	setAttributes: PropTypes.func,
	context: PropTypes.object,
	variation: PropTypes.string,
}
