<?php

/**
 * Validation Formats
 *
 * Data format rules for use on front and back end for consistent validation.
 *
 */

$validation_formats = array(
	'alphanumeric_slug'          => array(
		'non_public_description' => 'Allows any-case alphanumeric and non-consecutive underscores and hyphens but not at beginning or end.',
		'regex_format'           => "/^[\p{L}\p{N}](?:[\p{L}\p{N}]|([_-])(?!\1))+[\p{L}\p{N}]$/u",
		'regex_allowed_chars'    => '/[\p{L}\p{N}-_]/u',
		'max_length'             => 999,
		'min_length'             => 0,
	),
	'human_name_international'   => array(
		'non_public_description' => 'Allows any-case alpha, non-consecutive spaces, hyphens, single-quotes, commas and full-stops, and an infinite number of words. Currently missing international punctuation.',
		'regex_format'           => "/^[\p{L}](?:[\p{L}]|([- ',\.])(?!\1))*$/u",
		'regex_allowed_chars'    => "/[\p{L}- ',\.]/u",
		'max_length'             => 50,
		'min_length'             => 2,
	),
	'phone_number_international' => array(
		'non_public_description' => 'Matches common international characters used in phone numbers including +-() and allows whitespace. See https://stackoverflow.com/questions/8634139/phone-validation-regex#answer-53297852',
		'regex_format'           => '^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$',
		'regex_allowed_chars'    => '[+ ()-]',
		'max_length'             => 20,
		'min_length'             => 5,
	),
	'email_non_rfc'              => array(
		'non_public_description' => 'Non-RFC compliant. For RFC compliance, do not use regex! Matches common formats allowed by mainstream providers. Max 254 chars, 64 of which must be before @. Allows underscores, full-stops, plus, hyphen, and must have a full-stop after the @ for TLDs. The TLD may contain further full-stops.',
		'regex_format'           => '/^(?=.{6,254}$)[\p{L}\p{N}_.+-]{1,64}@[\p{L}\p{N}-]+\.[\p{L}\p{N}.-]+$/u',
		'regex_allowed_chars'    => '/[\p{L}p{N}_.+-]/u',
		'max_length'             => 254,
		'min_length'             => 6,
	),
	'domain_non_rfc'             => array(
		'non_public_description' => 'Non-RFC compliant. Covers most domain names. See https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd/30007882#answer-26987741',
		'regex_format'           => '/^((?!-))(xn--)?[\p{L}\p{N}][\p{L}\p{N}-]{0,61}[\p{L}\p{N}]{0,1}\.(xn--)?([\p{L}\p{N}\-]{1,61}|[\p{L}\p{N}-]{1,30}\.[\p{L}{2,})$/u',
		'regex_allowed_chars'    => '/[\p{L}\p{N}-\.]/u',
		'max_length'             => 253,
		'min_length'             => 4,
	),
	'port_number'                => array(
		'non_public_description' => 'Only allows valid port numbers. See https://stackoverflow.com/questions/12968093/regex-to-validate-port-number#answer-12968117',
		'regex_format'           => '^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$',
		'regex_allowed_chars'    => '[0-9]',
		'max_length'             => 5,
		'min_length'             => 1,
	),
);
