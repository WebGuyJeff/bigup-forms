import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import React, { useEffect } from 'react'
import { InnerBlocks, useBlockProps, InspectorControls, AlignmentToolbar, BlockControls, RichText } from '@wordpress/block-editor'
import { PanelBody, SelectControl, CheckboxControl, TextControl, Button } from '@wordpress/components'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'
import { ResetButton } from '../../components/ResetButton'
import { restStoreURL, restNonce } from '../../common/_wp-inlined-script'
import './form-editor.scss.js'

const ALLOWED_BLOCKS = [
	'bigup-forms/form-file-upload',
	'bigup-forms/form-text-field',
	'bigup-forms/form-select',
	'core/buttons',
	'core/columns',
	'core/cover',
	'core/group',
	'core/heading',
	'core/spacer'
]

const uniqueIDs = []

export default function Edit( props ) {

	const {
		name,
		attributes,
		setAttributes,
		clientId
	} = props
	const {
		uniqueID, // Unique ID for the block within the post/page context.
		formPostID, // Form custom post ID for the saved form.
		formName,
		textAlign,
		variation,
		title,
		showTitle,
		showResetButton
	} = attributes

	const blockProps = useBlockProps( {
		className: 'bigupForms__form',
		style: { textAlign: textAlign },
		'data-unique-id': uniqueID,
		'data-form-post-id': formPostID,
		name: formName,
		method: 'post',
		acceptCharset: 'utf-8',
		autoComplete: 'on'
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

	// Select control values.
	const blockVariations  = wp.blocks.getBlockType( name ).variations
	const variationOptions = []
	Object.values( blockVariations ).forEach( variation => {
		variationOptions.push( { label: variation.title, value: variation.name } )
	} )

	/*
	 * 1. Scrape the form block and all children (will become pattern).
	 * 2. Fetch request to save/update the form custom post.
	 * 3. Catch the returned post ID and save to ID block attribute - form is now 'hard linked' to the post/pattern.
	 */
	const handleSave = async ( event ) => {
		event.preventDefault()

		// Scrape form blocks from post content.
		const postContentHTML = wp.data.select( "core/editor" ).getEditedPostContent()
		const formBlocks      = scrapeFormBlocksFromHTML( postContentHTML )



		// DEBUG.
		console.log( 'formBlocks', formBlocks )


		if ( ! formBlocks.length ) {
			return
		}

		// Build fetch payload.
		const formData = new FormData()
		formData.append( 'content', JSON.stringify( formBlocks ) )
		const options = {
			method: "POST",
			headers: {
				"X-WP-Nonce" : restNonce,
				"Accept"     : "application/json"
			},
			body: formData,
		}
	
		// Fetch request.
		try {
			const response   = await fetch( restStoreURL, { ...options, signal: AbortSignal.timeout( 10000 ) } )
			const result     = await response.json()

			if ( result.ok && result?.output && result.output !== formPostID ) {
				setAttributes( { formPostID: result.output } )
			} else {
				throw result
			}
	
		} catch ( error ) {
			console.error( error )
		}
	}


	/**
	 * Scrape form blocks from HTML.
	 * 
	 * Returns all wp:bigup-forms/form blocks found in a single HTML string.
	 * Each result includes the full block string and the parsed formPostID.
	 */
	function scrapeFormBlocksFromHTML( html ) {
		if ( typeof html !== 'string' ) throw new TypeError( 'html must be a string' )

		const results = []

		/*
		 * 1) Full block (opening comment -> closing comment) in group 1.
		 * 2) JSON attrs from opening comment in group 2.
		 */
		const regex = /(<!--\s*wp:bigup-forms\/form\s*(\{[\s\S]*?\})\s*-->[\s\S]*?<!--\s*\/wp:bigup-forms\/form\s*-->)/gi

		for ( const match of html.matchAll( regex ) ) {
			const blockString = match[ 1 ]
			const attrsJson   = match[ 2 ]

			let attrs      = null
			let uniqueID   = null
			let formPostID = null
			let formName   = null

			try {
				attrs = JSON.parse( attrsJson )
				uniqueID = attrs?.uniqueID ?? null
				formPostID = attrs?.formPostID ?? null
				formPostID = attrs?.formPostID ?? null
				formName = attrs?.formName ?? null
			} catch {
				// Keep nulls; still return the block string.
			}

			results.push( {
				block: blockString,
				uniqueID,
				formPostID,
				formName,
				attrs, // Useful if we want other fields later.
			} )
		}

		return results
	}


	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings', 'bigup-forms' ) }
					initialOpen={ true } 
				>
					<TextControl
						label={ __( 'Name', 'bigup-forms' ) }
						type="text"
						value={ formName }
						onChange={ ( newValue ) => { setAttributes( { formName: newValue } ) } }
						__nextHasNoMarginBottom
					/>
					<Button
						variant="primary"
						onClick={ handleSave }
						style={{
							marginBottom: '12px',
							marginRight: '12px'
						}}
					>
						{ ( formPostID > 0 ) ? __( 'Update Form', 'bigup-forms' ) : __( 'Save Form', 'bigup-forms' ) }
					</Button>
					<span>{ formPostID > 0 ? 'ID: ' + formPostID : __( 'unsaved', 'bigup-forms' ) }</span>
					<SelectControl
						label={ __( 'Replace With', 'bigup-forms' ) }
						labelPosition="top"
						title={ __( 'Replace With', 'bigup-forms' ) }
						value={ variation }
						options={ variationOptions }
						onChange={ ( newValue ) => { setAttributes( { variation: newValue } ) } }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Form Elements', 'bigup-forms' ) }
					initialOpen={ true } 
				>
					<TextControl
						label={ __( 'Title', 'bigup-forms' ) }
						type="text"
						value={ title }
						onChange={ ( newValue ) => { setAttributes( { title: newValue } ) } }
						disabled={ ! showTitle }
						__nextHasNoMarginBottom
					/>
					<CheckboxControl
						label={ __( 'Show title', 'bigup-forms' ) }
						checked={ showTitle }
						onChange={ ( newValue ) => { setAttributes( { showTitle: newValue } ) } }
						__nextHasNoMarginBottom
					/>
					<CheckboxControl
						label={ __( 'Show reset button', 'bigup-forms' ) }
						checked={ showResetButton }
						onChange={ ( newValue ) => { setAttributes( { showResetButton: newValue } ) } }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			{
				<BlockControls>
					<AlignmentToolbar
						value={ textAlign }
						onChange={ ( newValue ) => { setAttributes( { textAlign: newValue } ) } }
					/>
				</BlockControls>
			}

			<form { ...blockProps } >

				<header>
					{ showTitle &&
						<RichText
							tagName="h2"
							value={ title }
							onChange={ ( newValue ) => setAttributes( { title: newValue } ) }
							aria-label={ title ? __( 'Form title', 'bigup-forms' ) : __( 'Empty form title', 'bigup-forms' ) }
							placeholder={ __( 'Add a form title', 'bigup-forms' ) }
						/>
					}
				</header>

				<div className='bigupForms__blockContainer'>

					<Honeypot />
					<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } />
					<div className='bigupForms__controls'>
						<SubmitButton />
						{ showResetButton && <ResetButton /> }
					</div>

				</div>

				<footer>
					<div className='bigupForms__alertsContainer' style={{ display: 'none', opacity: 0 }}>
						<output className='bigupForms__alerts'></output>
					</div>
				</footer>

			</form>
		</>
	)
}

Edit.propTypes = {
	name: PropTypes.string,
	attributes: PropTypes.object,
	setAttributes: PropTypes.func,
	clientId: PropTypes.string
}
