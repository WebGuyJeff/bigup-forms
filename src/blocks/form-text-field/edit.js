import { __ } from '@wordpress/i18n'
import { PanelBody, PanelRow, TextControl, CheckboxControl, SelectControl } from '@wordpress/components'
import { useBlockProps, InspectorControls } from '@wordpress/block-editor'
import { InputWrapper } from '../../components/InputWrapper'

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
	const { type, name, label, required, placeholder, value } = attributes;

	const typeOptions = [
		{ label: 'Text', value: 'text' },
		{ label: 'Text Large', value: 'textarea' },
		{ label: 'Password', value: 'password' },
		{ label: 'Email', value: 'email' },
		{ label: 'Number', value: 'number' },
		{ label: 'Phone', value: 'tel' },
		{ label: 'URL', value: 'url' },
		{ label: 'Date', value: 'date' },
		{ label: 'Time', value: 'time' },

	];


	const blockProps = useBlockProps( {
		className: 'bigup__form_input'
	} )

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
						onChange={ ( value ) =>
							setAttributes( { type: value } )
						}
					/>
					<CheckboxControl
						label={ __( 'Required' ) }
						checked={ required }
						onChange={ ( newVal ) => {
							setAttributes( {
								required: newVal,
							} )
						} }
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				<TextControl
					autoComplete="off"
					label={ __( 'Name' ) }
					value={ name }
					onChange={ ( newVal ) => {
						setAttributes( {
							name: newVal,
						} );
					} }
					help={ __(
						'Name of the field in the submitted results.'
					) }
				/>
			</InspectorControls>

			<InputWrapper>
				<RichText
					tagName="span"
					className="wp-block-form-input__label-content"
					value={ label }
					onChange={ ( newLabel ) =>
						setAttributes( { label: newLabel } )
					}
					aria-label={ label ? __( 'Label' ) : __( 'Empty label' ) }
					placeholder={ __( 'Type the label for this input' ) }
				/>
				<input
					{ ...blockProps }
					name={ name }
					type={ type }
					maxlength='100'
					title={ label }
					aria-label={ label }
					placeholder='Name (required)'
					onfocus='this.placeholder=""'
					onblur='this.placeholder="Name (required)"'
					required={ required }
				/>
			</InputWrapper>z

		</>
	)
}
