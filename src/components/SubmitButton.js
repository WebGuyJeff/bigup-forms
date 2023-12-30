const SubmitButton = () => {
	return (
		<div className='bigup__form_buttonWrap'>
			<button className='button bigup__form_submit wp-element-button' type='submit' value='Submit' disabled>
				<span className='bigup__form_submitLabel-ready'>
					{'Submit'}
				</span>
				<span className='bigup__form_submitLabel-notReady'>
					{'[please wait]'}
				</span>
			</button>
		</div>
	)
}

export { SubmitButton }
