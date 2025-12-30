<?php
namespace BigupWeb\Forms;

/**
 * Regex tools.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright 2023 Jefferson Real
 */


/**
 * Tools for working with regular expressions.
 */
class Regex {

	/**
	 * Convert a PHP regex string to a value compatible with HTML input `pattern`.
	 *
	 * HTML pattern notes:
	 * - No delimiters, no flags.
	 * - Implicitly anchored to the entire value (behaves like ^(?:pattern)$).
	 * - Uses JS regex syntax, but not all modern features are supported consistently.
	 *
	 * @param string $php_regex Regex string.
	 * @param string $flags    Flags like "imsugy" (ignored for HTML pattern).
	 * @param array  $opts     Options:
	 *   - strip_anchors (bool) default true: remove one leading ^ and one trailing $.
	 *   - drop_unsupported (bool) default true: strip or reject unsupported tokens.
	 *
	 * @return array{
	 *   pattern_attr:string,
	 *   warnings:array<int,string>,
	 *   dropped_flags:array<int,string>
	 * }
	 */
	public static function php_regex_to_html_pattern(
		string $php_regex,
		string $flags = '',
		array $opts = array(
			'strip_anchors'    => true,
			'drop_unsupported' => true,
		)
	) {

		$strip_anchors    = (bool) $opts['strip_anchors'];
		$drop_unsupported = (bool) $opts['drop_unsupported'];

		$warnings = array();

		// 1) Warn about unused flags which are not supported in HTML pattern.
		if ( '' !== $flags ) {
			$warnings[] = 'HTML pattern does not support flags; flags were dropped: ' . $flags;
		}

		$p = $php_regex;

		// 2) Strip delimiters. Accounts for /pattern/flags in case included in string.
		if ( preg_match( '#^/([\s\S]+)/([a-z]*)$#i', $p, $m ) ) {
			$p = $m[1];
			if ( isset( $m[2] ) && '' !== $m[2] ) {
				$warnings[] = 'Regex flags (' . $m[2] . ') detected and removed.';
			}
			$warnings[] = 'Regex delimiters (/.../) detected and removed.';
		}

		// 3) HTML pattern should be single-line.
		if ( preg_match( "/[\r\n]/", $p ) ) {
			$p          = str_replace( array( "\r", "\n" ), '', $p );
			$warnings[] = 'Newlines are not allowed in HTML pattern; they were removed.';
		}

		// 4) Strip anchors (HTML patterns are implicitly anchored).
		if ( $strip_anchors ) {
			$p2 = preg_replace( '/^\^/', '', $p );
			if ( $p2 !== $p ) {
				$p          = $p2;
				$warnings[] = 'Leading ^ anchor removed (HTML pattern is implicitly anchored).';
			}
			$p2 = preg_replace( '/\$$/', '', $p );
			if ( $p2 !== $p ) {
				$p          = $p2;
				$warnings[] = 'Trailing $ anchor removed (HTML pattern is implicitly anchored).';
			}
		}

		// 5) Remove unsupported / risky constructs for HTML pattern (best-effort).
		// NOTE: We can’t perfectly parse regex with regex, so we handle common cases.
		if ( $drop_unsupported ) {
			// Lookbehind: (?<=...) (?<!...).
			if ( preg_match( '/\(\?<=[\s\S]*?\)|\(\?<![\s\S]*?\)/', $p ) ) {
				$warnings[] = 'Lookbehind detected; HTML pattern support is inconsistent. Pattern may fail in some browsers.';
				// Best: do NOT attempt to rewrite lookbehind; keep as-is but warn.
			}

			// Unicode property escapes \p{L} / \P{...} require /u and aren’t reliably supported in pattern across browsers.
			if ( preg_match( '/\\\\[pP]\{[^}]+\}/', $p ) ) {
				$warnings[] = 'Unicode property escapes (\\p{…}/\\P{…}) detected; not reliably supported in HTML pattern.';
				// Keep, but warn.
			}

			// Named capturing groups: (?<name>...) are supported in modern JS but may be inconsistent in HTML pattern engines.
			if ( preg_match( '/\(\?<([A-Za-z_]\w*)>/', $p ) ) {
				$warnings[] = 'Named capturing groups detected; may not be supported by all browsers in HTML pattern.';
				// Keep, but warn.
			}

			// Inline modifiers like (?i) are PCRE-style (not JS) and will break in HTML pattern.
			if ( preg_match( '/\(\?[imsuxU-]+:?/', $p ) ) {
				$warnings[] = 'Inline modifiers like (?i) detected (PCRE-style); these are not valid in HTML pattern.';
				// Remove them (best-effort).
				$p = preg_replace( '/\(\?[imsuxU-]+:?/', '(?:', $p );
			}
		}

		$pattern_attr = is_string( $p ) ? $p : '';

		return array(
			$pattern_attr,
			$warnings,
		);
	}
}
