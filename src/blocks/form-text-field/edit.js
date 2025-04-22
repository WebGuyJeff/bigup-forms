import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import React, { useEffect } from 'react'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrap } from '../../components/InputWrap'
import { makeNameAttributeSafe } from '../../js/common/_util'
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

	// Don't destructure props to avoid clash between block name and input name.
	const blockName       = props.name
	const attributes      = props.attributes
	const setAttributes   = props.setAttributes
	const clientId        = props.clientId
	const formID          = props.context[ 'bigup-forms/formID' ]
	const blockProps      = useBlockProps()
	const blockVariations = Object.values( wp.blocks.getBlockType( blockName ).variations )
	const {
		blockId, // The block ID.
		variation, // The block variation name.
		validationAttrs, // An object of validation rules used on front and back end for consistency.
		format, // Name of the data format which determines the default validation rules.
		label, // Text content for the field label element.
		showLabel, // Boolean flag to hide/show the label element.
		required, // Boolean flag to enable/disable HTML 'required' attribute.
		autocomplete, // Boolean flag to enable/disable HTML 'autocomplete' attribute.
		rows, // Number of rows displayed in a textarea field.
		InputTag, // HTML 'tag' for the input element.
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

	useEffect( () => {
        if ( ! blockId ) {
            setAttributes( { blockId: clientId } )
        }
    }, [] )

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

	// Changing label updates name attribute to match (which must be uniquie on form).
	const onChangeLabel = ( newLabel ) => {
		setAttributes( {
			label: newLabel,
			name: makeNameAttributeSafe( newLabel )
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

	const blockIdSuffix = '-' + blockId
	const labelId       = name + '-label' + blockIdSuffix

	const conditionalProps = {}
	if ( type === 'textarea' ) {
		conditionalProps.rows = rows
	} else {
		// All <input> elements set to type="text" to allow inline placeholder editing.
		conditionalProps.type = 'text'
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

	const editPlaceholder = placeholder ? placeholder : __( 'Type a placeholder...', 'bigup-forms' )

	return (

		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings', 'bigup-forms' ) }
					initialOpen={ true } 
				>
					<SelectControl
						label={ __( 'Field Variation', 'bigup-forms' ) }
						labelPosition="top"
						title="Form Variation"
						value={ variation }
						options={ variationOptions }
						onChange={ ( newValue ) => onChangeVariation( newValue ) }
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ __( 'Label', 'bigup-forms' ) }
						type="text"
						value={ label }
						onChange={ ( newValue ) => onChangeLabel( newValue ) }
						help={ __( 'The field label must be unique on this form.', 'bigup-forms' ) }
						__nextHasNoMarginBottom
					/>
					<CheckboxControl
						label={ __( 'Show Label', 'bigup-forms' ) }
						checked={ showLabel }
						onChange={ ( newValue ) => { setAttributes( { showLabel: newValue, } ) } }
						__nextHasNoMarginBottom
					/>
					<CheckboxControl
						label={ __( 'Required', 'bigup-forms' ) }
						checked={ required }
						onChange={ ( newValue ) => { setAttributes( { required: newValue, } ) } }
						__nextHasNoMarginBottom
					/>
					<CheckboxControl
						label={ __( 'Autocomplete', 'bigup-forms' ) }
						checked={ ( autocomplete === "on" ) ? true : false }
						onChange={ ( newValue ) => { setAttributes( { autocomplete: newValue ? "on" : "off", } ) } }
						help={ __( 'Allow browser-assisted form-filling.', 'bigup-forms' ) }
						__nextHasNoMarginBottom
					/>
					{ variation === 'any_text' || variation === 'any_number' &&
						<SelectControl
							label={ __( 'HTML Type', 'bigup-forms' ) }
							labelPosition="top"
							title={ __( 'HTML Type', 'bigup-forms' ) }
							value={ type }
							options={ typeOptions }
							onChange={ ( newValue ) => { setAttributes( { type: newValue, } ) } }
							__nextHasNoMarginBottom
						/>
					}
					{ type === 'textarea' &&
						<TextControl
							label={ __( 'Line rows', 'bigup-forms' ) }
							type="number"
							value={ rows }
							onChange={ ( newValue ) => { setAttributes( { rows: newValue, } ) } }
							help={ __( 'Height of the input in text rows.',	'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
				</PanelBody>
			</InspectorControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Validation', 'bigup-forms' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Data Format', 'bigup-forms' ) }
						labelPosition="top"
						title={ __( 'Data Format', 'bigup-forms' ) }
						options={ formatOptions }
						value={ format }
						onChange={ ( newValue ) => onChangeFormat( newValue ) }
						help={ __( 'The format you want the input to conform to.', 'bigup-forms' ) }
						__nextHasNoMarginBottom
					/>
					{ 'minlength' in validationAttrs &&
						<TextControl
							label={ __( 'Minimum length', 'bigup-forms' ) }
							type="number"
							value={ minlength }
							onChange={ ( newValue ) => { setAttributes( { minlength: newValue } ) } }
							help={ __( 'Minimum length of the text.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ 'maxlength' in validationAttrs &&
						<TextControl
							label={ __( 'Maximum length', 'bigup-forms' ) }
							type="number"
							value={ maxlength }
							onChange={ ( newValue ) => { setAttributes( { maxlength: newValue } ) } }
							help={ __( 'Maximum length of the text.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ 'min' in validationAttrs &&
						<TextControl
							label={ __( 'Minimum', 'bigup-forms' ) }
							type="number"
							value={ min }
							onChange={ ( newValue ) => { setAttributes( { min: newValue } ) } }
							help={ __( 'Minimum value.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ 'max' in validationAttrs &&
						<TextControl
							label={ __( 'Maximum', 'bigup-forms' ) }
							type="number"
							value={ max }
							onChange={ ( newValue ) => { setAttributes( { max: newValue } ) } }
							help={ __( 'Maximum value.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ 'step' in validationAttrs &&
						<TextControl
							label={ __( 'Step', 'bigup-forms' ) }
							type="number"
							value={ step }
							onChange={ ( newValue ) => { setAttributes( { step: newValue } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ 'pattern' in validationAttrs &&
						<TextControl
							label={ __( 'Regular Expression (advanced)', 'bigup-forms' ) }
							value={ pattern }
							onChange={ ( newValue ) => { setAttributes( { pattern: newValue } ) } }
							help={ __( 'A regular expression pattern to validate the input against. Must be both PCRE2 and EMCA compatible.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps } >
				{ showLabel &&
					<RichText
						id={ labelId }
						className={ 'bigupForms__label' }
						tagName={ 'label' }
						value={ label }
						onChange={ ( newValue ) => setAttributes( { label: newValue } ) }
						placeholder={ __( 'Add a label to this input', 'bigup-forms' ) }
					/>
				}
				<InputWrap>
					<InputTag
						name={ name }
						className={ 'bigupForms__input' }
						placeholder={ editPlaceholder }
						onFocus={ ( e ) => { e.target.value = editPlaceholder } }
						onBlur={ ( e ) => { e.target.value = '' } }
						onChange={ ( e ) => setAttributes( { placeholder: e.target.value } ) }
						autoComplete={ autocomplete }
						data-inputtagname={ InputTag }
						data-type={ type }
						data-rows={ rows }
						{ ...conditionalProps }
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
	clientId: PropTypes.string,
	context: PropTypes.object,
	variation: PropTypes.string,
}
