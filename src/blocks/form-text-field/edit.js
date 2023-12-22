import { __ } from '@wordpress/i18n'
import { PanelBody, PanelRow, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrapper } from '../../components/InputWrapper'
import metadata from './block.json'
import { definition } from './definition'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes }  ) {

	const { type, name, label, required, placeholder, value, maxlength } = attributes
	const { text, textarea, password, email, number, tel, url, date, time } = definition

console.log( definition[type] )

	const typeOptions = [
		{ label: text.label, value: 'text' },
		{ label: textarea.label, value: 'textarea' },
		{ label: password.label, value: 'password' },
		{ label: email.label, value: 'email' },
		{ label: number.label, value: 'number' },
		{ label: tel.label, value: 'tel' },
		{ label: url.label, value: 'url' },
		{ label: date.label, value: 'date' },
		{ label: time.label, value: 'time' },
	];

	const setPlaceholder = ( type ) => {
		setAttributes( { placeholder: [ type ].placeholder } )
	}
	if ( ! placeholder ) setPlaceholder( type )

	const typeChangeHandler = ( newType ) => {
		setAttributes( { type: newType } )
		setPlaceholder( newType )
	}

	const blockProps = useBlockProps( {
		className: 'bigup__form_inputWrap'
	} )

	const InputTagName = ( 'textarea' === type ) ? 'textarea' : 'input'

	//let validationAttrs = definition[type].validationAttrs.forEach( attr => {
	//	attr: attributes[attr]
	//} )

	let validationAttrs = {};
	for ( const [ key, value ] of Object.entries( definition[type].validationAttrs ) ) {
		validationAttrs[key] = attributes[key]
	}

	console.log(validationAttrs)

    const inputAttributes = {
		'name': name,
		'className': "bigup__form_input",
		'id': 'inner-' + blockProps.id,
		'title': label,
		'aria-label': label,
		'placeholder': placeholder,
		'onfocus': 'this.placeholder=""',
		'onblur': 'this.placeholder="Name (required)"',
		'required': required,
		...validationAttrs
    }
	// Add these attributes conditionally.
	if ( 'textarea' !== type ) inputAttributes.type = type

	return (

		<>
			<InspectorControls>
				<PanelBody title={ __( 'Input settings' ) }>
					<SelectControl
						label="Type"
						labelPosition="Left"
						title="fieldType"
						value={ type }
						options={ typeOptions }
						onChange={ ( newValue ) => typeChangeHandler( newValue ) }
					/>
					<CheckboxControl
						label={ __( 'Required' ) }
						checked={ required }
						onChange={ ( newValue ) => { setAttributes( { required: newValue, } ) } }
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				<TextControl
					autoComplete="off"
					label={ __( 'Name' ) }
					value={ name }
					onChange={ ( newValue ) => { setAttributes( { name: newValue, } ) } }
					help={ __( 'Name of the field in the submitted results.' ) }
				/>
			</InspectorControls>

			<InputWrapper props={ blockProps } >
				<RichText
					tagName="label"
					for={ 'inner-' + blockProps.id }
					className="bigup__form_inputLabel"
					value={ label }
					onChange={ ( newValue ) => setAttributes( { label: newValue } ) }
					aria-label={ label ? __( 'Label' ) : __( 'Empty label' ) }
					placeholder={ __( 'Add a label to this input' ) }
				/>
				<InputTagName { ...inputAttributes } />
			</InputWrapper>

		</>
	)
}
