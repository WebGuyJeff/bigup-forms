import { __ } from '@wordpress/i18n'
import { PanelBody, PanelRow, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor'
import { InputWrapper } from '../../components/InputWrapper'
import metadata from './block.json'

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes }  ) {

	// Input field friendly-names.
	const { type, name, label, required, placeholder, value, maxlength } = attributes;

	const typeOptions = [
		{ label: __('Text', 'bigup-forms'), value: 'text' },
		{ label: __('Text Large', 'bigup-forms'), value: 'textarea' },
		{ label: __('Password', 'bigup-forms'), value: 'password' },
		{ label: __('Email', 'bigup-forms'), value: 'email' },
		{ label: __('Number', 'bigup-forms'), value: 'number' },
		{ label: __('Phone', 'bigup-forms'), value: 'tel' },
		{ label: __('URL', 'bigup-forms'), value: 'url' },
		{ label: __('Date', 'bigup-forms'), value: 'date' },
		{ label: __('Time', 'bigup-forms'), value: 'time' },
	];

	const placeholderPlaceholders = {
		'text': __('type placeholder text', 'bigup-forms'),
		'textarea': __('type placeholder text', 'bigup-forms'),
		'password': __('******', 'bigup-forms'),
		'email': __('type email placeholder text', 'bigup-forms'),
		'number': __('123', 'bigup-forms'),
		'tel': __('08000 123 456', 'bigup-forms'),
		'url': __('https://url.placeholder.text', 'bigup-forms'),
		'date': '2000-01-01',
		'time': '09:00'
	}

	const setPlaceholder = ( type ) => {
		setAttributes( { placeholder: placeholderPlaceholders[ type ] } )
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

    const inputAttributes = {
		'name': name,
		'className': "bigup__form_input",
		'id': 'inner-' + blockProps.id,
		'title': label,
		'aria-label': label,
		'placeholder': placeholder,
		'onfocus': 'this.placeholder=""',
		'onblur': 'this.placeholder="Name (required)"',
		'required': required
    }
	// Add these attributes conditionally.
	if ( 'textarea' !== type ) inputAttributes.type = type
	if ( maxlength ) inputAttributes.maxlength = maxlength

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
