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
			<input
				{ ...blockProps }
				name='email'
				type='text'
				maxlength='100'
				title='Email'
				aria-label='Email'
				placeholder='Email (required)'
				onfocus='this.placeholder=""'
				onblur='this.placeholder="Email (required)"'
				required={ true }
			/>
		</InputWrapper>
	)
}
