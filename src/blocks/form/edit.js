import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps, InspectorControls, AlignmentToolbar, BlockControls } from '@wordpress/block-editor'
import { PanelBody, SelectControl } from '@wordpress/components'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'

const ALLOWED_BLOCKS = [
	'bigup-forms/form-files',
	'bigup-forms/form-text-field',
	'core/buttons',
	'core/columns',
	'core/cover',
	'core/group',
	'core/heading',
	'core/spacer'
];

export default function Edit( { attributes, setAttributes } ) {

	const { textAlign } = attributes

	const blockProps = useBlockProps( {
		className: 'bigup__form'
	} )

	// Select control values.
	const textAlignOptions = [
		{ label: __( 'Left', 'bigup-forms' ), value: 'start' },
		{ label: __( 'Centre', 'bigup-forms' ), value: 'center' },
		{ label: __( 'Right', 'bigup-forms' ), value: 'end' }
	]

	return (
		<>

			{ false &&
				<InspectorControls>
					<PanelBody
						title={ __( 'Settings') }
						initialOpen={ true } 
					>
						<SelectControl
							label="Text Align"
							labelPosition="Left"
							title="Text Align"
							value={ textAlign }
							options={ textAlignOptions }
							onChange={ ( newValue ) => { setAttributes( { textAlign: newValue, } ) } }
						/>
					</PanelBody>
				</InspectorControls>
			}

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
				autocomplete='on'
				style={{ textAlign: textAlign }}
			>

				<header>
					<h3>Contact Form</h3>
				</header>

				<div className='bigup__form_section'>

					<Honeypot />

					<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } />

					<SubmitButton />

				</div>

				<footer>
					<div className='bigup__alert_output' style={{ display: 'none', opacity: 0 }}></div>
				</footer>

			</form>
		</>
	)
}
