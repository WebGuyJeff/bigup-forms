<?php
namespace BigupWeb\Forms;

/**
 * Plugin Name: Bigup Web: Bigup Forms
 * Plugin URI: https://webguyjeff.com
 * Description: A customisable form plugin for WordPress Gutenberg Editor.
 * Version: 0.8.0
 * Author: Jefferson Real
 * Author URI: https://webguyjeff.com
 * License: GPL2
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

define( 'BIGUPFORMS_PATH', trailingslashit( __DIR__ ) );

// Register namespaced autoloader.
$namespace = 'BigupWeb\\Forms\\';
$root      = BIGUPFORMS_PATH . 'classes/';
require_once $root . 'autoload.php';

// Load OAuth before Settings::get() so mail + transport helpers can reference provider classes safely.
require_once BIGUPFORMS_PATH . 'inc/oauth/oauth-provider-interface.class.php';
require_once BIGUPFORMS_PATH . 'inc/oauth/oauth-provider-microsoft.class.php';
require_once BIGUPFORMS_PATH . 'inc/oauth/oauth-manager.class.php';
require_once BIGUPFORMS_PATH . 'inc/oauth/oauth-hooks.php';

$settings     = Settings::get();
$enable_debug = ! empty( $settings['debug'] );

define( 'BIGUPFORMS_DEBUG', $enable_debug );
define( 'BIGUPFORMS_URL', trailingslashit( get_site_url( null, strstr( __DIR__, '/wp-content/' ) ) ) );

// Setup the plugin.
$init = new Init();
$init->setup();
