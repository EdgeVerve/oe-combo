/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { IronControlState } from "@polymer/iron-behaviors/iron-control-state.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";
import { PaperInputBehavior } from "@polymer/paper-input/paper-input-behavior.js";
import { IronFormElementBehavior } from "@polymer/iron-form-element-behavior/iron-form-element-behavior.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin.js";
import { OETemplatizeMixin } from "oe-mixins/oe-templatize-mixin.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "@polymer/paper-listbox/paper-listbox.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-material/paper-material.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/iron-dropdown/iron-dropdown.js";
import "@polymer/iron-input/iron-input.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "oe-ajax/oe-ajax.js";
import "oe-i18n-msg/oe-i18n-msg.js";
import "oe-utils/oe-cache-utils.js";

var OEUtils = window.OEUtils || {};

/**
 * # oe-combo
 * 
 * An input control with dropdown for possible valid values.
 * The data can be supplied statically under `listdata` property and can be dynamically fetched by
 * specifying `listurl` property.
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @appliesMixin OETemplatizeMixin
 * @appliesMixin OECommonMixin
 * @demo demo/demo-oe-combo.html
 */
class OeCombo extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], PolymerElement) {

  static get is() {
    return 'oe-combo';
  }

  static get template() {
    return html`
        <style>
          :host {
            display: block;
          }

          :host(:focus){
            outline:none;
          }
          
          span.required {
            vertical-align: bottom;
            color: var(--paper-input-container-invalid-color, var(--google-red-500));
            @apply --oe-required-mixin;
          }
  
          paper-input-container {
            display: inline-block;
            width: 100%;
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

          input::-ms-clear {
            @apply --paper-input-container-ms-clear;
          }

          .iron-selected {
            background: var(--combo-selected-backgroud, #e0e0e0);
          }

          #dropdownicon {
            cursor: pointer;
          }

          paper-icon-button{
            width:24px;
            height:24px;
            padding:0px;
          }

          .droplist paper-item {
            --paper-item-selected: {
              background-color: #ccc;
            }
            --paper-item-focused: {
              background-color: transparent;
            }
            --paper-item-focused-before: {
              background-color: transparent;
            }
          }
          
          .droplist paper-item:hover {
            background-color: #DDD;
            @apply --oe-combo-item-hover;
          }
          iron-input {
            @apply --iron-input;
          }
      
          label{
            @apply --oe-label-mixin;
          }
          paper-input-error{
            @apply --oe-input-error;
          }
        </style>
        <div id="cover" style="position:relative;">
          <paper-input-container no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
            auto-validate$="[[autoValidate]]" disabled$="[[disabled]]" invalid="[[invalid]]">
            <slot slot="prefix" name="prefix" ></slot>
            <label slot="label" hidden$="[[!label]]">
                <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
                <template is="dom-if" if={{required}}>
            		<span class="required" aria-label=" "> *</span>
                </template>
            </label>
            <div slot="input" id="templateDiv"></div>
            <iron-input slot="input" id="[[_inputId]]" bind-value="{{displayValue}}" invalid="{{invalid}}" validator="[[validator]]" on-keyup="_keyup" on-keydown="_keydown"  on-change="_onChange">
              <input role="combobox"  aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]" disabled$="[[disabled]]"  prevent-invalid-input="[[preventInvalidInput]]"
               required$="[[required]]" autocomplete$="[[autocomplete]]" inputmode$="[[inputmode]]" 
               name$="[[name]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]" size$="[[size]]" autocapitalize$="[[autocapitalize]]" 
               autocorrect$="[[autocorrect]]" tabindex$="[[tabindex]]"
               autosave$="[[autosave]]" results$="[[results]]" accept$="[[accept]]" multiple$="[[multiple]]" />
            </iron-input>
            <div slot="suffix">
              <paper-icon-button id="dropdownicon" on-tap="_dropdownClick" icon="arrow-drop-down"></paper-icon-button>
              <template is="dom-if" if={{showRefresh}}>
                <paper-icon-button icon="refresh" on-tap="_fetchListData"></paper-icon-button>
              </template>
            </div>
            <paper-input-error invalid={{invalid}} slot="add-on">
              <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{placeholders}}></oe-i18n-msg>
            </paper-input-error>
          </paper-input-container>
          <div>
            <dom-if if=[[_dropdownAttached]] id="dropdownContainer">
              <template>
                <iron-dropdown id="dropdown" 
                  scroll-action="[[scrollAction]]" no-animations 
                  vertical-align="[[_verticalAlign]]" vertical-offset="[[_verticalOffset]]" 
                  no-auto-focus opened=[[expand]]>
                  <paper-material slot="dropdown-content" class="droplist" tabindex="-1" disabled$="[[disabled]]">
                    <paper-listbox id="menu" role="listbox" aria-labelledby$="[[_ariaLabelledBy]]" multi$="[[multi]]">
                      <template is="dom-repeat" id="itemlist" items="{{_suggestions}}">
                        <paper-item role="option"  on-tap="onItemSelected" data-item=[[item]] disabled$="[[disabledoption]]">
                          ${this.itemTemplate}
                        </paper-item>
                      </template>
                    </paper-listbox>
                  </paper-material>
                </iron-dropdown>
              </template>
            </dom-if>
          </div>
        </div>
    `;
  }

  static get itemTemplate() {
    if(window.OEUtils && window.OEUtils.componentDefaults && window.OEUtils.componentDefaults["oe-combo"]){
      return window.OEUtils.componentDefaults["oe-combo"].itemTemplate;
    }
    return html`<span>[[_getDisplayValue(item)]]</span>`;
  }
  static get properties() {
    return {
      /**
       * Property within the listdata to be used for display
       */
      displayproperty: String,

      /**
       * Property of the selected record, that is set as current value.
       * When records are plain strings, leave this property undefined
       */
      valueproperty: String,

      _readonly: {
        type: Boolean,
        value: false
      },

      /**
       * Flag to set for enabling combo to choose multiple values
       */
      multi: {
        type: Boolean,
        value: false
      },
      /**
       * When multi is true, this flag exposes value as comma separated text instead of an array
       */
      valueAsText: {
        type: Boolean,
        value: false
      },
      /**
       * When set to true, the selected value is shown as the template given for the combo
       * 
       */
      showTemplate: {
        type: Boolean,
        value: false,
        observer: '_showTemplateChanged'
      },

      /**
       * Current selected value
       */
      value: {
        type: Object,
        notify: true
      },
      invalid: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true
      },

      /**
       * Selected record in the list. `value` equals `selectedItem`[`valueproperty`].
       * When records are plain strings, it is same as `value`
       * 
       */
      selectedItem: {
        type: Object,
        notify: true
      },

      /**
       * Selected records from the list. `value` equals `selectedItem`[`valueproperty`].
       * When records are plain strings, it is same as `value`
       */
      selectedItems: {
        type: Array,
        notify: true
      },

      /**
       * Flag to control whether refresh button is displayed or not.
       */
      showRefresh: {
        type: Boolean,
        value: false
      },

      /**
       * Flag to control whether only the filtered values should be displayed.
       */
      showFilteredOnly: {
        type: Boolean,
        value: false
      },
      /** Disable caching of listdata */
      disableCache: {
        type: Boolean,
        value: false
      },
      _suggestions: {
        type: Array,
        notify: true
      },

      /**
       * Key specifies the unique key to fetch data from cache(oeCache).
       * Incase, there is no data for the key specified in the cache and listurl is specified,
       * the data is fetched from the listurl and set in the cache for this key.
       */
      listkey: {
        type: String,
        notify: true,
        observer: '_fetchListData'
      },

      /**
       * Array of records to be displayed in dropdown. Can be array of primitives as well as objects.
       * When items are objects, you should specify `displayproperty` and `valueproperty`.
       */
      listdata: {
        type: Array,
        notify: true,
        value:function(){
          return [];
        },
        observer: '_listDataChanged'
      },

      /** 
       * URL from where data to be displayed in dropdown, should be fetched
       */
      listurl: {
        type: String,
        notify: true,
        observer: '_fetchListData'
      },

      /**
       * Flag to set to enable entering values not present in the listdata
       */
      allowFreeText: {
        type: Boolean,
        value: false
      },

      expand: {
        type: Boolean,
        value: false,
        observer: '_expandChange'
      },

      sort: {
        type: Boolean,
        value: false
      },

      verticalOffset: {
        type: String
      },

      /**
       * scrollAction binded to iron-dropdown
       * * "lock" - Prevents scrolling of body
       * * "refit" - Moves the dropdown based on scroll
       * * "cancel" - Closes the dropdown on scroll
       */
      scrollAction: {
        type: String
      },

      verticalAlign: {
        type: String
      },

      _dropdownAttached: {
        type: Boolean,
        value: false
      },
      /**
       * Fired when the element item is selected
       * 
       * @event pt-item-confirmed
       * @param {Object} detail contains the item selected
       */

      /**
       * Fired when the new listdata is fetched to update the cache store.
       * 
       * @event oe-update-cache
       * @param {Object} detail contains the key as hashed listurl and detail the listadata
       */
      
      /**
       * Fired when the value of the field is changed by the user
       *
       * @event oe-field-changed
       */

    };
  }

  static get observers() {
    return ['_setDisplayAndValidate(value,listdata)'];
  }


  /**
   * Override paper-input-behavior focus-blur handler
   * @param {FocusEvent} event 
   */
  _focusBlurHandler(event) {
    IronControlState._focusBlurHandler.call(this, event); // Forward the focus to the nested input.
    if (this.focused && !this._shiftTabPressed && this._focusableElement && !this.expand) {
      this._focusableElement.focus();
    }
  }

  _onChange(eve) {
    eve.stopPropagation();
    if (this.multi) {
      this.validate();
      return;
    }
    if (this.displayValue && this.displayValue != this._getDisplayValue(this.selectedItem)) {
      var matchedRecord = this._matchedResults.find(function (rec) {
        return this.displayValue === this._getDisplayValue(rec);
      }.bind(this));
      if (matchedRecord) {
        this._setSelectedItem(matchedRecord);
      } else if (this.allowFreeText) {
        var newValue = this.displayValue;
        if (this.valueproperty || this.displayproperty) {
          newValue = {};
          if (this.valueproperty) {
            newValue[this.valueproperty] = this.displayValue;
          }
          if (this.displayproperty) {
            newValue[this.displayproperty] = this.displayValue;
          }
        }
        this._setSelectedItem(newValue);
      } else {
        //this.setValidity(false, 'invalidValue');
        this.validate();
      }
    }
    else {
      this.validate();
    }
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
   * Event listener to set the value based on the user selection,
   * when `multi` is set as true.
   * @param {Event} e selected-items-changed event by paper-listbox
   */
  _selectedItemsChanged(e) {
    if (this.multi) {
      //Check if this is triggered on setting value.
      if (this.$.menu.selectedValues.sort().join() === this.__prevSelectedValues) {
        return;
      }

      var items = e.detail.value;

      if (items && items.length > 0) {
        this.selectedItems = [];
        var values = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i].dataItem;
          this.push('selectedItems', item);
          values.push(this._getItemValue(item));
        }
        if (this.valueAsText) {
          this.value = values.join(',');
        } else {
          this.value = values;
        }
      } else {
        this.displayValue = "";
        if (this.valueAsText) {
          this.value = undefined;
        } else {
          this.value = [];
        }
      }
      this.fire('pt-item-confirmed', item);
      this.setValidity(true, undefined);
    }
  }

  /**
   * Check of cache store in OEUtils namespace and add event listeners. 
   * If cache is present set the cached data in `listdata` else call `_fetchData`
   */
  _fetchListData() {
    var self = this;
    /* If List-Key is present, check if cache exists and set it on listdata */
    if (!self.disableCache && OEUtils.oeCache && (this.listkey || this.listurl)) {
      var listkey = this.listkey || this.hashFunc(this.listurl);
      window.addEventListener('oe-cache-' + listkey + '-updated', function (e) {
        self.set('listdata', e.detail);
      });

      var cacheValue = OEUtils.oeCache[listkey];
      if (cacheValue) {
        this.set('listdata', cacheValue);
      } else {
        if (this.listurl) {
          OEUtils.oeCache[listkey] = [];
          self._fetchData();
        }
      }
    } else {
      //no cache available hence fetch data
      this._fetchData();
    }
  }

  /**
   * Fetches the listdata based on the `listurl` and fires 
   * event 'oe-update-cache' to update the cache store
   * @event oe-update-cache
   */
  _fetchData() {
    if (this.listurl) {

      var self = this;
      var ajaxCall = document.createElement('oe-ajax');
      ajaxCall.contentType = 'application/json';
      ajaxCall.handleAs = 'json';
      ajaxCall.url = this.listurl;
      ajaxCall.method = 'get';
      ajaxCall.addEventListener('response', function (event) {
        self.set('listdata', event.detail.response);
        var listkey = self.listkey || self.hashFunc(self.listurl);
        if (self.disableCache) {
          return;
        }
        self.fire('oe-update-cache', {
          key: listkey,
          data: event.detail.response
        });
      });
      ajaxCall.addEventListener('error', function (event) { // eslint-disable-line no-unused-vars
        self.fire("error", event);
        console.error('error fetching the list');
      });
      ajaxCall.generateRequest();
    }
  }

  _listDataChanged(newV, oldV) { // eslint-disable-line no-unused-vars
    if (this.listdata) {
      var self = this;
      if (this.sort) {
        this.listdata.sort(this.sortData.bind(this));
      }
      this.listMeta = this.listdata.map(function (d) {
        var metaObj = {
          value: self._getItemValue(d),
          display: self._getDisplayValue(d)
        };
        metaObj.searchKey = metaObj.display.toLocaleLowerCase();
        return metaObj;
      });
    }
  }

  /**
   * Custom validation of oe-combo to check based on allowFreeText and other flags
   */
  _validate() {

    var isValid = true;
    if (!this.allowFreeText && this.displayValue && (!this.selectedItem && !this.selectedItems)) {
      this.setValidity(false, 'invalidValue');
      isValid = false;
    } else if (!this.allowFreeText && (!this.multi && this.displayValue != this._getDisplayValue(this.selectedItem))) {
      this.setValidity(false, 'invalidValue');
      isValid = false;
    } else if (this.required && (!this.value || (this.value === this._invalidValue)) && !this.disabled) {
      this.setValidity(false, 'valueMissing');
      isValid = false;
    }
    if (!isValid) {
      this.value = this._invalidValue;
    }
    return isValid;
  }

  _validateArrayItems(value, listItems, menuList) {
    var selectedItemsIndex = [];
    var selectedItems = [];
    var displayValues = [];
    for (var idx = 0, len = listItems.length; idx < len; idx++) {
      var item = listItems[idx];
      if (value.indexOf(this._getItemValue(item)) !== -1) {
        selectedItems.push(item);
        selectedItemsIndex.push(idx);
        displayValues.push(this._getDisplayValue(item));
      }
    }
    this.displayValue = displayValues.join(', ');
    this.set('selectedItems', selectedItems);
    this.set('__prevSelectedValues', selectedItemsIndex.sort().join());
    if (selectedItems.length === value.length) {
      menuList && menuList.set('selectedValues', selectedItemsIndex);
      this.setValidity(true, undefined);
    } else {
      this.setValidity(false, 'invalidValue');
    }

  }
  /**
   * Observer function listening to changes in `value` and `listdata`
   * Computes the display of the oe-combo and selects the correct values from paper-listbox,
   * based on `value` set on the element.
   * 
   * @param {string|Array} newV value set on element
   * @param {Array} newL listdata of the element
   */
  _setDisplayAndValidate(newV, newL) { // eslint-disable-line no-unused-vars

    if (this.value === this._invalidValue) {
      return;
    }
    if (!this.isConnected) {
      return;
    }

    var menuList = this.$.menu;
    var listItems = (this._suggestions && this._suggestions.length > 0) ? this._suggestions : this.listdata;

    if (this.value === null || this.value === undefined || this.value === '' || !this.listdata) {
      //if value or listdata is not present 
      this.displayValue = '';
      this.set('selectedItem', undefined);
      this.setValidity(true, undefined);
      if (this.showTemplate) {
        this.__setTemplateItem(null);
      }
      if (menuList) {
        menuList._selectMulti();
        menuList.selectedValues = [];
      }
      return;
    }


    if (this.multi) {
      //Multiple selection sets displayValue,selectedItems,validity
      if (typeof this.value === "string") {
        if (this.valueAsText) {
          var arrValue = this.value.split(',');
          this._validateArrayItems(arrValue, listItems, menuList);
        } else {
          try {
            //parse the value to get the array
            var valueArr = JSON.parse(this.value);
            if (Array.isArray(valueArr)) {
              this.set('value', valueArr);
              return;
            }
          } catch (e) {
            this.displayValue = '';
            this.setValidity(false, 'invalidValue');
            return;
          }
        }
      } else if (Array.isArray(this.value)) {
        this._validateArrayItems(this.value, listItems, menuList);
      } else {
        for (let idx = 0, len = listItems.length; idx < len; idx++) {
          let item = listItems[idx];
          if (this.value === this._getItemValue(item)) {
            //Match found
            this.displayValue = this._getDisplayValue(item);
            this.set('selectedItems', [item]);
            this.setValidity(true, undefined);

            //Select the item in paper-list
            menuList && menuList.select(idx);
            return;
          }
        }
      }
    } else {
      //Single selection sets displayValue,selectedItem,validity
      for (let idx = 0, len = listItems.length; idx < len; idx++) {
        let item = listItems[idx];
        if (this.value === this._getItemValue(item)) {
          //Match found
          this.displayValue = this._getDisplayValue(item);
          this.selectedItem = item;
          this.setValidity(true, undefined);
          if (this.showTemplate) {
            this.__setTemplateItem(item);
          }
          //Select the item in paper-list
          menuList && menuList.select(idx);
          return;
        }
      }

      //Match not found
      if (typeof this.value === 'object') {
        this.displayValue = this._getDisplayValue(this.value);
        this.selectedItem = this.value;
        this.setValidity(true, undefined);
      } else if (this.allowFreeText) {
        this.displayValue = this.value;
        this.selectedItem = this.value;
        this.setValidity(true, undefined);
      } else {
        this.setValidity(false, 'invalidValue');
      }
    }

  }

  static get _invalidValue() {
    return {};
  }

  /**
   * Constructor gets the light-dom element for templating
   */
  constructor() {
    super();
    this._invalidValue = OeCombo._invalidValue;
    if (!this.ctor && !this.multi) {
      this.childTemplate = this.queryEffectiveChildren('template[item-template]');
    }
  }

  /**
   * Connected callback to attach event listeners and 
   * handle templating of the listbox
   */
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "combobox");
    if (!this.multi) {
      this.boundClickHandler = this._closeIfApplicable.bind(this);
    } else {
      this._readonly = true;
    }
    this._suggestions = [];
    this._setDisplayAndValidate();
    if (this.childTemplate) {
      /**
       * When a custom template is provided for list items , 
       * The dropdown is attached when the component is attached so as to change the template of the dom-repeat
       */
      this._initDropdown(function () {
        const itemList = this.shadowRoot.querySelector('#itemlist');
        this.__customTemplatize(itemList, this.childTemplate);
      }.bind(this));
    }

  }

  /**
   * Key down event listener for oe-combo
   */
  _keydown(e) {// eslint-disable-line no-unused-vars
    if (!this.readonly) {
      if (e.keyCode == 40 || e.keyCode == 38) {
        e.preventDefault();
      } else if (e.keyCode == 13 && this.expand) {
        e.stopPropagation();
      } else if (e.keyCode == 9 && this.expand) {
        this.set('expand', false);
      }
    }
  }

  /**
   * Observer to `showTemplate`.
   * CSS management to display the template instead of the input box.
   * @param {boolean} e flag to show template
   */
  _showTemplateChanged(e) {// eslint-disable-line no-unused-vars
    if (this.showTemplate) {
      this.shadowRoot.querySelector('#templateDiv').style.display = "flex";
      this.inputElement.readonly = true;
      // this._inputElement && (this._focusableElement.type = "hidden");
    } else {
      this.shadowRoot.querySelector('#templateDiv').style.display = "none";
      this.inputElement.style.display = "inline-block";
      // this._focusableElement && (this._focusableElement.type = "text");
    }
  }

  /**
   * Key up event listener to handle 'Up/Down/Enter' keys and other keys as search term.
   * @param {Event} e 
   */
  _keyup(e) {
    if (!this.readonly) {
      if (e.keyCode == 40) {
        //down button
        this._handleDownEvent(e);
      } else if (e.keyCode == 38) {
        //up
        //this._handleUpEvent(e);
      } else if (e.keyCode == 13) {
        //Enter
        this._handleEnterEvent(e);
      } else if (e.keyCode == 37 || e.keyCode == 39) {
        //ignore for left/right arrow keys
      } else if (e.keyCode == 27) {
        //escape key
        this.set('expand', false);
      } else if (e.keyCode != 9) {
        //ignore tab in
        //Pass only the unselected text for search
        var searchTerm = this.displayValue;
        if (this._focusableElement.selectionStart > 0) {
          searchTerm = searchTerm.substring(0, this._focusableElement.selectionStart);
        }

        this._search(e, searchTerm.trim());
      }
    }
  }

  /**
   * Down key listener to open and display the menu box.
   * Once opened traverse the list data
   * @param {Event} e Key up event
   */
  _handleDownEvent(e) { // eslint-disable-line no-unused-vars
    if (!this.sort || this._suggestions.length == 0) {
      this._suggestions = this.listdata;
      this._menuOpen(false);
    }
    this.async(function () {
      var suggestionsMenu = this.$.menu;
      var itemsList = suggestionsMenu.querySelector('#itemlist');
      itemsList.render();
      suggestionsMenu._updateItems();
      if (suggestionsMenu && typeof (suggestionsMenu) != 'undefined') {
        suggestionsMenu.focus();
        if (typeof suggestionsMenu.focusedItem === 'undefined') {
          suggestionsMenu._setFocusedItem(suggestionsMenu.items[0]);
        }
      }
    }, 300);
  }

  /**
   * Select the focused Item from the listbox using the 'Enter' key
   * @param {Event} e Key up event
   */
  _handleEnterEvent(e) { // eslint-disable-line no-unused-vars
    if (this.expand) {
      var suggestionsMenu = this.$.menu;
      if (suggestionsMenu && typeof (suggestionsMenu) != 'undefined' && !this.multi) {
        var selectedItem = suggestionsMenu.focusedItem;
        if (typeof (selectedItem) != 'undefined') {
          this._setSelectedItem(selectedItem.dataItem);
        }
        this._focusableElement.focus();
      }
    }
  }

  /**
   * Close menu and empty the list
   */
  _menuClose() {
    this._suggestions = [];
    this.set('expand', false);
  }

  /**
   * Based on the position of the element in screen,
   * Computes alighnment , offset and opens the menu.
   * @param {boolean} sort Sort option for listdata
   */
  _menuOpen(sort) {
    var elementPos = (window.innerHeight / this.getBoundingClientRect().top);
    var showDropDownAbove = elementPos > 0 && elementPos < 1.7;
    if (this.verticalAlign !== undefined) {
      this.set('_verticalAlign', this.verticalAlign);
    } else {
      this.set('_verticalAlign', showDropDownAbove ? 'bottom' : 'top');
    }
    if (this.verticalOffset !== undefined) {
      this.set('_verticalOffset', this.verticalOffset);
    } else {
      this.set('_verticalOffset', showDropDownAbove ? 55 : -8);
    }
    this._initDropdown(function () {
      this.set('expand', true);
    }.bind(this));
    if (sort) this.set('sort', true);
    else this.set('sort', false);
  }

  _initDropdown(cb) {
    function onRender() {
      this.$.dropdownContainer.removeEventListener('dom-change', onRender);
      this.$.dropdown = this.shadowRoot.querySelector('#dropdown');
      this.fire('combo-dropdown-attached', this.$.dropdown);
      this.$.menu = this.$.dropdown.querySelector('#menu');
      this.$.menu.addEventListener('selected-items-changed', this._selectedItemsChanged.bind(this));
      cb();
      if (this.value) {
        this._setDisplayAndValidate();
      }
    }
    if (this._dropdownAttached) {
      cb();
    } else {
      this.$.dropdownContainer.addEventListener('dom-change', onRender.bind(this));
      this.set('_dropdownAttached', true);
    }
  }


  /**
   * Shows all the listdata items when drop down arrow clicks
   * It will check for open if not it will add class open and it will add to suggestions
   */
  _dropdownClick(e) { // eslint-disable-line no-unused-vars
    e.stopPropagation();
    if (this.expand) {
      this._menuClose();
    } else {
      if (this.listdata) {
        this.set('_suggestions', this.listdata);
        this._menuOpen(false);
        var suggestionsMenu = this.$.menu;
        this.async(function () {
          if (suggestionsMenu && typeof (suggestionsMenu) != 'undefined') {
            suggestionsMenu.focus();
            if (typeof suggestionsMenu.focusedItem === 'undefined') {
              suggestionsMenu._setFocusedItem(suggestionsMenu.items[0]);
            }
          }
        }, 500);
      }
    }
  }

  /**
   * It will execute when the expand property changes
   * And adds event listener for click on html when it open (expand = true)
   */
  _expandChange() {
    var hold = document.querySelector('html');
    var self = this;
    if (this.expand) {
      this.$.dropdown.style.width = this.offsetWidth + 'px';
      hold.addEventListener('click', self.boundClickHandler);
    } else {
      hold.removeEventListener('click', self.boundClickHandler);
    }
  }

  _closeIfApplicable(event) {
    var self = this;
    var eventPath = event.path || (event.composedPath && event.composedPath());
    if (event.target !== self && eventPath.indexOf(self.$.dropdownicon) === -1) {
      // console.log('closed due to click event', eventPath);
      this._menuClose();
    }
  }


  /**
   * on-tap of a list item it is selected
   */
  onItemSelected(e) {

    if (this.multi) {
      return;
    }
    e.stopPropagation();
    var item = e.model.item;

    this._setSelectedItem(item);
    this._focusableElement.focus();

  }

  __setTemplateItem(item) {
    var self = this;
    var templateDiv = this.shadowRoot.querySelector('#templateDiv');
    templateDiv.innerHTML = "";

    if (!item) {
      this.inputElement.style.zIndex = "";
      this.inputElement.style.position = "";
      this.inputElement.style.display = "";
      return;
    }

    var repeater = this.shadowRoot.querySelector('#itemlist');
    var menu = this.shadowRoot.querySelector('#menu');

    if (!menu || !repeater || !templateDiv) {
      return;
    }

    function handleTemplateClone() {
      var selected = Array.from(menu.children).find(function (el) {
        return repeater.itemForElement(el) === item;
      });

      if (selected) {
        templateDiv.appendChild(selected.children[0]);
        self.inputElement.style.zIndex = -1;
        self.inputElement.style.position = "absolute";
        self.inputElement.style.display = "none";
      }
      self._menuClose();
    }

    if (repeater.items.length !== this.listdata.length) {
      this.set('_suggestions', this.listdata.slice());
      repeater.render();
      this.async(function () {
        handleTemplateClone();
      }, 0);
    } else {
      handleTemplateClone();
    }
  }


  /**
  * Returns the display property of the item or the item
  * @param {Object} item object from the list
  * @return {string} Display string for the item
  */
  _getDisplayValue(item) {
    var ret = item;
    if (ret && this.displayproperty) {
      ret = ret[this.displayproperty];
    }
    return (ret !== null && ret !== undefined) ? ret.toString() : '';
  }

  /**
   * Returns the value property of the item or the item
   * @param {Object} item object from the list
   * @return {Any} value of the item.
   */
  _getItemValue(item) {
    var ret = item;
    if (ret && this.valueproperty) {
      ret = ret[this.valueproperty];
    }
    return ret;
  }

  /** 
   * It will fire when we type any key except ['enter', 'up', 'down']
   */
  _search(e, term) {
    var self = this;
    if (term == '') {
      self._menuClose();
      self.value = undefined;
      self.selectedItem = undefined;
      if (!self.required) {
        self.setValidity(true, undefined);
      }
      return;
    }
    var results = self._findMatchedObjects(term);
    /* 
    if (results.length == 1 && e.keyCode != 8) {
      //there is exactly only one match. set it directly.
      //no need to open the menu.
      self._setSelectedItem(results[0]);

      //get length of current displayvalue and make remaining as selected
      this.inputElement.inputElement.setSelectionRange(term.length, self.displayValue.length);
    } else { */
    this._matchedResults = results;
    self._menuOpen(true);
    var suggestionsMenu = self.$.menu;
    if (self.allowFreeText && results.length === 0) {
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
    } else if (suggestionsMenu && typeof (suggestionsMenu) != 'undefined') {
      suggestionsMenu.select(0);
      self._focusableElement.focus();
    }

  }

  /**
   * Finds the matched objects
   * TODO: Check regular expression for all the possible cases and for valid expression also.
   */
  _findMatchedObjects(val) {
    var match = [],
      results = [],
      unmatch = [];
    var searchVal = val.toLocaleLowerCase();

    //replacing special characters from the string with space from regular expression
    // val = val.replace(/[`~!@#$%^&*()|+\=?;:'",.<>\{\}\[\]\\\/]/gi, ''); // eslint-disable-line
    // var regEx = new RegExp(val, 'i');
    // var regEx2 = new RegExp('^' + val, 'i');
    //loop through out the list for checking the object's matches on val
    for (var idx = 0; idx < this.listdata.length; idx++) {
      var item = this.listdata[idx];
      var itemMeta = this.listMeta[idx];
      var searchIdx = itemMeta.searchKey.indexOf(searchVal);
      if (searchIdx !== -1) {
        // if the data contains the key push to the match array
        match.push(item);
        results.push(item);
      } else {
        unmatch.push(item);
      }
    }
    if (this.showFilteredOnly) {
      this.set('_suggestions', match);
    } else {
      this.set('_suggestions', match.concat(unmatch));
    }
    return results;
  }

  /**
   * Set the value to the value property
   * This will be the final step for selecting the listed items
   * @param {Object} item Selected Item
   */
  _setSelectedItem(item) {

    this.selectedItem = item;
    this.displayValue = this._getDisplayValue(item);
    if (this.valueproperty) {
      this.value = item ? item[this.valueproperty] : undefined;
    } else {
      this.value = item;
    }
    this.fire('pt-item-confirmed', item);

    // value-change will perform validation anyway.
    //this.setValidity(true, undefined);
    this._menuClose();

    this.async(function () {
      this.fire('change');
      if (this.fieldId) {
        this.fire('oe-field-changed', { fieldId: this.fieldId, value: this.value });
      }
    });
  }

  /**
   * Sorts data based on displayproperty
   * Kept method as public so that user can overwrite it if needed
   */
  sortData(a, b) {
    var displayValueA = this._getDisplayValue(a).toString();
    var displayValueB = this._getDisplayValue(b).toString();
    return displayValueA.toLowerCase().localeCompare(displayValueB.toLowerCase());
  }

  /**
   * Reset the fields in the component,
   * removes 'value',displayValue and error state.
   */
  __resetComponent() {
    this.value = undefined; //or null
    if(this.$.menu) {
      this.$.menu.selected = undefined;
    }
    this._setDisplayAndValidate();
  }

  __isItemSelected(item){
    let selected = this.multi ? this.selectedItems : [this.selectedItem];
    return Array.isArray(selected) && selected.indexOf(item) !== -1;
  }
}

window.customElements.define(OeCombo.is, OECommonMixin(OETemplatizeMixin(OEFieldMixin(OeCombo))));