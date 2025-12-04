/**
 * Styles applied in editor and frontend.
 *
 * Webpack processes CSS, SASS or SCSS files referenced in JavaScript files.
 * All filenames containing `style` keyword are bundled together. The code used
 * gets applied to both the frontend and the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */

import './css/frontend/_reset.scss'
import './css/frontend/_abstracts.scss'
import './css/frontend/_base.scss'
import './css/frontend/_themes.scss'
import './css/frontend/inputs/_text-field.scss'
import './css/frontend/inputs/_select.scss'
import './css/frontend/inputs/_file-upload.scss'
import './css/frontend/_alert-popup.scss'
