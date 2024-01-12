import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'
import { inputTypeConditionals } from './input-type-conditionals'
import { makeNameAttributeSafe } from '../../js/common/_util'
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

	// Avoiding clash between props.name and input name.
	const blockName     = props.name
	const attributes    = props.attributes
	const setAttributes = props.setAttributes
	const {
		variation,
		format,
		pattern,
		label,
		labelIsHidden,
		name,
		labelID,
		type,
		required,
		autocomplete,
		placeholder,
		size,
		minlength,
		maxlength,
		min,
		max,
		step,
		rows,
		visibilityPermissions
	} = attributes

	const blockProps = useBlockProps()

	// Generate ID to associate the input/label elements.
	if ( ! labelID ) setAttributes( { labelID: 'inner-' + blockProps.id } )

	// Variation select control values.
	const blockVariations  = wp.blocks.getBlockType( blockName ).variations
	const variationOptions = []
	Object.values( blockVariations ).forEach( variation => {
		variationOptions.push( { label: variation.title, value: variation.name } )
	} )

	// Validation format select control values.
	const { validationFormats } = wpInlinedVars
	const formatOptions = []
	Object.entries( validationFormats ).forEach( ( [ key, value ] ) => {
		formatOptions.push( { label: value.label, value: key } )
	} )

	// Input type select control values.
	const typeOptions = []
	Object.keys( inputTypeConditionals ).forEach( type => {
		typeOptions.push( { label: type, value: type } )
	} )

	// Set the HTML tag when switching between input[type='text']/textarea.
	const InputTagName = ( type === 'textarea' ) ? 'textarea' : 'input'

	// Get conditional attributes from inputTypeConditionals and get any corresponding saved values.
	const savedConditionals = {}
	const validConditionals = inputTypeConditionals[ type ]
	validConditionals.forEach( attr => {
		if ( attributes[ attr ] ) {
			savedConditionals[ attr ] = attributes[ attr ]
		}
	} )
	// Build attributes to apply to the component.
    const conditionalAttrs = {
		...savedConditionals
    }
	// If not a textarea, add type="text" to allow editing of placeholder for all input types.
	if ( type !== 'textarea' ) conditionalAttrs.type = 'text'

	const editPlaceholder = placeholder ? placeholder : 'Type a placeholder...'

	return (

		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings' ) }
					initialOpen={ true } 
				>
					<SelectControl
						label="Form Variation"
						labelPosition="Left"
						title="Form Variation"
						value={ variation }
						options={ variationOptions }
						onChange={ ( newValue ) => { setAttributes( { variation: newValue, } ) } }
					/>
					<TextControl
						type="text"
						label={ __( 'Label' ) }
						value={ label }
						onChange={ ( newValue ) => { setAttributes( { label: newValue, } ) } }
						disabled={ labelIsHidden }
					/>
					<CheckboxControl
						label={ __( 'Hide Label' ) }
						checked={ labelIsHidden }
						onChange={ ( newValue ) => { setAttributes( { labelIsHidden: newValue, } ) } }
					/>
					<SelectControl
						label={ __( 'HTML Markup Type' ) }
						labelPosition="Left"
						title={ __( 'HTML Markup Type' ) }
						value={ type }
						options={ typeOptions }
						onChange={ ( newValue ) => { setAttributes( { type: newValue, } ) } }
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
				</PanelBody>
			</InspectorControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Validation' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Data Format' ) }
						labelPosition="Left"
						title={ __( 'Data Format' ) }
						options={ formatOptions }
						value={ format }
						onChange={ ( newValue ) => { setAttributes( { format: newValue, } ) } }
						help={ __( 'The format you want the user input to conform to.' ) }
					/>
					{ validConditionals.includes( 'minlength' ) &&
						<TextControl
							type="number"
							label={ __( 'Minimum length' ) }
							value={ minlength }
							onChange={ ( newValue ) => { setAttributes( { minlength: newValue, } ) } }
							help={ __( 'Minimum length of the text.' ) }
						/>
					}
					{ validConditionals.includes( 'maxlength' ) &&
						<TextControl
							type="number"
							label={ __( 'Maximum length' ) }
							value={ maxlength }
							onChange={ ( newValue ) => { setAttributes( { maxlength: newValue, } ) } }
							help={ __( 'Maximum length of the text.' ) }
						/>
					}
					{ validConditionals.includes( 'min' ) &&
						<TextControl
							type="number"
							label={ __( 'Minimum' ) }
							value={ min }
							onChange={ ( newValue ) => { setAttributes( { min: newValue, } ) } }
							help={ __( 'Minimum value.' ) }
						/>
					}
					{ validConditionals.includes( 'max' ) &&
						<TextControl
							type="number"
							label={ __( 'Maximum' ) }
							value={ max }
							onChange={ ( newValue ) => { setAttributes( { max: newValue, } ) } }
							help={ __( 'Maximum value.' ) }
						/>
					}
					{ validConditionals.includes( 'step' ) &&
						<TextControl
							type="number"
							label={ __( 'Step' ) }
							value={ step }
							onChange={ ( newValue ) => { setAttributes( { step: newValue, } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.' ) }
						/>
					}
					{ validConditionals.includes( 'size' ) &&
						<TextControl
							type="number"
							label={ __( 'Size' ) }
							value={ size }
							onChange={ ( newValue ) => { setAttributes( { size: newValue, } ) } }
							help={ __( 'The number of characters visible while editing.' ) }
						/>
					}
					{ validConditionals.includes( 'rows' ) &&
						<TextControl
							type="number"
							label={ __( 'Line rows' ) }
							value={ rows }
							onChange={ ( newValue ) => { setAttributes( { rows: newValue, } ) } }
							help={ __( 'The number of lines made visible by the input.' ) }
						/>
					}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="advanced">
				<TextControl
					autoComplete="off"
					label={ __( 'Name' ) }
					value={ name }
					onChange={ ( newValue ) => { setAttributes( { name: makeNameAttributeSafe( newValue ), } ) } }
					help={ __( 'Identity of the field which must be unique on this form. Must consist of lowercase letters, numbers, hyphens, underscores and begin with a letter.' ) }
				/>
				{ validConditionals.includes( 'pattern' ) &&
					<TextControl
						label={ __( 'Pattern' ) }
						value={ pattern }
						onChange={ ( newValue ) => { setAttributes( { pattern: newValue, } ) } }
						help={ __( 'A regular expression pattern to validate the input against.' ) }
					/>
				}
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
						{ ...conditionalAttrs }
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
}
