import { __ } from '@wordpress/i18n'
import { PropTypes } from 'prop-types'
import { InnerBlocks, useBlockProps, InspectorControls, AlignmentToolbar, BlockControls } from '@wordpress/block-editor'
import { PanelBody, SelectControl, CheckboxControl } from '@wordpress/components'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'
import { ResetButton } from '../../components/ResetButton'

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

	const { textAlign, variation, showResetButton } = attributes

	const blockProps = useBlockProps( {
		className: 'bigup__form',
		style: { textAlign: textAlign }
	} )

	// Select control values.
	const blockVariations  = wp.blocks.getBlockType( name ).variations
	const variationOptions = []
	Object.values( blockVariations ).forEach( variation => {
		variationOptions.push( { label: variation.title, value: variation.name } )
	} )

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
					<CheckboxControl
						label={ __( 'Show reset button' ) }
						checked={ showResetButton }
						onChange={ ( newValue ) => { setAttributes( { showResetButton: newValue, } ) } }
					/>
				</PanelBody>
			</InspectorControls>

			{
				<BlockControls>
					<AlignmentToolbar
						value={ textAlign }
						onChange={ ( newValue ) => { setAttributes( { textAlign: newValue, } ) } }
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
					<h3>Contact Form</h3>
				</header>

				<div className='bigup__form_section'>

					<Honeypot />

					<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } />
					Edit
					<div className='bigup__form_controls'>
						<SubmitButton />
						{ showResetButton &&
							<ResetButton />
						}
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
