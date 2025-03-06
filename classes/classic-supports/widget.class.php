<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Widget.
 *
 * This template defines the widget including:
 *  - settings form
 *  - front end html
 *  - saving settings
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */
use WP_Widget;

class Widget extends WP_Widget {

	// Store widget options.
	private $bigup_widget_options;


	/**
	 * Construct the widget.
	 */
	public function __construct() {
		$this->bigup_widget_options = array(
			'classname'   => 'bigup_forms',
			'description' => 'An SMTP contact form.',
		);
		parent::__construct(
			'bigup_forms',     /* Base ID */
			'Bigup Web: Bigup Forms', /* widget name as it appears in widget picker */
			$this->widget_options
		);
	}


	/**
	 * output the contact form widget settings form.
	 */
	public function form( $instance ) {

		$title   = ! empty( $instance['title'] ) ? $instance['title'] : false;
		$message = ! empty( $instance['message'] ) ? $instance['message'] : false;
		?>

		<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>">Form Title:</label>
			<input class="widefat" type="text" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" value="<?php echo esc_attr( $title ); ?>" />
		</p>

		<p>
			<label for="<?php echo $this->get_field_id( 'message' ); ?>">Message to Appear Above the Form:</label>
			<input class="widefat" type="text" id="<?php echo $this->get_field_id( 'message' ); ?>" name="<?php echo $this->get_field_name( 'message' ); ?>" value="<?php echo esc_attr( $message ); ?>" />
		</p>

		<?php
	}


	/**
	 * Display the contact form widget on the front end.
	 */
	public function widget( $args, $instance ) {

		// enqueue contact form and styles
		wp_enqueue_script( 'bigup_forms_public_js' );
		wp_enqueue_style( 'bigup_forms_public_css' );

		echo $args['before_widget'];
		// get the form markup built with the passed vars.
		$form = Form_Generator::get_form(
			array(
				'title'   => apply_filters( 'widget_title', $instance['title'] ),
				'message' => $instance['message'],
			)
		);
		echo $form;
		echo $args['after_widget'];
	}


	/**
	 * define the data saved by the contact form widget.
	 */
	public function update( $new_instance, $old_instance ) {
		$instance            = $old_instance;
		$instance['title']   = strip_tags( $new_instance['title'] );
		$instance['message'] = strip_tags( $new_instance['message'] );
		return $instance;
	}
}
