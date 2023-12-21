import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { InputWrapper } from '../../components/InputWrapper'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit() {

	const blockProps = useBlockProps( {
		className: 'bigup__form_input'
	} )

	return (
		<InputWrapper>
			<textarea
				{ ...blockProps }
				name='message'
				maxlength='5000'
				title='Message'
				rows='8'
				aria-label='Message'
				placeholder='Type your message here...'
				onfocus='this.placeholder=""'
				onblur='this.placeholder="Type your message..."'
			/>
		</InputWrapper>
	)
}
