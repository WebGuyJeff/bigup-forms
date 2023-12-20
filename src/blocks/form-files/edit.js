import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'

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
		className: 'bigup__customFileUpload'
	} )

	return (
		<div { ...blockProps }>
			<label className='bigup__customFileUpload_label'>
				<input
					className='bigup__customFileUpload_input'
					title='Attach a File'
					type='file'
					name='files'
					multiple
				/>
				<span className='bigup__customFileUpload_icon'>
					{'[FILES ICON]'}
				</span>	
				{'Attach file'}
			</label>
			<div className='bigup__customFileUpload_output'></div>
			<template>
				<span className='bigup__customFileUpload_icon'>
					{'[BIN ICON]'}
				</span>	
			</template>
		</div>
	)
}
