/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import {
  html,
  PolymerElement
} from "@polymer/polymer/polymer-element.js";
import {
  mixinBehaviors
} from "@polymer/polymer/lib/legacy/class.js";
import {
  IronFormElementBehavior
} from "@polymer/iron-form-element-behavior/iron-form-element-behavior.js";
import {
  OECommonMixin
} from "oe-mixins/oe-common-mixin.js";
import {
  OEFieldMixin
} from "oe-mixins/oe-field-mixin.js";
import {
  OETemplatizeMixin
} from "oe-mixins/oe-templatize-mixin.js";
import "@polymer/paper-listbox/paper-listbox.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-material/paper-material.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu.js";
import "@polymer/iron-dropdown/iron-dropdown.js";
import "@polymer/iron-input/iron-input.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "oe-ajax/oe-ajax.js";
import "oe-i18n-msg/oe-i18n-msg.js";
import "oe-utils/oe-cache-utils.js";

var OEUtils = window.OEUtils || {};
/**
 * # oe-dropdown
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
 * @demo demo/demo-oe-dropdown.html
 */
class OeDropdown extends mixinBehaviors([IronFormElementBehavior], PolymerElement) {

  static get is() {
    return 'oe-dropdown';
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <paper-dropdown-menu id="dropdown" role="combobox" no-label-float=[[noLabelFloat]] no-animations=[[noAnimations]] label=[[label]] disabled=[[disabled]]>
      <slot slot="prefix"></slot>
      <paper-listbox slot="dropdown-content" id="menu">
      
      <template is="dom-repeat" id="itemlist" items="{{listdata}}">
        <paper-item on-tap="onItemSelected" data-item={{item}} disabled$="[[disabledoption]]">
          <span>{{_getDisplayValue(item)}}</span>
        </paper-item>
      </template>

      </paper-listbox>
    </paper-dropdown-menu>
    `;
  }

  static get properties() {
    return {
      /**
       * Property within the listdata to be used for display
       */
      displayproperty: String,

      label: String,
      /**
       * Property of the selected record, that is set as current value.
       * When records are plain strings, leave this property undefined
       */
      valueproperty: String,

      /**
       * Current selected value
       */
      value: {
        type: Object,
        notify: true
      },

      noLabelFloat: {
        type: Boolean,
        value: false
      },

      noAnimations: {
        type: Boolean,
        value: false
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

      sort: {
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
    };
  }

  static get observers() {
    return ['_setDisplayAndValidate(value,listdata)'];
  }

  _onChange(eve) {
    eve.stopPropagation();
    this.validate();
  }


  /**
   * Event listener to set the value based on the user selection,
   * @param {Event} e selected-items-changed event by paper-listbox
   */
  _selectedItemsChanged(e) { }

  /**
   * Check of cache store in OEUtils namespace and add event listeners. 
   * If cache is present set the cached data in `listdata` else call `_fetchData`
   */
  _fetchListData() {
    var self = this;
    /* If List-Key is present, check if cache exists and set it on listdata */
    if (OEUtils.oeCache && (this.listkey || this.listurl)) {
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

        self.fire('oe-update-cache', {
          key: listkey,
          data: event.detail.response
        });
      });
      ajaxCall.addEventListener('error', function (event) { // eslint-disable-line no-unused-vars
        console.error('error fetching the list');
      });
      ajaxCall.generateRequest();
    }
  }

  _listDataChanged(newV, oldV) { // eslint-disable-line no-unused-vars
    if (this.listdata) {
      if (this.sort) {
        this.listdata.sort(this.sortData.bind(this));
      }
    }
  }

  /**
   * Custom validation of oe-dropdown to check based on allowFreeText and other flags
   */
  _validate() {

    var isValid = true;
    if (this.required && !this.value) {
      this.setValidity(false, 'valueMissing');
      isValid = false;
    }
    return isValid;
  }

  /**
   * Observer function listening to changes in `value` and `listdata`
   * Computes the display of the oe-dropdown and selects the correct values from paper-listbox,
   * based on `value` set on the element.
   * 
   * @param {string|Array} newV value set on element
   * @param {Array} newL listdata of the element
   */
  _setDisplayAndValidate(newV, newL) { // eslint-disable-line no-unused-vars

    if (this.value === null || this.value === undefined || !this.listdata) {
      //if value or listdata is not present 
      this.set('selectedItem', undefined);
      this.setValidity(true, undefined);
      return;
    }

    var menuList = this.$.menu;


    //Single selection sets selectedItem,validity
    for (var idx = 0, len = this.listdata.length; idx < len; idx++) {
      var item = this.listdata[idx];
      if (this.value === this._getItemValue(item)) {
        //Match found
        this.selectedItem = item;
        this.setValidity(true, undefined);

        //Select the item in paper-list
        menuList.select(idx);
        return;
      }
    }

    //Match not found
    if (typeof this.value === 'object') {
      this.selectedItem = this.value;
      this.setValidity(true, undefined);
    } else {
      this.setValidity(false, 'invalidValue');
    }


  }

  /**
   * Constructor gets the light-dom element for templating
   */
  constructor() {
    super();
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

    if (this.childTemplate) {
      this.async(function () {
        const itemList = this.shadowRoot.querySelector('#itemlist');
        this.__customTemplatize(itemList, this.childTemplate);

        itemList.render();
      }.bind(this), 300);
    }

    this.$.menu.addEventListener('selected-items-changed', this._selectedItemsChanged.bind(this));
  }

  /**
   * on-tap of a list item it is selected
   */
  onItemSelected(e) {
    var item = e.model.item;
    this._setSelectedItem(item);
    e.stopPropagation();
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
   * Set the value to the value property
   * This will be the final step for selecting the listed items
   */
  _setSelectedItem(item) {

    this.selectedItem = item;
    if (this.valueproperty) {
      this.value = item ? item[this.valueproperty] : undefined;
    } else {
      this.value = item;
    }
    this.fire('pt-item-confirmed', item);
    this.setValidity(true, undefined);
    this.$.dropdown.close();

    this.async(function () {
      this.fire('change');
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

}

window.customElements.define(OeDropdown.is, OECommonMixin(OETemplatizeMixin(OEFieldMixin(OeDropdown))));
