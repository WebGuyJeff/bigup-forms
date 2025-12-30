const ResetButton = () => {
	return (
		<div className='bigupForms__buttonWrap is-style-outline'>
			<button
				className='bigupForms__button bigupForms__button-reset wp-element-button wp-block-button__link'
				disabled
			>
				<span>
					{'Reset'}
				</span>
			</button>
		</div>
	)
}

export { ResetButton }
