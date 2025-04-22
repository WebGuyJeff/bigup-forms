import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import React, { useEffect } from 'react'
import { PanelBody, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { SelectWrap } from '../../components/SelectWrap'
import { makeNameAttributeSafe } from '../../js/common/_util'
import './form-select-editor.scss'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes, isSelected, clientId } ) {

	const {
		blockId, // The block ID.
		label, // Text content for the field label element.
		showLabel, // Boolean flag to hide/show the label element.
		name, // HTML name attribute. Must be unique on the form.
		options, // Array of select options.
		defaultText, // Default select text.
		required // Field required boolean state.
	} = attributes

	const blockProps = useBlockProps()

	useEffect( () => {
        if ( ! blockId ) {
            setAttributes( { blockId: clientId } )
        }
    }, [] )

	// Changing label updates name attribute to match (which must be uniquie on form).
	const onChangeLabel = ( newValue ) => {
		setAttributes( {
			label: newValue,
			name: makeNameAttributeSafe( newValue )
		} )
	}

	const onChangeOptions = ( newValue ) => {
		const newOptions = []
		const optionsData = newValue.split( '\n' )
		optionsData.forEach( option => {
			newOptions.push( { text: option, value: option } )
		} )
		setAttributes( { options: newOptions } )
	}

	const blockIdSuffix = '-' + blockId
	const labelId       = name + '-label' + blockIdSuffix

	const conditionalProps = {}
	if ( showLabel ) {
		conditionalProps[ 'aria-labelledby' ] = labelId
	} else {
		conditionalProps[ 'aria-label' ] = label
	}
	if ( required ) {
		conditionalProps.required = 'required=""'
	}

	const defaultTextPlaceholder = __( 'Add optional default text', 'bigup-forms' )

	const optionsText     = []
	let optionsEditorText = ''
	options.forEach( ( option ) => {
		optionsText.push( option.text )
		optionsEditorText = optionsText.join( '\n' )
	} )

	return (

		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings', 'bigup-forms' ) }
					initialOpen={ true } 
				>
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
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ showLabel &&
					<RichText
						id={ labelId }
						className={ 'bigupForms__label' }
						tagName={ 'label' }
						value={ label }
						onChange={ ( newValue ) => onChangeLabel( newValue ) }
						placeholder={ __( 'Add a label to this input', 'bigup-forms' ) }
					/>
				}
				{ isSelected &&
					<div className={ 'bigupForms__selectEdit' }>
						<small
							className={ 'bigupForms__selectEditHelp' }
						><span
						className={ 'bigupForms__selectEditIcon' }
						></span>{ __( 'Default text (leave empty to omit)', 'bigup-forms' ) }</small>
						<input
							type="text"
							className={ 'bigupForms__selectEditOptionsDefault' }
							placeholder={ defaultTextPlaceholder }
							onChange={ ( e ) => setAttributes( { defaultText: e.target.value } ) }
							value={ defaultText }
						/>
						<small
							className={ 'bigupForms__selectEditHelp' }
						>{ __( 'Type each option on a new line', 'bigup-forms' ) }</small>
						<textarea
							className={ 'bigupForms__selectEditOptionsList' }
							onChange={ ( newValue ) => onChangeOptions( newValue.target.value ) }
						>
							{ optionsEditorText }
						</textarea>
					</div>
				}
				{ ! isSelected &&
					<SelectWrap>
						<select
							name={ name }
							className={ 'bigupForms__select' }
							{ ...conditionalProps }
						>
							<option
								className={ 'bigupForms__selectDefaultText' }
								value={ __( 'none selected', 'bigup-forms' ) }
								disabled
								selected
								hidden
							>{ defaultText ? defaultText : defaultTextPlaceholder }</option>
							{
								Object.keys( options ).length > 0 && (
									options.map( ( { value, text }, index ) => {
										return (
											<option
												key={ index }
												value={ value }
											>
												{ text }
											</option>
										)
									} )
								)
							}
						</ select>
					</SelectWrap>
				}
			</div>
		</>
	)
}

Edit.propTypes = {
	attributes: PropTypes.object,
	setAttributes: PropTypes.func,
	isSelected: PropTypes.boolean,
	clientId: PropTypes.string,
}
