import { __ } from '@wordpress/i18n'
import { useBlockProps, RichText } from '@wordpress/block-editor'

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
		label,
		showLabel,
		name,
		options,
		defaultText,
		required
	} = attributes

	const blockProps = useBlockProps.save( {
		'data-unique-id': uniqueID,
		className: 'bigupForms__blockWrap',
	} )

	const selectID = 'select-' + uniqueID
	const labelID  = 'label-' + uniqueID

	const conditionalProps = {}
	if ( showLabel ) {
		conditionalProps[ 'aria-labelledby' ] = labelID
	} else {
		conditionalProps[ 'aria-label' ] = label
	}
	if ( required ) {
		conditionalProps[ 'required' ] = 'required'
		conditionalProps[ 'aria-required' ] = 'true'
	}

	return (
		<div { ...blockProps }>
			{ showLabel && label &&
				<RichText.Content
					id={ labelID }
					className={ 'bigupForms__label' }
					tagName={ 'label' }
					htmlFor={ inputID }
					value={ label }
				/>
			}
			<div className={ 'bigupForms__selectWrap' }>
				<select
					id={ selectID }
					name={ name }
					className={ 'bigupForms__select' }
					{ ...conditionalProps }
				>
					<option
						className={ 'bigupForms__selectDefaultText' }
						value=''
						disabled
						selected
						hidden
					>{ defaultText }</option>
					{
						Object.keys( options ).length > 0 && (
							options.map( ( { value, text }, index ) => {
								return (
									<option
										key={ index }
										value={ value }
									>
										{ text }
									</option>
								)
							} )
						)
					}
				</ select>
			</div>
		</div>
	)
}
