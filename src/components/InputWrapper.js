import { InnerBlocks } from '@wordpress/block-editor'

const InputWrapper = () => {
	return (
		<div class='bigup__form_inputWrap'>
			<InnerBlocks/>
			<span className='bigup__form_flag bigup__form_flag-hover'></span>
			<span className='bigup__form_flag bigup__form_flag-focus'></span>
		</div>
	)
}

export { InputWrapper }