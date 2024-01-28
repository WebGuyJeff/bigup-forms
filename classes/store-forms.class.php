<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Store Forms.
 *
 * Handle saved forms as a custom post type.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @license GPL3+
 * @link https://jeffersonreal.uk
 */

// WordPress dependencies.
use function register_post_type;
use function register_taxonomy_for_object_type;
use function add_meta_box;
use function add_action;
use function wp_insert_post;
use function is_wp_error;
use function get_error_message;
use function sanitize_title;

class Store_Forms {

	public const MENU_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICA8cGF0aCBmaWxsPSIjMDAwIiBkPSJNMi40IDBBMi40IDIuNCAwIDAgMCAwIDIuNHYxOS4yQTIuNCAyLjQgMCAwIDAgMi40IDI0aDE5LjJhMi40IDIuNCAwIDAgMCAyLjQtMi40VjIuNEEyLjQgMi40IDAgMCAwIDIxLjYgMFptMCAxLjJoMTkuMmMuNjcgMCAxLjIuNTMgMS4yIDEuMnYxOS4yYzAgLjY3LS41MyAxLjItMS4yIDEuMkgyLjRhMS4yIDEuMiAwIDAgMS0xLjItMS4yVjIuNGMwLS42Ny41My0xLjIgMS4yLTEuMlptMS4yIDEuMmMtLjY3IDAtMS4yLjUzLTEuMiAxLjJ2Mi4xMWMwIC42Ny41MyAxLjIgMS4yIDEuMmgxMmMuNjcgMCAxLjItLjUzIDEuMi0xLjJWMy42YzAtLjY3LS41My0xLjItMS4yLTEuMlptLjYgMS4ySDE1Yy4zNCAwIC42LjI2LjYuNnYuOTFhLjYuNiAwIDAgMS0uNi42SDQuMmEuNi42IDAgMCAxLS42LS42VjQuMmMwLS4zNC4yNi0uNi42LS42Wk0zLjYgOGMtLjY3IDAtMS4yLjU0LTEuMiAxLjJ2Mi4xYzAgLjY4LjUzIDEuMiAxLjIgMS4yaDE2Ljc1Yy42NyAwIDEuMi0uNTIgMS4yLTEuMlY5LjJjMC0uNjYtLjUzLTEuMi0xLjItMS4yWm0uNiAxLjJoMTUuNTVjLjM0IDAgLjYuMjYuNi42di45YS42LjYgMCAwIDEtLjYuNkg0LjJhLjYuNiAwIDAgMS0uNi0uNnYtLjljMC0uMzQuMjYtLjYuNi0uNlptLS42IDQuNGMtLjY3IDAtMS4yLjU0LTEuMiAxLjJ2Mi4xMmMwIC42NS41MyAxLjIgMS4yIDEuMmgxNi44Yy42NyAwIDEuMi0uNTUgMS4yLTEuMnYtMi4xMWMwLS42Ny0uNTMtMS4yLTEuMi0xLjJabS42IDEuMmgxNS42Yy4zNCAwIC42LjI3LjYuNnYuOTJhLjYuNiAwIDAgMS0uNi42SDQuMmEuNi42IDAgMCAxLS42LS42di0uOTFjMC0uMzQuMjYtLjYuNi0uNlptNS40IDQuNGExLjIgMS4yIDAgMSAwIDAgMi40aDQuOGExLjIgMS4yIDAgMSAwIDAtMi40WiIvPgo8L3N2Zz4K';

	/**
	 * @var string $prefix Prefix for storing custom fields in the postmeta table
	 */
	private $prefix = '_bufo_';

	/**
	 * @var string Post type ID
	 */
	private $post_type = 'bigup_form';

	/**
	 * @var string Metabox ID
	 */
	private $metabox = 'form-meta';

	/**
	 * @var array $custom_fields Defines the custom fields available
	 */
	private $custom_fields = array(
		array(
			'name'        => '_name',
			'title'       => 'Form name',
			'description' => '',
			'type'        => 'text',
		),
	);

	/**
	 * Register the custom post type.
	 */
	public function create_cpt() {
		register_post_type(
			$this->post_type,
			array(
				'labels'              => array(
					'name'               => 'Forms',
					'singular_name'      => 'Form',
					'add_new'            => 'New Form',
					'add_new_item'       => 'Add New Form',
					'edit_item'          => 'Edit Form',
					'new_item'           => 'New Form',
					'view_item'          => 'View Form',
					'search_items'       => 'Search Forms',
					'not_found'          => 'No Forms Found',
					'not_found_in_trash' => 'No Forms found in Trash',
				),
				'supports'            => array( 'title', 'editor', 'custom-fields' ),
				'description'         => 'Predefined and user created forms.',
				'public'              => true,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
				'query_var'           => false,
				'show_in_menu'        => true,
				'menu_position'       => 2,
				'menu_icon'           => self::MENU_ICON,
				'hierarchical'        => false,
				'taxonomies'          => array( 'tag' ),
				'show_in_rest'        => true,
				'delete_with_user'    => false,
				// 'capabilities'     => array( 'create_posts' => false )
			)
		);
		register_taxonomy_for_object_type( 'tag', $this->post_type );
		add_action( 'admin_menu', array( &$this, 'create_custom_fields' ) );
		add_action( 'save_post', array( &$this, 'save_custom_fields' ), 1, 2 );
		add_action( 'do_meta_boxes', array( &$this, 'remove_default_custom_fields' ), 10, 3 );
	}

	/**
	 * Remove default Custom Fields meta box
	 */
	public function remove_default_custom_fields( $type, $context, $post ) {
		foreach ( array( 'normal', 'advanced', 'side' ) as $context ) {
			remove_meta_box( 'postcustom', $this->post_type, $context );
		}
	}

	/**
	 * Create new Custom Fields meta box
	 */
	public function create_custom_fields() {
		add_meta_box( $this->metabox, 'Form Meta', array( &$this, 'display_custom_fields' ), $this->post_type, 'normal', 'high' );
	}

	/**
	 * Display the new Custom Fields meta box
	 */
	public function display_custom_fields() {
		global $post;
		?>
		<div class="form-wrap">
			<?php
			wp_nonce_field( $this->metabox, $this->metabox . '_wpnonce', false, true );
			foreach ( $this->custom_fields as $field ) {
				?>
				<div class="form-field form-required">
					<?php
					switch ( $field['type'] ) {
						case 'text':
						case 'email':
						case 'tel':
						case 'url':
						case 'number':
						case 'time':
						case 'date':
							echo '<label for="' . $this->prefix . $field['name'] . '"><b>' . $field['title'] . '</b></label>';
							echo '<input type="' . $field['type'] . '" name="' . $this->prefix . $field['name'] . '" id="' . $this->prefix . $field['name'] . '" value="' . htmlspecialchars( get_post_meta( $post->ID, $this->prefix . $field['name'], true ) ) . '" />';
							break;

						case 'textarea': {
							echo '<label for="' . $this->prefix . $field['name'] . '"><b>' . $field['title'] . '</b></label>';
							echo '<textarea name="' . $this->prefix . $field['name'] . '" id="' . $this->prefix . $field['name'] . '" columns="30" rows="3">' . htmlspecialchars( get_post_meta( $post->ID, $this->prefix . $field['name'], true ) ) . '</textarea>';
							break;
						}
						case 'checkbox': {
							echo '<label for="' . $this->prefix . $field['name'] . '" style="display:inline;"><b>' . $field['title'] . '</b></label>';
							echo '<input type="checkbox" name="' . $this->prefix . $field['name'] . '" id="' . $this->prefix . $field['name'] . '" value="yes"';
							if ( get_post_meta( $post->ID, $this->prefix . $field['name'], true ) == 'yes' ) {
								echo ' checked="checked"';
							}
							echo '" style="width: auto;" />';
							break;
						}
						default: {
							echo '<label>Custom field output error: Field type "' . $field['type'] . '" not found.</label>';
							error_log( 'Bigup_Forms: field output type "' . $field['type'] . '" not found.' );
							break;
						}
					}
					?>
					<?php
					if ( $field['description'] ) {
						echo '<p>' . $field['description'] . '</p>';}
					?>
				</div>
				<?php
			}
			?>
		</div>
		<?php
	}

	/**
	 * Save the new Custom Fields values
	 */
	function save_custom_fields( $post_id, $post ) {
		if ( ! isset( $_POST[ $this->metabox . '_wpnonce' ] )
			|| ! wp_verify_nonce( $_POST[ $this->metabox . '_wpnonce' ], $this->metabox )
			|| ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		foreach ( $this->custom_fields as $field ) {
			if ( isset( $_POST[ $this->prefix . $field['name'] ] ) && trim( $_POST[ $this->prefix . $field['name'] ] ) ) {
				$value = $_POST[ $this->prefix . $field['name'] ];
				// Auto-paragraphs for multiline text fields.
				if ( $field['type'] == 'textarea' ) {
					$value = wpautop( $value );
				}
					update_post_meta( $post_id, $this->prefix . $field['name'], $value );
			} else {
				delete_post_meta( $post_id, $this->prefix . $field['name'] );
			}
		}
	}

	/**
	 * Log a new form submission.
	 */
	public static function save( $form_id, $form_name, $content, $tags ) {

		$form_title = date( 'd-m-Y_' ) . sanitize_title( strtolower( $form_name ) );

		$result = wp_insert_post(
			array(
				'ID'           => $form_id,     // If equal to something other than 0, the post with that ID will be updated.
				'post_type'    => 'bigup_form',
				'post_status'  => 'publish',
				'post_title'   => $form_title,
				'post_content' => $content,
				'tags_input'   => $tags,
				'meta_input'   => array(
					'_bufo__name' => $form_name,
				),
			),
			true
		);
		if ( is_wp_error( $result ) ) {
			error_log( $result->get_error_message() );
			return false;
		} elseif ( 0 === $result ) {
			error_log( 'Bigup Forms: Unknown error 0 returned from wp_insert_post()' );
			return false;
		} else {
			$form_post_id = $result;
			return $form_post_id;
		}
	}
}
