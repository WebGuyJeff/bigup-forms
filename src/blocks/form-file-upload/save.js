import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BinIcon, FileIcon } from './svg'

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
		className: 'bigupForms__customFileUpload'
	} )

	return (
		<div { ...blockProps }>
			<label className='bigupForms__customFileUpload_label'>
				<input
					className='bigupForms__customFileUpload_input'
					title={ __( 'Attach a File', 'bigup-forms' ) }
					type='file'
					name='files'
					multiple={ true }
				/>
				<span className='bigupForms__customFileUpload_icon'>
					<FileIcon />
				</span>	
				{ __( 'Attach File', 'bigup-forms' ) }
			</label>
			<div className='bigupForms__customFileUpload_output'></div>
			<template>
				<span className='bigupForms__customFileUpload_icon'>
					<BinIcon />
				</span>	
			</template>
		</div>
	)
}
