<?php
namespace BigupWeb\Forms;

/**
 * Plugin Name: Bigup Web: Bigup Forms
 * Plugin URI: https://jeffersonreal.uk
 * Description: A customisable form plugin for WordPress Gutenberg Editor.
 * Version: 0.7.2
 * Author: Jefferson Real
 * Author URI: https://jeffersonreal.uk
 * License: GPL2
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL3+
 * @link https://jeffersonreal.uk
 */

$settings     = get_option( 'bigup_forms_settings' );
$enable_debug = ( $settings && array_key_exists( 'debug', $settings ) && $settings['debug'] ) ? true : false;

// Set global constants.
define( 'BIGUPFORMS_DEBUG', $enable_debug );
define( 'BIGUPFORMS_PATH', trailingslashit( __DIR__ ) );
define( 'BIGUPFORMS_URL', trailingslashit( get_site_url( null, strstr( __DIR__, '/wp-content/' ) ) ) );

// Register namespaced autoloader.
$namespace = 'BigupWeb\\Forms\\';
$root      = BIGUPFORMS_PATH . 'classes/';
require_once $root . 'autoload.php';

// Setup the plugin.
$init = new Init();
$init->setup();
