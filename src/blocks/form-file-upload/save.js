import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'

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
					multiple={ true }
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
