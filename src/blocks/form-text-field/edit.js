import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'
import { makeNameAttributeSafe, escapeRegex, unescapeRegex, stringToRegex } from '../../js/common/_util'
import { bigupFormsInlinedVars } from '../../js/common/_wp-inlined-script'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( props ) {

	// Don't destructure props.name to avoid clash between block name and input name.
	const blockName       = props.name
	const attributes      = props.attributes
	const setAttributes   = props.setAttributes
	const formID          = props.context[ 'bigup-forms/formID' ]
	const blockProps      = useBlockProps()
	const blockVariations = Object.values( wp.blocks.getBlockType( blockName ).variations )
	const {
		variation, // The block variation name.
		validationAttrs, // An object of validation rules used on front and back end for consistency.
		format, // Name of the data format which determines the default validation rules.
		label, // Text content for the field label element.
		labelID, // ID to associate input/label elements. Must be unique on page.
		showLabel, // Boolean flag to hide/show the label element.
		required, // Boolean flag to enable/disable HTML 'required' attribute.
		autocomplete, // Boolean flag to enable/disable HTML 'autocomplete' attribute.
		rows, // Number of rows displayed in a textarea field.
		type, // HTML 'type' attribute for <input> elements.
		name, // HTML name attribute. Must be unique on the form.
		placeholder, // Text content of the field placeholder.
		pattern, // Input validation regex pattern.
		maxlength, // Input validation max string length.
		minlength, // Input validation min string length.
		max, // Input validation max number.
		min, // Input validation min number.
		step // Input validation number step.
	}                     = attributes

	const { dataFormats } = bigupFormsInlinedVars // Predefined validation formats from the server.
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
		const rules = dataFormats[ newFormat ].rules
		setAttributes( {
			format: newFormat,
			// Track the valid validation attributes to control which settings are shown.
			validationAttrs: Object.keys( rules ),
			...rules
		} )
	}

	// Changing block variation sets default variation attributes.
	const onChangeVariation = ( newVariation ) => {
		blockVariations.forEach( variation => {
			if ( newVariation === variation.name ) {
				setAttributes( {
					variation: newVariation,
					...variation.attributes
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

	let InputTagName = ''
	const conditionalProps = {}
	if ( type === 'textarea' ) {
		InputTagName = 'textarea'
		conditionalProps.rows = rows
	} else {
		// All <input> elements set to type="text" to allow inline placeholder editing.
		InputTagName = 'input'
		conditionalProps.type = 'text'
	}

	// Get the html input validation attributes.
	validationAttrs.forEach( attr => {
		if ( attributes[ attr ] !== "" ) {
			conditionalProps[ attr ] = attributes[ attr ]
		}
	} )

	const editPlaceholder = placeholder ? placeholder : 'Type a placeholder...'

	// labelID Not used in Edit, but must set to attribute for save function.
	const newLabelID = name + '-' + formID
	// console.log( 'labelID', newLabelID )

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
						__nextHasNoMarginBottom={ true }
					/>
					<TextControl
						label={ __( 'Label' ) }
						type="text"
						value={ label }
						onChange={ ( newValue ) => { setAttributes( { label: newValue, } ) } }
						disabled={ ! showLabel }
						__nextHasNoMarginBottom={ true }
					/>
					<CheckboxControl
						label={ __( 'Show Label' ) }
						checked={ showLabel }
						onChange={ ( newValue ) => { setAttributes( { showLabel: newValue, } ) } }
						__nextHasNoMarginBottom={ true }
					/>
					<CheckboxControl
						label={ __( 'Required' ) }
						checked={ required }
						onChange={ ( newValue ) => { setAttributes( { required: newValue, } ) } }
						__nextHasNoMarginBottom={ true }
					/>
					<CheckboxControl
						label={ __( 'Autocomplete' ) }
						checked={ ( autocomplete === "on" ) ? true : false }
						onChange={ ( newValue ) => { setAttributes( { autocomplete: newValue ? "on" : "off", } ) } }
						help={ __( 'Allow browser-assisted form-filling.' ) }
						__nextHasNoMarginBottom={ true }
					/>
					{ variation === 'any_text' || variation === 'any_number' &&
						<SelectControl
							label={ __( 'HTML Type' ) }
							labelPosition="top"
							title={ __( 'HTML Type' ) }
							value={ type }
							options={ typeOptions }
							onChange={ ( newValue ) => { setAttributes( { type: newValue, } ) } }
							__nextHasNoMarginBottom={ true }
						/>
					}
					{ type === 'textarea' &&
						<TextControl
							label={ __( 'Line rows' ) }
							type="number"
							value={ rows }
							onChange={ ( newValue ) => { setAttributes( { rows: newValue, } ) } }
							help={ __( 'Height of the input in text rows.' ) }
							__nextHasNoMarginBottom={ true }
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
						__nextHasNoMarginBottom={ true }
					/>
					{ 'minlength' in validationAttrs &&
						<TextControl
							label={ __( 'Minimum length' ) }
							type="number"
							value={ minlength }
							onChange={ ( newValue ) => { setAttributes( { minlength: newValue } ) } }
							help={ __( 'Minimum length of the text.' ) }
							__nextHasNoMarginBottom={ true }
						/>
					}
					{ 'maxlength' in validationAttrs &&
						<TextControl
							label={ __( 'Maximum length' ) }
							type="number"
							value={ maxlength }
							onChange={ ( newValue ) => { setAttributes( { maxlength: newValue } ) } }
							help={ __( 'Maximum length of the text.' ) }
							__nextHasNoMarginBottom={ true }
						/>
					}
					{ 'min' in validationAttrs &&
						<TextControl
							label={ __( 'Minimum' ) }
							type="number"
							value={ min }
							onChange={ ( newValue ) => { setAttributes( { min: newValue } ) } }
							help={ __( 'Minimum value.' ) }
							__nextHasNoMarginBottom={ true }
						/>
					}
					{ 'max' in validationAttrs &&
						<TextControl
							label={ __( 'Maximum' ) }
							type="number"
							value={ max }
							onChange={ ( newValue ) => { setAttributes( { max: newValue } ) } }
							help={ __( 'Maximum value.' ) }
							__nextHasNoMarginBottom={ true }
						/>
					}
					{ 'step' in validationAttrs &&
						<TextControl
							label={ __( 'Step' ) }
							type="number"
							value={ step }
							onChange={ ( newValue ) => { setAttributes( { step: newValue } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.' ) }
							__nextHasNoMarginBottom={ true }
						/>
					}
					{ 'pattern' in validationAttrs &&
						<TextControl
							label={ __( 'Regular Expression (advanced)' ) }
							value={ pattern }
							onChange={ ( newValue ) => { setAttributes( { pattern: newValue } ) } }
							help={ __( 'A regular expression pattern to validate the input against. Must be both PCRE2 and EMCA compatible.' ) }
							__nextHasNoMarginBottom={ true }
						/>
					}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="advanced">
				<TextControl
					label={ __( 'HTML Input Name' ) }
					autoComplete="off"
					value={ name }
					onChange={ ( newValue ) => { setAttributes( { name: makeNameAttributeSafe( newValue ) } ) } }
					help={ __( 'Identity of the field which must be unique on this form. Must consist of lowercase letters, numbers, hyphens, underscores and begin with a letter.' ) }
					__nextHasNoMarginBottom={ true }
				/>
			</InspectorControls>

			<div { ...blockProps } >
				{ showLabel &&
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
						required={ required ? 'required' : '' }
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
