const SubmitButton = () => {
	return (
		<div className='bigupForms__buttonWrap'>
			<button className='button bigupForms__submit wp-element-button' type='submit' value='Submit' disabled>
				<span className='bigupForms__submitLabel-ready'>
					{'Submit'}
				</span>
				<span className='bigupForms__submitLabel-notReady'>
					{'[please wait]'}
				</span>
			</button>
		</div>
	)
}

export { SubmitButton }
