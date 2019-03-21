/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

/* beautify preserve:start */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";
import { PaperInputBehavior } from "@polymer/paper-input/paper-input-behavior.js";
import { IronFormElementBehavior } from "@polymer/iron-form-element-behavior/iron-form-element-behavior.js";
/* beautify preserve:start */
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin.js";
import { OETemplatizeMixin } from "oe-mixins/oe-templatize-mixin.js";
import "@polymer/paper-listbox/paper-listbox.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-material/paper-material.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/iron-dropdown/iron-dropdown.js";
import "@polymer/iron-input/iron-input.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "oe-ajax/oe-ajax.js";
import "oe-i18n-msg/oe-i18n-msg.js";
import "oe-utils/oe-cache-utils.js";

/**
 * # oe-typeahead 
 * An input control with autocomplete and dynamic search
 * 
 * ```
 *   <oe-typeahead label="Search..." searchurl="data/list/SEARCH_STRING.json" dataurl="data/list/VALUE_STRING.json" value="{{value}}"></oe-typeahead>
 * 
 *   <oe-typeahead label="Search..." strict searchurl="data/list/SEARCH_STRING.json" dataurl="data/list/VALUE_STRING.json" value="{{value}}"></oe-typeahead>
 * 
 *   <oe-typeahead label="Search..." displayproperty="description" valueproperty="code" searchurl="data/country/SEARCH_STRING.json" dataurl="data/country/VALUE_STRING.json" value="{{value}}"></oe-typeahead>
 * ```
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @appliesMixin OETemplatizeMixin
 * @appliesMixin OECommonMixin
 * @demo demo/demo-oe-typeahead.html
 */
class OeTypeahead extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], PolymerElement) {

  static get is() {
    return 'oe-typeahead';
  }

  static get template() {
    return html`
    <style>
    :host {
      display: block;
    }

    input{
      @apply --paper-input-container-shared-input-style;
    }

    input::-webkit-input-placeholder {
      color: var(--paper-input-container-color, --secondary-text-color);
    }

    input:-moz-placeholder {
      color: var(--paper-input-container-color, --secondary-text-color);
    }

    input::-moz-placeholder {
      color: var(--paper-input-container-color, --secondary-text-color);
    }

    input:-ms-input-placeholder {
      color: var(--paper-input-container-color, --secondary-text-color);
    }

    paper-item {
      cursor: pointer;
    }

    .iron-selected {
      background: var(--typeahead-selected-backgroud, #e0e0e0);
    }

    span.required {
      vertical-align: bottom;
      color: var(--paper-input-container-invalid-color, var(--google-red-500));
      @apply --oe-required-mixin;
    }

    .dropdown-content > ::slotted(*) paper-item {
      --paper-item-selected: {
        background-color: #ccc;
      }
    }
    
    .dropdown-content > ::slotted(*){
      max-height: 240px;
    }
    
  </style>
    <oe-ajax id="iajax" auto url=[[_getRequestUrl(searchString)]] last-response={{_suggestions}} on-response="_onAjaxResponse"
      on-error="_onAjaxError" debounce-duration={{debounceDuration}} handle-as="json" content-type="application/json"></oe-ajax>
    <div style="position:relative;">
      <paper-input-container no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
        auto-validate$="[[autoValidate]]" disabled$="[[disabled]]" invalid="[[invalid]]">
        <slot slot="prefix" name="prefix" ></slot>
        <label slot="label" hidden$="[[!label]]">
          <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
          <template is="dom-if" if={{required}}>
            <span class="required"> *</span>
          </template>
        </label>
        <iron-input slot="input" id="[[_inputId]]" bind-value="{{displayValue}}" invalid="{{invalid}}" validator="[[validator]]" on-keyup="_onKeyUp" on-keydown="_onKeyDown"  on-change="_onChange" on-blur="validate" on-input="_onInput">
          <input role="combobox"  aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]" disabled$="[[disabled]]"  prevent-invalid-input="[[preventInvalidInput]]"
          required$="[[required]]" autocomplete$="[[autocomplete]]" inputmode$="[[inputmode]]" 
          name$="[[name]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]" size$="[[size]]" autocapitalize$="[[autocapitalize]]" 
          autocorrect$="[[autocorrect]]" tabindex$="[[tabindex]]"
          autosave$="[[autosave]]" results$="[[results]]" accept$="[[accept]]" multiple$="[[multiple]]" />
        </iron-input>
        <slot slot="suffix"></slot>
        <paper-input-error invalid={{invalid}} slot="add-on">
          <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{placeholders}}></oe-i18n-msg>
        </paper-input-error>

      </paper-input-container>
      <div>
        <iron-dropdown id="dropdown" no-auto-focus opened="[[_suggestions.length]]" >
          <paper-material slot="dropdown-content" class="dropdown-content">
            <paper-listbox id="menu">
              <template id="itemlist" is="dom-repeat" items="{{_suggestions}}" sort="sortData">
                <paper-item class="default" on-tap="onItemSelected" data-item={{item}}>
                  <span>{{_getDisplayValue(item)}}</span>
                </paper-item>
              </template>
            </paper-listbox>
          </paper-material>
        </iron-dropdown>
      </div>
    </div>
    `;
  }

  static get properties() {
    return {
      /* Custom user error mesasge */
      errorMessage: {
        type: String,
        notify: true
      },
      /* Value which will be displayed on input field */
      displayValue: {
        type: String
      },
      /* For object, which property to be shown for display in the input field */
      displayproperty: {
        type: String
      },
      /* For object, which property to be placed as value for typeahead */
      valueproperty: {
        type: String
      },
      /* Value of the object/string */
      value: {
        type: Object,
        notify: true,
        observer: '_fetchModel'
      },
      /* List of values fetched from server for matching values with given rest API */
      _suggestions: {
        type: Array,
        observer: '_suggestionsChanged'
      },
      /* For object, has the whole object of the selection */
      selectedItem: {
        type: Object,
        notify: true
      },
      /* Duration between successive requests */
      debounceDuration: {
        type: Number,
        value: 300
      },
      /* String using which pattern is matched to get suggested values */
      searchString: {
        type: String,
        notify: true
      },
      /* REST API endpoint which will be used to fetch suggested values matching the pattern */
      searchurl: {
        type: String
      },
      /**
       * Used during edit of typeahead, this will be used to fetch/search 
       * for correct object/value with given value 
       */
      dataurl: {
        type: String,
        observer: '_fetchModel'
      },
      disabled: {
        type: Boolean,
        notify: true
      },
      required: {
        type: Boolean,
        notify: true
      },
      /** 
       * Checks for typed value present in the suggestions
       * If true, throws error if value typed not present in suggested list
       * If false, allows values not present in suggestions
       */
      strict: {
        type: Boolean,
        value: false
      },
      noDataFound: {
        type: Boolean,
        notify: true,
        value: false
      }
    };
  }
  static get _invalidValue(){
    return {};
  }
  /**
   * Constructor gets the light-dom element for templating
   */
  constructor() {
    super();
    this._invalidValue = OeTypeahead._invalidValue;
    if (!this.ctor) {
      this.childTemplate = this.queryEffectiveChildren('template[item-template]');
    }
  }


  /**
   * Connected callback to attach event listeners and 
   * handle templating of the listbox
   */
  connectedCallback() {
    super.connectedCallback();

    // if (!this.ctor) {
    //   const childTemplate = this.queryEffectiveChildren('template[item-template]');
    if (this.childTemplate) {
      this.async(function () {
        const itemList = this.shadowRoot.querySelector('#itemlist');
        this.__customTemplatize(itemList, this.childTemplate);
      }.bind(this), 300);
    }
    // }

    this.addEventListener('pt-item-confirmed', this.validate.bind(this));
  }

  /**
   * Applies when blur event is generated on the element to
   * validate the value of element.
   * 
   * @param {event} e
   */
  _onBlur(e) { // eslint-disable-line no-unused-vars
    this.validate();
  }
  // _onFocus(e) { // eslint-disable-line no-unused-vars
  //   this.inputElement.select();
  // }
  _onChange(e) {
    e.stopPropagation();
  }

  /**
   * Returns a reference to the focusable element. Overridden from
   * PaperInputBehavior to correctly focus the native input.
   *
   * @return {!HTMLElement}
   */
  get _focusableElement() {
    return PolymerElement ? this.inputElement._inputElement :
      this.inputElement;
  }

 
  /**
   * Checks response for search/data and sets the noDataFound property
   */
  _onAjaxResponse(e) {
    var self = this;
    var newValue;
    if (!e.detail.response || e.detail.response.length == 0) {
      self.noDataFound = true;

      if (self.strict) {
        self.validate();
        //self.setValidity(false, 'no-matching-records');
      } else {
        newValue = self.displayValue;
        if (self.valueproperty || self.displayproperty) {
          newValue = {};
          if (self.valueproperty) {
            newValue[self.valueproperty] = self.displayValue;
          }
          if (self.displayproperty) {
            newValue[self.displayproperty] = self.displayValue;
          }
        }
        self._setSelectedItem(newValue);
      }
    } else {
      self.noDataFound = false;
      var data = e.detail.response;
      newValue = data.length === 1 ? data[0] : data.find(function (ele) {
        if (typeof ele === 'string' && ele === self.searchString) {
          return true;
        } else if (typeof ele === 'object' && self.displayproperty &&
          ele[self.displayproperty] && ele[self.displayproperty] === self.searchString) {
          return true;
        } else {
          return false;
        }
      });
      if (newValue) {
        self._setSelectedItem(newValue);
        self.validate();
      }
    }
  }
  _onAjaxError(e) { // eslint-disable-line no-unused-vars
    var self = this;
    self.noDataFound = true;
    if (self.strict) {
      //self.setValidity(false, 'no-matching-records');
      //self._setSelectedItem(undefined);
      self.validate();
    } else {
      var newValue = self.displayValue;
      if (self.valueproperty || self.displayproperty) {
        newValue = {};
        if (self.valueproperty) {
          newValue[self.valueproperty] = self.displayValue;
        }
        if (self.displayproperty) {
          newValue[self.displayproperty] = self.displayValue;
        }
      }
      self._setSelectedItem(newValue);
      self.validate();
    }
  }
  _onKeyUp(e) {

    var keycode = e.keyCode || e.which || e.key;
    if (!this.$.dropdown.opened) {
      return;
    }
    if (keycode == 40) {
      // down key
      var suggestionsMenu = this.$.menu;
      if (suggestionsMenu) {
        var selectedItem = suggestionsMenu.focusedItem;
        var index = 0;
        if (typeof (selectedItem) != 'undefined') {
          index = Number(suggestionsMenu.indexOf(selectedItem));
          index = Math.min(index + 1, this._suggestions.length - 1);
        }
        suggestionsMenu.select(index);
      }
      this.inputElement.focus();
    } else if (keycode == 38) {
      // up key
      var suggestionsMenu = this.$.menu; // eslint-disable-line no-redeclare
      if (suggestionsMenu) {
        var selectedItem = suggestionsMenu.focusedItem; // eslint-disable-line no-redeclare
        if (typeof (selectedItem) != 'undefined') {
          index = Number(suggestionsMenu.indexOf(selectedItem));
          index = Math.max(index - 1, -1);
          suggestionsMenu.select(index);
        }
      }
      this.inputElement.focus();
    } else if (keycode == 13) {
      // enter key
      var suggestionsMenu = this.$.menu; // eslint-disable-line no-redeclare
      if (suggestionsMenu && typeof (suggestionsMenu) != 'undefined') {
        var selectedItem = suggestionsMenu.focusedItem; // eslint-disable-line no-redeclare
        if (typeof (selectedItem) != 'undefined') {
          this._setSelectedItem(selectedItem.dataItem);
          this.fire('pt-item-confirmed', selectedItem.dataItem);
          this.async(function () {
            this.fire('change');
          });
        }
      }
    }
  }
  _onKeyDown(e) {
    var keycode = e.keyCode || e.which || e.key;
    if (keycode == 40 || keycode == 38) {
      // up/down key
      e.preventDefault();
      e.stopPropagation();
    } else if (e.keyCode == 13 && this._suggestions && this._suggestions.length) {
      /* Enter */
      e.stopPropagation();
    } else if (e.keyCode == 9 && this._suggestions && this._suggestions.length) {
      /* Tab */
      this.set('_suggestions', []);
    } else if (e.keyCode == 8) {
      /*backspace pressed*/
      this.set('_backSpacePressed', true);
    }
  }
  /**
   * When using custom templates, bind it to mouseover event 
   * of template component as on-mouseover="onMouseOver" 
   */
  onMouseOver(e) {
    this.$.menu.select(e.model.index);
    this.inputElement.focus();
  }
  /** 
   * When using custom templates, bind it to tap event 
   * of template component as on-tap="onItemSelected"
   */
  onItemSelected(e) {
    this._setSelectedItem(e.model.item);
    this.fire('pt-item-confirmed', e.model.item);
    this.async(function () {
      this.fire('change');
    });
    e.stopPropagation();
  }
  /** 
   * Used to set the selectedItem and value properties
   *
   * @param {Object} item
   */
  _setSelectedItem(item) {
    this.selectedItem = item;
    this.displayValue = this._getDisplayValue(item);

    if (this.valueproperty) {
      this.value = item ? item[this.valueproperty] : undefined;
    } else {
      this.value = item;
    }
    this.fire('item-selected', item);

    if (!this.multiple) {
      //this.$.dropdown.set('opened', false);
      this.set('_suggestions', []);
    }

    if (this.noDataFound) {
      this.set('_suggestions', []);
    }
    this.validate();
  }

  /* Revisit getDisplayValue with iron-list template */
  _getDisplayValue(item) {
    var ret = item;
    if (ret && this.displayproperty) {
      ret = ret[this.displayproperty];
    }
    return ret ? ret.toString() : '';
  }
  /** 
   * Used to get the search url after replacing the search pattern
   *
   * @param {string} searchString
   * @return {string}
   */
  _getRequestUrl(searchString) {
    var re = new RegExp('SEARCH_STRING', 'g');
    var ret = undefined;
    if (this.searchurl) {
      ret = this.searchurl.replace(re, encodeURI(searchString));
    }
    return ret;
  }
  _onInput(e) { // eslint-disable-line no-unused-vars

    var term = this.displayValue;
    if (term == '') {
      this.set('_suggestions', []);
      this._setSelectedItem(undefined);
      return;
    }
    if (!this._suggestions) {
      this.set('_suggestions', []);
    }
    if (this._backSpacePressed) {
      this.set('_backSpacePressed', false);
      return;
    }
    if (this.searchurl) {
      if (term == this.searchString) {
        this.$.iajax.generateRequest();
      } else {
        this.set('searchString', term);
      }
    } else {
      this.set('value', term);
    }
  }
  _fetchModel(nVal, oVal) { // eslint-disable-line no-unused-vars
    //Common Observer for dataurl as well as value property.
    //Do not rely on nVal or oVal to be value or dataurl.
    if(this.value === this._invalidValue){
      return;
    }

    if (!this.value || this.value.length === 0) {
      this._setSelectedItem(undefined);
      return;
    }

    if (this.selectedItem && (this.selectedItem === this.value || this.value == this.selectedItem[
      this.valueproperty])) {
      // new value is same as what is already set
      return;
    }
    var self = this;
    // when used in demo page, the value changed function is called before the 'dataurl'
    // property is available, hence a small debouce.
    //self.debounce('valuechanged', function() {
    if (typeof this.value === 'object') {
      this._setSelectedItem(this.value);
    } else if (this.dataurl && this.value && (typeof this.value !== 'string' || !this.value.startsWith('{{'))) {
      var metaAjax = document.createElement('oe-ajax');
      metaAjax.contentType = 'application/json';
      metaAjax.handleAs = 'json';

      var re = new RegExp('VALUE_STRING', 'g');
      metaAjax.url = this.dataurl.replace(re, encodeURI(this.value));
      metaAjax.addEventListener('response', function (event) {
        var resp = event.detail.response;
        if (!resp || resp.length == 0) {
          //Set value as displayValue, (value as cleared, if strict is true otherwise value is not cleared) if response is empty
          let tempValue = self.value;
          if (self.strict) {
            self.validate();
            // self.setValidity(false, 'no-matching-records');
            // self._setSelectedItem(undefined);
          }
          self.set('displayValue', tempValue);
        }
        else {
          if (Array.isArray(resp)) {
            //set the first match from response as value
            //if the response is empty sets undefined as the value
            self._setSelectedItem(resp[0]);
          } else {
            self._setSelectedItem(resp);
          }
        }
        self.validate();
      });
      metaAjax.addEventListener('error', function (event) { // eslint-disable-line no-unused-vars
        self._setSelectedItem(undefined);
      });
      metaAjax.generateRequest();
    } else {
      console.log('typeahead fetch skipped. url/value is still empty'); // eslint-disable-line no-console
    }
    //}, 100);
  }
  _validate() {
    var isValid = true;
    if (this.strict && this.displayValue && !this.selectedItem) {
      this.setValidity(false, 'no-matching-records');
      isValid = false;
    } else if (this.strict && this.displayValue != this._getDisplayValue(this.selectedItem)) {
      this.setValidity(false, 'invalidValue');
      isValid = false;
    } else if (this.required && !this.value) {
      this.setValidity(false, 'valueMissing');
      isValid = false;
    }

    if(!isValid){
      this.value = this._invalidValue;
    }

    return isValid;
  }
  _suggestionsChanged(suggestions) {
    this.$.dropdown.style.width = this.offsetWidth + 'px';
  }

  /**
   * Sorts data based on displayproperty
   * Kept method as public so that user can overwrite it if needed
   */
  sortData(a, b) {
    return this._getDisplayValue(a) > this._getDisplayValue(b) ? 1 : -1;
  }

}

window.customElements.define(OeTypeahead.is, OECommonMixin(OETemplatizeMixin(OEFieldMixin(OeTypeahead))));
