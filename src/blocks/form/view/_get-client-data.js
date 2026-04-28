const getClientData = async () => {

	const ip = await getIP()

	return {
		
        // Browser & OS
        softwareUserAgent: navigator.userAgent, // Browser name, version, and operating system.
        softwarePlatform: navigator?.platform || 'unknown', // System platform (e.g., "Win32", "MacIntel").
        softwareLanguage: navigator.language, // Preferred language setting.
        softwareCookiesEnabled: navigator.cookieEnabled, // If the browser allows tracking.
        
        // Hardware
        hardwareCores: navigator?.hardwareConcurrency || 'unknown', // Number of logical processors.
        hardwareMemory: navigator?.deviceMemory + 'gb' || 'unknown', // Approximate amount of RAM in GB.
        
        // Display
        displayScreenResolution: window.screen.width + 'x' + window.screen.height, // Screen resolution.
		displayViewportWidth: window.innerWidth + 'x' + window.innerHeight, // Viewport dimensions.
        displayPixelRatio: window.devicePixelRatio, // Help identify High-DPI or "Retina" displays.
        
        // Localization & Time
        locationTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // IANA timezone (e.g., "America/New_York").
		locationIP: ip, // Public IP address.
        
        // Connection (if available)
        ConnectionEffectiveType: navigator?.connection?.effectiveType || 'unknown',
		ConnectionDownSpeed: navigator?.connection?.downlink + 'mbps' || 'unknown'
    }
}

const getIP = async () => {
	const timeout  = 2000 // Don't hold up form submit for longer than this time.
	try {
		const response = await fetch( 'https://api.ipify.org?format=json', { signal: AbortSignal.timeout( timeout ) } )
		const data     = await response.json()
		return data.ip
	} catch ( error ) {
		return JSON.stringify( error )
	}
}


export { getClientData }
