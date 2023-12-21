const SubmitButton = () => {
	return (
		<button className='button bigup__form_submit' type='submit' value='Submit' disabled>
			<span className='bigup__form_submitLabel-ready'>
				{'Submit'}
			</span>
			<span className='bigup__form_submitLabel-notReady'>
				{'[please wait]'}
			</span>
		</button>
	)
}

export { SubmitButton }
