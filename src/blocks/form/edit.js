import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps, InspectorControls, AlignmentToolbar, BlockControls } from '@wordpress/block-editor'
import { PanelBody, SelectControl, CheckboxControl } from '@wordpress/components'
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

export default function Edit( { attributes, setAttributes } ) {




// DEBUG.
console.log( wpInlinedVars )




	const { textAlign, formVariation, showResetButton } = attributes

	const blockProps = useBlockProps( {
		className: 'bigup__form',
		style: { textAlign: textAlign }
	} )

	// Select control values.
	const formVariationOptions = [
		{ label: __( 'Contact', 'bigup-forms' ), value: 'contact' },
		{ label: __( 'Sign-up', 'bigup-forms' ), value: 'signup' },
		{ label: __( 'Login', 'bigup-forms' ), value: 'login' }
	]

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
						value={ formVariation }
						options={ formVariationOptions }
						onChange={ ( newValue ) => { setAttributes( { formVariation: newValue, } ) } }
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
