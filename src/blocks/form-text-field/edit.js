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
		validation,
		minlength,
		maxlength,
		min,
		max,
		step,
		rows
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

	/*
	 * Get valid conditional properties for this input type, then get any corresponding saved values
	 * and divide them into block props and validation rules.
	 */
	const conditionalProps = {}
	const validationRules  = {}
	const conditionals     = inputTypeConditionals[ type ]
	conditionals.forEach( attr => {
		if ( attributes[ attr ] ) {
			switch ( attr ) {
				case 'rows':
				case 'step':
					conditionalProps[ attr ] = attributes[ attr ]
					break

				case 'minlength':
				case 'maxlength':
				case 'pattern':
				case 'min':
				case 'max':
					validationRules[ attr ] = attributes[ attr ]
					break
				default:
					console.error( 'Unkown conditional attribute: ' + attr )
			}
		}
	} )

	if ( JSON.stringify( attributes.validation ) !== JSON.stringify( validationRules ) ) {
		setAttributes( { validation: validationRules } )
	}

	console.log( validation )

	// If not a textarea, add type="text" to allow editing of placeholder for all input types.
	if ( type !== 'textarea' ) conditionalProps.type = 'text'

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
						onChange={ ( newValue ) => { setAttributes( { variation: newValue, } ) } }
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
					{ conditionals.includes( 'rows' ) &&
						<TextControl
							label={ __( 'Line rows' ) }
							type="number"
							value={ rows }
							onChange={ ( newValue ) => { setAttributes( { rows: newValue, } ) } }
							help={ __( 'Height of the input in text rows.' ) }
						/>
					}
					<SelectControl
						label={ __( 'HTML Type' ) }
						labelPosition="top"
						title={ __( 'HTML Type' ) }
						value={ type }
						options={ typeOptions }
						onChange={ ( newValue ) => { setAttributes( { type: newValue, } ) } }
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
						labelPosition="top"
						title={ __( 'Data Format' ) }
						options={ formatOptions }
						value={ format }
						onChange={ ( newValue ) => { setAttributes( { format: newValue, } ) } }
						help={ __( 'The format you want the input to conform to.' ) }
					/>
					{ conditionals.includes( 'minlength' ) &&
						<TextControl
							label={ __( 'Minimum length' ) }
							type="number"
							value={ minlength }
							onChange={ ( newValue ) => { setAttributes( { minlength: newValue, } ) } }
							help={ __( 'Minimum length of the text.' ) }
						/>
					}
					{ conditionals.includes( 'maxlength' ) &&
						<TextControl
							label={ __( 'Maximum length' ) }
							type="number"
							value={ maxlength }
							onChange={ ( newValue ) => { setAttributes( { maxlength: newValue, } ) } }
							help={ __( 'Maximum length of the text.' ) }
						/>
					}
					{ conditionals.includes( 'min' ) &&
						<TextControl
							label={ __( 'Minimum' ) }
							type="number"
							value={ min }
							onChange={ ( newValue ) => { setAttributes( { min: newValue, } ) } }
							help={ __( 'Minimum value.' ) }
						/>
					}
					{ conditionals.includes( 'max' ) &&
						<TextControl
							label={ __( 'Maximum' ) }
							type="number"
							value={ max }
							onChange={ ( newValue ) => { setAttributes( { max: newValue, } ) } }
							help={ __( 'Maximum value.' ) }
						/>
					}
					{ conditionals.includes( 'step' ) &&
						<TextControl
							label={ __( 'Step' ) }
							type="number"
							value={ step }
							onChange={ ( newValue ) => { setAttributes( { step: newValue, } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.' ) }
						/>
					}
					{ conditionals.includes( 'pattern' ) &&
						<TextControl
							label={ __( 'Regex Pattern' ) }
							value={ pattern }
							onChange={ ( newValue ) => { setAttributes( { pattern: newValue, } ) } }
							help={ __( 'A regular expression pattern to validate the input against.' ) }
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
}
