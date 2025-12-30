import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import React, { useEffect } from 'react'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { makeNameAttributeSafe } from '../../common/_util'
import { validationDefinitions } from '../../common/_wp-inlined-script'

// For storing unique block IDs.
const uniqueIDs = []

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { name, attributes, setAttributes, isSelected, context } ) {

	// Don't destructure props to avoid clash between block name and input name.
	const formPostID      = context[ 'bigup-forms/formPostID' ]
	const blockVariations = Object.values( wp.blocks.getBlockType( name ).variations )
	const {
		uniqueID, // Unique ID for the block within the post/page context.
		formFieldKey, // HTML name - Must be unique within form as it acts as the form field key.
		variation, // The block variation name.
		validationAttrs, // An object of validation rules used on front and back end for consistency.
		validationDefinition, // A definition of validation rules.
		label, // Text content for the field label element.
		showLabel, // Boolean flag to hide/show the label element.
		required, // Boolean flag to enable/disable HTML 'required' attribute.
		autocomplete, // Boolean flag to enable/disable HTML 'autocomplete' attribute.
		rows, // Number of rows displayed in a textarea field.
		HTMLTag, // HTML 'tag' for the input element.
		type, // Input type or 'textarea'.
		placeholder, // Text content of the field placeholder.
		pattern, // Input validation regex pattern.
		maxlength, // Input validation max string length.
		minlength, // Input validation min string length.
		max, // Input validation max number.
		min, // Input validation min number.
		step // Input validation number step.
	} = attributes

	console.log( 'variation', variation )

	const blockProps = useBlockProps( {
		'data-unique-id': uniqueID,
    	className: 'bigupForms__blockWrap',
    } )

	useEffect( () => {
		// Catch uniqueID in a new variable to avoid infinite loop with setAttributes.
		let newUniqueID = uniqueID
		const getUiniqueID = () => Math.random().toString( 36 ).substring( 2, 8 )
		while ( newUniqueID === null || newUniqueID === undefined || newUniqueID === '' || uniqueIDs.includes( newUniqueID ) ) {
			newUniqueID = getUiniqueID()
		}
		if ( uniqueID !== newUniqueID ) {
			setAttributes( { uniqueID: newUniqueID } )
			uniqueIDs.push( newUniqueID )
		} else {
			uniqueIDs.push( uniqueID )
		}
	}, [] )
 
	const inputID = 'input-' + uniqueID
	const labelID = 'label-' + uniqueID

	const inputTypes = [
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

	// Changing validation definition sets validation rules.
	const onChangeDefinition = ( newDefinition ) => {
		const rules            = validationDefinitions[ newDefinition ].rules,
			newValidationAttrs = Object.keys( rules )
		setAttributes( {
			validationDefinition: newDefinition,
			validationAttrs: newValidationAttrs,
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

	// Changing label updates formFieldKey to match (which must be uniquie on form).
	const onChangeLabel = ( newLabel ) => {
		setAttributes( {
			label: newLabel,
			formFieldKey: makeNameAttributeSafe( newLabel )
		} )
	}

	// Changing type updates HTMLTag if necessary.
	const onChangeType = ( newType ) => {
		let newHTMLTag = 'input'
		if ( newType === 'textarea' ) {
			newHTMLTag = 'textarea'
		}
		setAttributes( {
			type: newType,
			HTMLTag: newHTMLTag
		} )
	}

	// Variation select control values.
	const variationOptions = []
	blockVariations.forEach( variation => variationOptions.push( { value: variation.name, label: variation.title } ) )

	// Input type select control values.
	const typeOptions = []
	inputTypes.forEach( type => typeOptions.push( { value: type, label: type } ) )

	// Validation definition select control values.
	const validationDefinitionOptions = []
	Object.entries( validationDefinitions ).forEach( ( [ key, val ] ) => {
		if ( val.types.includes( type ) ) {
			validationDefinitionOptions.push( { value: key, label: val.label } )
		}
	} )

	const conditionalProps = {}
	if ( type === 'textarea' ) {
		conditionalProps.rows = rows
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
					{ variation === 'custom_text' &&
						<SelectControl
							label={ __( 'HTML Input Type', 'bigup-forms' ) }
							labelPosition="top"
							title={ __( 'HTML Input Type', 'bigup-forms' ) }
							value={ type }
							options={ typeOptions }
							onChange={ ( newValue ) => onChangeType( newValue ) }
							__nextHasNoMarginBottom
						/>
					}
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
						label={ __( 'Expected Input', 'bigup-forms' ) }
						labelPosition="top"
						title={ __( 'Expected Input', 'bigup-forms' ) }
						options={ validationDefinitionOptions }
						value={ validationDefinition }
						onChange={ ( newValue ) => onChangeDefinition( newValue ) }
						help={ __( 'How the input should be validated.', 'bigup-forms' ) }
						__nextHasNoMarginBottom
					/>
					{ validationAttrs.includes( 'minlength' ) &&
						<TextControl
							label={ __( 'Minimum length', 'bigup-forms' ) }
							type="number"
							value={ minlength }
							onChange={ ( newValue ) => { setAttributes( { minlength: newValue } ) } }
							help={ __( 'Minimum length of the text.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ validationAttrs.includes( 'maxlength' ) &&
						<TextControl
							label={ __( 'Maximum length', 'bigup-forms' ) }
							type="number"
							value={ maxlength }
							onChange={ ( newValue ) => { setAttributes( { maxlength: newValue } ) } }
							help={ __( 'Maximum length of the text.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ validationAttrs.includes( 'min' ) &&
						<TextControl
							label={ __( 'Minimum', 'bigup-forms' ) }
							type="number"
							value={ min }
							onChange={ ( newValue ) => { setAttributes( { min: newValue } ) } }
							help={ __( 'Minimum value.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ validationAttrs.includes( 'max' ) &&
						<TextControl
							label={ __( 'Maximum', 'bigup-forms' ) }
							type="number"
							value={ max }
							onChange={ ( newValue ) => { setAttributes( { max: newValue } ) } }
							help={ __( 'Maximum value.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ validationAttrs.includes( 'step' ) &&
						<TextControl
							label={ __( 'Step', 'bigup-forms' ) }
							type="number"
							value={ step }
							onChange={ ( newValue ) => { setAttributes( { step: newValue } ) } }
							help={ __( 'Determine granularity by setting the step between allowed values. E.g. "30" for half-hour increments or "0.01" for a currency format.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
					{ validationAttrs.includes( 'pattern' ) &&
						<TextControl
							label={ __( 'Regular Expression (advanced)', 'bigup-forms' ) }
							value={ pattern }
							onChange={ ( newValue ) => { setAttributes( { pattern: newValue } ) } }
							help={ __( 'Must be a regular expression compatible with the HTML pattern attribute.', 'bigup-forms' ) }
							__nextHasNoMarginBottom
						/>
					}
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps } >
				{ showLabel &&
					<RichText
						id={ labelID }
						className={ 'bigupForms__label' }
						tagName={ 'label' }
						htmlFor={ inputID }
						value={ label }
						onChange={ ( newValue ) => setAttributes( { label: newValue } ) }
						placeholder={ __( 'Add a label to this input', 'bigup-forms' ) }
					/>
				}

				<HTMLTag
					name={ formFieldKey }
					id={ inputID }
					className={ 'bigupForms__input' }
					placeholder={ editPlaceholder }
					onFocus={ ( e ) => { e.target.value = editPlaceholder } }
					onBlur={ ( e ) => { e.target.value = '' } }
					onChange={ ( e ) => setAttributes( { placeholder: e.target.value } ) }
					autoComplete={ autocomplete }
					data-html-tag={ HTMLTag }
					data-type={ type }
					data-rows={ rows }
					type={ ! isSelected ? type : [ 'text', 'url', 'tel', 'email', 'number', 'password' ].includes( type ) ? 'text' : type }
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

Edit.propTypes = {
	name: PropTypes.string,
	attributes: PropTypes.object,
	setAttributes: PropTypes.func,
	isSelected: PropTypes.boolean,
	context: PropTypes.object,
}
