<?php
namespace Bigup\Forms;

/**
 * Plugin Name: Bigup Web: Bigup Forms
 * Plugin URI: https://jeffersonreal.uk
 * Description: A customisable form plugin for WordPress Gutenberg Editor.
 * Version: 0.6.6
 * Author: Jefferson Real
 * Author URI: https://jeffersonreal.uk
 * License: GPL2
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2023, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */

// Set global constants.
define( 'BIGUPFORMS_DEBUG', defined( 'WP_DEBUG' ) && WP_DEBUG === true );
define( 'BIGUPFORMS_PATH', trailingslashit( __DIR__ ) );
define( 'BIGUPFORMS_URL', trailingslashit( get_site_url( null, strstr( __DIR__, '/wp-content/' ) ) ) );

// Setup PHP namespace.
require_once BIGUPFORMS_PATH . 'classes/autoload.php';

// Setup the plugin.
$Init = new Init();
$Init->setup();
