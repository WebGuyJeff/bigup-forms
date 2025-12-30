import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import React, { useEffect } from 'react'
import { PanelBody, TextControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { BinIcon, FileIcon } from './svg'

const uniqueIDs = []

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
		uniqueID, // Unique ID for the block within the post/page context.
		label // Text content for the field label element.
	} = attributes

	const blockProps = useBlockProps( {
		'data-unique-id': uniqueID,
		className: 'bigupForms__customFileUpload bigupForms__blockWrap'
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

	const onChangeLabel = ( newValue ) => {
		setAttributes( {
			label: newValue
		} )
	}

	const filesID = 'files-' + uniqueID
	const labelID = 'label-' + uniqueID

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
						help={ __( 'The label shown next to the input.', 'bigup-forms' ) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<label
					className='bigupForms__customFileUpload_button'
					tabIndex={ '0' }
				>
					<RichText
						id={ filesID }
						className='bigupForms__customFileUpload_input'
						type='span'
						aria-labelledby={ labelID }
					/>
					<span className='bigupForms__customFileUpload_icon bigupForms__customFileUpload_icon-file'>
						<FileIcon />
					</span>	
					<RichText
						id={ labelID }
						className={ 'bigupForms__customFileUpload_label' }
						tagName={ 'span' }
						htmlFor={ filesID }
						value={ label }
						onChange={ ( newValue ) => onChangeLabel( newValue ) }
						placeholder={ __( 'Add a label to this input', 'bigup-forms' ) }
					/>
				</label>
				<table
					className={ 'bigupForms__customFileUpload_output' }
				>
					<thead>
						<tr>
							<th scope={ 'col' }>{ __( 'Filename', 'bigup-forms' ) }</th>
							<th scope={ 'col' }>{ __( 'Type', 'bigup-forms' ) }</th>
							<th scope={ 'col' }>{ __( 'Size', 'bigup-forms' ) }</th>
							<th scope={ 'col' }>{ __( 'Remove', 'bigup-forms' ) }</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
				<template>
					<tr>
						<td className={ 'bigupForms__customFileUpload_fileName' }></td>
						<td className={ 'bigupForms__customFileUpload_fileType' }></td>
						<td className={ 'bigupForms__customFileUpload_fileSize' }></td>
						<td>
							<button
								title={ __( 'Remove file', 'bigup-forms' ) }
								aria-label={ __( 'Remove file', 'bigup-forms' ) }
							>
								<span className={ 'bigupForms__customFileUpload_icon bigupForms__customFileUpload_icon-bin' }>
									<BinIcon />
								</span>
							</button>
						</td>
					</tr>
				</template>
			</div>
		</>
	)
}

Edit.propTypes = {
	attributes: PropTypes.object,
	setAttributes: PropTypes.func,
}


/**
 * 	<li>
 *<button
 *	title={ __( 'Remove file', 'bigup-forms' ) }
 *	aria-label={ __( 'Remove file', 'bigup-forms' ) }
 *>
 *	<span className={ 'bigupForms__customFileUpload_icon bigupForms__customFileUpload_icon-bin' }>
 *		<BinIcon />
 *	</span>
 *</button>
 *<span className={ 'bigupForms__customFileUpload_label' }></span>
 *</li>
 */
