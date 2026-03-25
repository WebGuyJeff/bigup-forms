<?php
namespace BigupWeb\Forms;

defined( 'ABSPATH' ) || exit;

interface OAuth_Provider_Interface {

    public function get_authorization_url();

    public function get_access_token( $code );

    public function refresh_access_token( $refresh_token );

    public function get_access_token_string();

    public function get_email();
}