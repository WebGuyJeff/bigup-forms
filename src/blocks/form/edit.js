import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor'
import { Honeypot } from '../../components/Honeypot'

const ALLOWED_BLOCKS = [
	'bigup-forms/form-name',
	'bigup-forms/form-email',
	'bigup-forms/form-message',
	'bigup-forms/form-files'
];

export default function Edit() {

	const noStyles = false, // Bool - remove all styles on true.
		styles     = true,  // Bool - Apply fancy dark theme on true.
		classes = [
			'bigup__form',
			noStyles ? 'bigup__form-nostyles' : '',              // noStyles === true.
			styles ? 'bigup__form-dark' : 'bigup__form-vanilla'  // styles === true.
		]

	const blockProps = useBlockProps( {
		className: classes
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

				<button className='button bigup__form_submit' type='submit' value='Submit' disabled>
					<span className='bigup__form_submitLabel-ready'>
						{'Submit'}
					</span>
					<span className='bigup__form_submitLabel-notReady'>
						{'[please wait]'}
					</span>
				</button>

			</div>

			<footer>
				<div className='bigup__alert_output' style={{ display: 'none', opacity: 0 }}></div>
			</footer>

		</form>
	)
}
