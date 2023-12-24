import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps, InspectorControls } from '@wordpress/block-editor'
import { PanelBody, PanelRow } from '@wordpress/components'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'

const ALLOWED_BLOCKS = [
	'bigup-forms/form-name',
	'bigup-forms/form-email',
	'bigup-forms/form-message',
	'bigup-forms/form-files',
	'bigup-forms/form-text-field'
];

export default function Edit() {

	const blockProps = useBlockProps( {
		className: 'bigup__form'
	} )

	return (
		<form
			{ ...blockProps }
			method='post'
			acceptCharset='utf-8'
			autocomplete='on'
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
	)
}
