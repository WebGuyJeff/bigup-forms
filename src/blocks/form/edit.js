import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import { InnerBlocks, useBlockProps, InspectorControls, AlignmentToolbar, BlockControls, RichText } from '@wordpress/block-editor'
import { PanelBody, SelectControl, CheckboxControl, TextControl, ButtonGroup, Button } from '@wordpress/components'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'
import { ResetButton } from '../../components/ResetButton'
import { wpInlinedVars } from '../../js/common/_wp-inlined-script'

const ALLOWED_BLOCKS = [
	'bigup-forms/form-files',
	'bigup-forms/form-text-field',
	'core/buttons',
	'core/columns',
	'core/cover',
	'core/group',
	'core/heading',
	'core/spacer'
]

export default function Edit( { name, attributes, setAttributes } ) {

	const {
		formID, // CPT Post ID for the saved form.
		formName,
		textAlign,
		variation,
		title,
		showTitle,
		showResetButton
	} = attributes

	const blockProps = useBlockProps( {
		className: 'bigup__form',
		style: { textAlign: textAlign }
	} )

	const {
		restStoreURL,
		restNonce
	} = wpInlinedVars

	// Select control values.
	const blockVariations  = wp.blocks.getBlockType( name ).variations
	const variationOptions = []
	Object.values( blockVariations ).forEach( variation => {
		variationOptions.push( { label: variation.title, value: variation.name } )
	} )

	/*
	 * 1. Scrape the form block and all children (will become pattern).
	 * 2. Fetch request to save/update the form CPT.
	 * 3. Catch the returned ID and save to attribute - form is now 'hard linked' to the post/pattern.
	 */
	const handleSave = async ( event ) => {
		event.preventDefault()

		const formBlock = wp.data.select( 'core/block-editor' ).getSelectedBlock()
		console.log( 'formBlock', formBlock )
	
		const testContent = wp.data.select( "core/editor" ).getEditedPostContent()
		console.log( 'testContent', testContent )

		const parsedBlocks = wp.blocks.parse( testContent )
		console.log( 'parsedBlocks', parsedBlocks )

		// Build formData.
		const formData = new FormData()
		formData.append( 'content', testContent )
		formData.append( 'id', formID )
		formData.append( 'name', formName )
		formData.append( 'tags', [ 'tag1', 'tag2' ] )
	
		const fetchOptions = {
			method: "POST",
			headers: {
				"X-WP-Nonce" : restNonce,
				"Accept"     : "application/json"
			},
			body: formData,
		}
	
		try {
	
			const controller = new AbortController()
			const abort      = setTimeout( () => controller.abort(), 10000 )
			const response   = await fetch( restStoreURL, { ...fetchOptions, signal: controller.signal } )
			clearTimeout( abort )

			const result = await response.json()

			if ( result.ok && result[ 'id' ] !== formID ) {
				setAttributes( { formID: result[ 'id' ] } )
			} else {
				const unknownError = {
					message: 'Form save failure. Check WP logs',
					result: result
				}
				console.error( unknownError )
			}
	
		} catch ( error ) {
			console.error( error )
		}
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings' ) }
					initialOpen={ true } 
				>
					<TextControl
						label={ __( 'Name' ) }
						type="text"
						value={ formName }
						onChange={ ( newValue ) => { setAttributes( { formName: newValue } ) } }
					/>
					<ButtonGroup>
						<Button
							variant="primary"
							onClick={ handleSave }
							style={{
								marginBottom: '12px'
							}}
						>
							{ ( formID > 0 ) ? 'Update Form' : 'Save Form' }
						</Button>
					</ButtonGroup>
					<span>ID: { formID }</span>
					<SelectControl
						label={ __( 'Replace With:' ) }
						labelPosition="top"
						title={ __( 'Replace With' ) }
						value={ variation }
						options={ variationOptions }
						onChange={ ( newValue ) => { setAttributes( { variation: newValue } ) } }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Form Elements' ) }
					initialOpen={ true } 
				>
					<TextControl
						label={ __( 'Title' ) }
						type="text"
						value={ title }
						onChange={ ( newValue ) => { setAttributes( { title: newValue } ) } }
						disabled={ ! showTitle }
					/>
					<CheckboxControl
						label={ __( 'Show title' ) }
						checked={ showTitle }
						onChange={ ( newValue ) => { setAttributes( { showTitle: newValue } ) } }
					/>
					<CheckboxControl
						label={ __( 'Show reset button' ) }
						checked={ showResetButton }
						onChange={ ( newValue ) => { setAttributes( { showResetButton: newValue } ) } }
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

			<form
				{ ...blockProps }
				method='post'
				acceptCharset='utf-8'
				autoComplete='on'
			>

				<header>
					{ showTitle &&
						<RichText
							tagName="h2"
							value={ title }
							onChange={ ( newValue ) => setAttributes( { title: newValue } ) }
							aria-label={ title ? __( 'Form title' ) : __( 'Empty form title' ) }
							placeholder={ __( 'Add a form title' ) }
						/>
					}
				</header>

				<div className='bigup__form_section'>

					<Honeypot />
					<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } />
					<div className='bigup__form_controls'>
						<SubmitButton />
						{ showResetButton && <ResetButton /> }
					</div>

				</div>

				<footer>
					<div className='bigup__alert_output' style={{ display: 'none', opacity: 0 }}></div>
				</footer>

			</form>
		</>
	)
}

Edit.propTypes = {
	name: PropTypes.string,
	attributes: PropTypes.object,
	setAttributes: PropTypes.func,
}
