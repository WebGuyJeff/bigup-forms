import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor'
import { Honeypot } from '../../components/Honeypot'
import { SubmitButton } from '../../components/SubmitButton'
import { ResetButton } from '../../components/ResetButton'

export default function save( { attributes } ) {

	const {
		uniqueID, // ID unique to every form block.
		formPostID, // CPT Post ID for the saved form.
		formName,
		textAlign,
		title,
		showTitle,
		showResetButton
	} = attributes

	const blockProps = useBlockProps.save( {
		className: 'bigupForms__form',
		style: { textAlign: textAlign },
		'data-unique-id': uniqueID,
		'data-form-post-id': formPostID,
		name: formName,
		method: 'post',
		acceptCharset: 'utf-8',
		autoComplete: 'on'
	} )

	return (
		<form { ...blockProps } >

			<header>
				{ title && showTitle &&
					<h2>
						{ title }
					</h2>
				}
			</header>

			<div className='bigupForms__blockContainer'>

				<Honeypot />

				<InnerBlocks.Content />

				<div className='bigupForms__controls'>
					<SubmitButton />
					{ showResetButton &&
						<ResetButton />
					}
				</div>

			</div>

			<footer>
				<div className='bigupForms__alertsContainer' style={{ display: 'none', opacity: 0 }}>
					<output className='bigupForms__alerts'></output>
				</div>
			</footer>

		</form>
	)
}
