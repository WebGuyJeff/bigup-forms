# Bigup Forms

**This has been forked from the legacy plugin bigup-contact-form.**

This plugin aims to build upon the reliable PHPMailer plugin and expand the static contact form into
customisable forms of any type built directly in the Gutenberg editor.

#### Goals:

- Build any form type.
- Preconfigured field blocks (name, email, etc) ready to drop-in.
- No input field configuration required.
- Customisable text block to create custom input fields.
- All input field blocks provide their own validation/sanitisation.

#### Support for classic plugin forms

This plugin was expanded from a classic forms plugin and as such the repo contains files speicific
to classic plugin functionality. These should be noted when classic support is removed:

 - CSS and JS are still located in the traditinal directories in src/. The files are imported by the block JS and CSS files, but also used to generate assets which are enqueued using the traditional method in the init class. These files are also dependent on eachother through imports, so these must be picked apart and separated into their block files carefully. There may be need to maintain some common files where more than one block rely on a file.
 - Classic classes have been moved into a classic-supports/ dir inside classes.

#### ToDo's

 - field variation - move to 'transform to' on block menu bar thing.
 - input name - enforce unique key within form.
 - add more input types e.g. tickbox, dropdown, calendar, files etc.
 - enable questionaire type forms with inputs that change on input selections. E.g. a user chooses an option then different inputs are displayed for the required data capture.

#### Known bugs

 - Form save as post not complete (don't use!).
 - Fields have 'unexpected content' error after save -> reload.
 - Fields have 'unexpected content' error after switching the input type in settings sidebar.