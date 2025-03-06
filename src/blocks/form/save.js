import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'
import { ResetButton } from '../../components/ResetButton'

export default function save( { attributes } ) {

	const {
		formID, // CPT Post ID for the saved form.
		formName,
		textAlign,
		title,
		showTitle,
		showResetButton
	} = attributes

	const blockProps = useBlockProps.save( {
		className: 'bigup__form',
		style: { textAlign: textAlign }
	} )

	return (
		<form
			{ ...blockProps }
			method='post'
			acceptCharset='utf-8'
			autoComplete='on'
			name={ formName }
			data-form-id={ formID }
		>

			<header>
				{ title && showTitle &&
					<h2>
						{ title }
					</h2>
				}
			</header>

			<div className='bigup__form_section'>

				<Honeypot />

				<InnerBlocks.Content />

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
	)
}
