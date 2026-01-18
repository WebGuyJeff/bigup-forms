import { __ } from '@wordpress/i18n'
import { useBlockProps, RichText } from '@wordpress/block-editor'
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
export default function save( { attributes } ) {

	const {
		uniqueID,
		label
	} = attributes

	const blockProps = useBlockProps.save( {
		'data-unique-id': uniqueID,
		className: 'bigupForms__customFileUpload bigupForms__blockWrap'
	} )

	const filesID = 'files-' + uniqueID
	const labelID = 'label-' + uniqueID

	return (
		<div { ...blockProps }>
			<label
				className='bigupForms__customFileUpload_button'
				tabIndex={ '0' }
			>
				<RichText.Content
					id={ filesID }
					className='bigupForms__customFileUpload_input'
					tagName={ 'input' }
					type='file'
					name='files'
					multiple={ true }
				/>
				<span className='bigupForms__customFileUpload_icon bigupForms__customFileUpload_icon-file'>
					<FileIcon />
				</span>	
				<RichText.Content
					id={ labelID }
					className={ 'bigupForms__customFileUpload_label' }
					tagName={ 'span' }
					htmlFor={ filesID }
					value={ label }
				/>
			</label>
			<table className={ 'bigupForms__customFileUpload_output' }>
				<thead>
					<tr>
						<th scope={ 'col' }>{ __( 'Filename', 'bigup-forms' ) }</th>
						<th scope={ 'col' }>{ __( 'Type', 'bigup-forms' ) }</th>
						<th scope={ 'col' }>{ __( 'Size', 'bigup-forms' ) }</th>
						<th scope={ 'col' }>{ __( 'Remove', 'bigup-forms' ) }</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
			<template>
				<tr>
					<td className={ 'bigupForms__customFileUpload_fileName' }></td>
					<td className={ 'bigupForms__customFileUpload_fileType' }></td>
					<td className={ 'bigupForms__customFileUpload_fileSize' }></td>
					<td>
						<button
							title={ __( 'Remove file', 'bigup-forms' ) }
							aria-label={ __( 'Remove file', 'bigup-forms' ) }
						>
							<span className={ 'bigupForms__customFileUpload_icon bigupForms__customFileUpload_icon-bin' }>
								<BinIcon />
							</span>
						</button>
					</td>
				</tr>
			</template>
		</div>
	)
}
