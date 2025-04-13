import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BinIcon, FileIcon } from './svg'

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
					title={ __( 'Attach a File', 'bigup-forms' ) }
					type='file'
					name='files'
					multiple={ true }
				/>
				<span className='bigup__customFileUpload_icon'>
					<FileIcon />
				</span>	
				{ __( 'Attach File', 'bigup-forms' ) }
			</label>
			<div className='bigup__customFileUpload_output'></div>
			<template>
				<span className='bigup__customFileUpload_icon'>
					<BinIcon />
				</span>	
			</template>
		</div>
	)
}
