import { alertsShowWaitHide } from './_alert'
import { removeChildren } from '../../../common/_util'


/**
 * Allowed MIME type array.
 * 
 * Eventually this should be populated from form plugin settings.
 */
const allowedMimeTypes = [
	'image/jpeg',																// .jpeg
	'image/png',																// .png
	'image/gif',																// .gif
	'image/webp',																// .webp
	'image/heic',																// .heic
	'image/heif',																// .heif
	'image/avif',																// .avif
	'image/svg+xml',															// .sgv
	'text/plain',																// .txt
	'application/pdf',															// .pdf
	'application/vnd.oasis.opendocument.text',									// .odt
	'application/vnd.oasis.opendocument.spreadsheet',							// .ods
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',	// .docx
	'application/msword',														// .doc
	'application/vnd.ms-excel',													// .xls
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 		// .xlsx
	'application/zip',															// .zip
	'application/vnd.rar'														// .rar
]


const disallowedTypes = {
	'detected': false,
	'list': []
}


/**
 * Remove a file from the selected file list.
 */
const removeFromFileList = ( event ) => {
	event.preventDefault()
	const button  = event.currentTarget,
		input     = button.closest( '.bigupForms__customFileUpload' ).querySelector( 'input' ),
		{ files } = input,
		filename  = button.closest( 'tr' ).querySelector( '.bigupForms__customFileUpload_fileName' ).innerText

	// Create a new file list and append it to the input.
	const dt = new DataTransfer()
	for ( let i = 0; i < files.length; i++ ) {
		const file = files[ i ]
		if ( file.name !== filename ) {
			dt.items.add( file ) // here you exclude the file. thus removing it.
		}
	}
	input.files = dt.files // Assign the updated list.
	updateFileList( input )
}


/**
 * Update the visible list with selected files.
 */
const updateFileList = async ( input ) => {
	const { files } = input,
		wrapper     = input.closest( '.bigupForms__customFileUpload' ),
		form        = input.closest( 'form' ),
		table       = wrapper.querySelector( 'table' ),
		tbody       = wrapper.querySelector( 'tbody' ),
		rowTemplate = wrapper.querySelector( 'template' )

	removeChildren( tbody )

	disallowedTypes.detected = false
	disallowedTypes.list = []

	// Loop through files.
	for ( var i = 0; i < files.length; ++i ) {
		const file = files[ i ]

		// Check for disallowed MIME types.
		let className = 'bigupForms__goodFileType'
		if ( ! allowedMimeTypes.includes( file.type ) ) {
			disallowedTypes.detected = true
			disallowedTypes.list.push( file.name.split( '.' ).pop() )
			className = 'bigupForms__badFileType'
		}

		// Create table row for file.
		const row    = rowTemplate.content.cloneNode( true ),
			tr       = row.querySelector( 'tr' ),
			cellName = row.querySelector( '.bigupForms__customFileUpload_fileName' ),
			cellType = row.querySelector( '.bigupForms__customFileUpload_fileType' ),
			cellSize = row.querySelector( '.bigupForms__customFileUpload_fileSize' ),
			button   = row.querySelector( 'button' ),
			sizeInMB = file.size / 1000000

		cellName.innerText = file.name
		cellType.innerText = file.type
		cellSize.innerText = Number.parseFloat( sizeInMB ).toFixed( 2 ) + ' MB'

		tr.classList.add( className )
		tbody.appendChild( tr )
		button.addEventListener( 'click', removeFromFileList )
	}

	if ( files.length > 0 ) {
		table.style.display = 'table'
	} else {
		table.style.display = 'none'
	}

	// Alert user of any disallowed MIME types.
	if ( disallowedTypes.detected ) {
		const fileExts   = disallowedTypes.list.join( ', ' )
		const fileAlerts = [ { 'text': `Files of type ".${fileExts}" are not allowed`, 'type': 'danger' } ]
		const wait       = 5000
		await alertsShowWaitHide( form, fileAlerts, wait )
	}
}


/**
 * Handle a file upload input.
 */
const fileUpload = ( event ) => {
	const input = event.currentTarget
	updateFileList( input )
}


export { fileUpload, disallowedTypes, updateFileList }
