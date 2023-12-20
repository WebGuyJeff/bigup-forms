import { __ } from '@wordpress/i18n'
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor'

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save() {


	const blockProps = useBlockProps.save( {
		className: 'bigup__form'
	} )


	const Honeypot = () => {
		return (
			<input
				style={{ height: 0, overflow: 'hidden' }}
				className='bigup__form_input saveTheBees'
				name='required_field'
				type='text'
				autocomplete='off'
			/>
		)
	}



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