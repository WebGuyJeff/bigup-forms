import { __ } from '@wordpress/i18n'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'
import { definition } from './definition'
import { makeNameAttributeSafe } from '../../js/_util'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {

	const {
		type,
		name,
		label,
		labelID,
		labelIsHidden,
		required,
		autocomplete,
		placeholder,
		minlength,
		maxlength,
		min,
		max,
		step,
		pattern,
		size,
		rows,
		visibilityPermissions
	} = attributes

	const blockProps = useBlockProps()

	// Set new values on input type select change.
	const typeChangeHandler = ( newType ) => {
		setAttributes( {
			type: newType,
			name: makeNameAttributeSafe( definition[ newType ].label ),
			label: definition[ newType ].label 
		} )
	}

	if ( ! labelID ) setAttributes( { labelID: 'inner-' + blockProps.id } )

	// Select control values.
	const typeOptions = []
	for ( const [ key, value ] of Object.entries( definition ) ) {
		typeOptions.push( { label: definition[ key ].label, value: key } )
	}

	// Set the HTML tag when switching between input[type='text']/textarea.
	const InputTagName = ( 'textarea' === type ) ? 'textarea' : 'input'

	// Get limit attributes from definition and get any saved values from block attributes.
	const availableLimits = definition[type].limits
	const savedLimits = {}
	availableLimits.forEach( attr => {
		if ( attributes[attr] ) {
			savedLimits[attr] = attributes[attr]
		}
	} )
	// Build attributes to apply to the component.
    const conditionalAttributes = {
		...savedLimits
    }
	// In edit, only display type="text" to allow editing of placeholder even for number inputs.
	if ( 'textarea' !== type ) conditionalAttributes.type = 'text'

	const editPlaceholder = placeholder ? placeholder : definition[type].placeholder

	return (

		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings') }
					initialOpen={ true } 
				>
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
						label="Type"
						labelPosition="Left"
						title="Field Type"
						value={ type }
						options={ typeOptions }
						onChange={ ( newValue ) => typeChangeHandler( newValue ) }
					/>
					<CheckboxControl
						label={ __( 'Required' ) }
						checked={ required }
						onChange={ ( newValue ) => { setAttributes( { required: newValue, } ) } }
					/>
					<CheckboxControl
						label={ __( 'Autocomplete' ) }
						checked={ ( "on" === autocomplete ) ? true : false }
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

					{ availableLimits.includes( 'minlength' ) &&
						<TextControl
							type="number"
							label={ __( 'Minimum length' ) }
							value={ minlength }
							onChange={ ( newValue ) => { setAttributes( { minlength: newValue, } ) } }
							help={ __( 'Minimum length of the text.' ) }
						/>
					}
					{ availableLimits.includes( 'maxlength' ) &&
						<TextControl
							type="number"
							label={ __( 'Maximum length' ) }
							value={ maxlength }
							onChange={ ( newValue ) => { setAttributes( { maxlength: newValue, } ) } }
							help={ __( 'Maximum length of the text.' ) }
						/>
					}
					{ availableLimits.includes( 'min' ) &&
						<TextControl
							type="number"
							label={ __( 'Minimum' ) }
							value={ min }
							onChange={ ( newValue ) => { setAttributes( { min: newValue, } ) } }
							help={ __( 'Minimum value.' ) }
						/>
					}
					{ availableLimits.includes( 'max' ) &&
						<TextControl
							type="number"
							label={ __( 'Maximum' ) }
							value={ max }
							onChange={ ( newValue ) => { setAttributes( { max: newValue, } ) } }
							help={ __( 'Maximum value.' ) }
						/>
					}
					{ availableLimits.includes( 'step' ) &&
						<TextControl
							type="number"
							label={ __( 'Step' ) }
							value={ step }
							onChange={ ( newValue ) => { setAttributes( { step: newValue, } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.' ) }
						/>
					}
					{ availableLimits.includes( 'size' ) &&
						<TextControl
							type="number"
							label={ __( 'Size' ) }
							value={ size }
							onChange={ ( newValue ) => { setAttributes( { size: newValue, } ) } }
							help={ __( 'The number of characters visible while editing.' ) }
						/>
					}
					{ availableLimits.includes( 'rows' ) &&
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
					help={ __( 'Name of the field in the submitted results. Must consist of letters, numbers, hyphens, underscores and begin with a letter.' ) }
				/>
				{ availableLimits.includes( 'pattern' ) &&
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
						required={ required }
						size={ size }
						onChange={ ( e ) => setAttributes( { placeholder: e.target.value } ) }
						placeholder={ editPlaceholder }
						onFocus={ ( e ) => { e.target.value = editPlaceholder } }
						onBlur={ ( e ) => { e.target.value = '' } }
						autocomplete={ autocomplete }
						{ ...conditionalAttributes }
					/>
				</InputWrap>
			</div>
		</>
	)
}
