import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-input/paper-input.js';
import './oe-dropdown.js';

var OeDropdown = window.customElements.get('oe-dropdown');
/**
 * `oe-dropdown-submenu`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/demo-oe-dropdown-submenu.html
 * 
 */


class OeDropdownSubmenu extends OeDropdown {
  static get is() {
    return 'oe-dropdown-submenu';
  }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
    .paper-align {
      display: -webkit-inline-box;
    }
    .justify {
      display: flex;
      justify-content: space-between; 
      min-width: 100%;
    }
    
    .submenu-item {
    font-size: 15px;
    padding: 5px 10px;
    font-weight: 300;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: block;
  }
    oe-checkbox {
      padding-top: 7px;
    }
    .checked {
      --iron-icon-fill-color: blue;
    }
    .more-button {
      padding: 0px;
    }
    .more {
      padding: 0px;
      transform: rotate(90deg);
    }
   
    .submenu-item:focus {
      outline: none;
    }
    .checkbox {
      cursor: pointer;
    }
    .item {
      padding: 10px;
    }
    .main-item {
      font-weight: 300;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      display: block;
    }
    .custom {
      @apply --oe-dropdown-submenu;
    }
    .sub-menu {
      min-width: 150px;
    }
    </style>
   
    <paper-menu-button id="menu-button" class="custom" vertical-offset="62" horizontal-offset="15" vertical-align="top" horizontal-align="right" restore-focus-on-close no-animations ignore-select allow-outside-scroll>
    <div class="dropdown-trigger" slot="dropdown-trigger">
    <paper-input placeholder="Select" id="input" type="text" readonly value={{displayValue}}>
      <iron-icon icon="paper-dropdown-menu:arrow-drop-down" suffix slot="suffix"></iron-icon>
    </paper-input>
  </div>
  <slot slot="prefix"></slot>
    <paper-listbox slot="dropdown-content" id="menu" class="listbox custom" horizontal-offset="42" vertical-offset="-42">
    <template is="dom-repeat" id="itemlist" items="{{_listdata}}">
    <paper-item id="allItem" data-item={{item}} disabled$="[[disabledoption]]">
    <div class="justify">
    <div class="main-item">
    <iron-icon class$="[[getClass(item.check)]] checkbox" icon=[[_getIcon(item.check)]] on-tap="onItemSelected" id=[[item.id]]></iron-icon>
    <span id="item" class="item">[[item.name]]</span>
    </div>
      <template is="dom-if" if=[[item.children.length]]>
        <paper-menu-button id="submenu-button" no-animations no-overlap ignore-select class="more-button" dynamic-align allow-outside-scroll horizontal-offset="32" vertical-offset="-32"> 
          <div class="layout horizontal" slot="dropdown-trigger">                        
            <iron-icon class="more" icon="arrow-drop-up"></iron-icon>
          </div>
          <paper-listbox multi slot="dropdown-content" class="sub-menu" id="sub-menu">
            <template is="dom-repeat" id="repeater" items={{item.children}}>
            <div class="layout vertical submenu-item">
            <iron-icon icon=[[_getIcon(item.check)]] class$="[[getClass(item.check)]] checkbox" on-tap="onItemSelected" id=[[item.id]]></iron-icon>
            <span id="sub-item" class="item">[[item.name]]</span>
            </div>
            </template>
          </paper-listbox>
        </paper-menu-button>
      </template>
    </div>
    </paper-item>
  </template>

  </paper-listbox>
  </paper-menu-button>

        `;
  }


  static get properties() {
    return {
      _listdata: {
        type: Array,
        value: function () {
          return []
        }
      },
      displayList: {
        type: Array,
        value: function () {
          return []
        }
      },
      valueproperty: {
        type: String
      },
      listdata: {
        type: Array,
        value: function () {
          return []
        },
        observer: 'listdataChanged'
      },
      /**
     * Current selected value
     */
      value: {
        type: Object,
        value: function () {
          return []
        }
      },
      displayValue: {
        type: String
      },
      valArr: {
        type: Array,
        value: function () {
          return []
        }
      }
    }
  }

  getClass(ck) {
    if (ck) {
      return "checked";
    }
    else {
      return "";
    }

  }
  listdataChanged(e) {
    var self = this;
    self._listdata = JSON.parse(JSON.stringify(self.listdata));
    if (self._listdata.length) {
      self._listdata.forEach((element, indItem) => {
        element.check = false;
        if (element.children) {
          element.children.forEach((ele, index) => {
            ele.check = false;
          })
        }
      });
    }
    //this.set('listdata',this._listdata);
  }
  _getIcon(check) {
    if (check) {
      return 'check-box';
    }
    else {
      return 'check-box-outline-blank';
    }
  }
  onItemSelected(e) {
    if (e.model.item.name !== 'All' && e.model.item.check) {
      this._listdata.find((ele, index) => {
        if (ele.name === 'All') {
          this.set('_listdata.' + index + '.check', !e.model.item.check);
        }
      })
    }
    if (e.model.item.name == 'All') {
      this._selectOrDeselectAll(!e.model.item.check);
    }
    else {
      var parent = e.model.item;
      if (parent.children && parent.children.length) {
        this._selectParent(parent, !e.model.item.check);
      }
      else {
        var parentOf = e.model.parentModel.item;
        this._selectChild(parent, parentOf, !e.model.item.check);
      }
    }
    this._setSelectedItem(e.model.item, !e.model.item.check);
    e.stopPropagation();
    this.displayValue = this.displayList.join(', ');
  }
  _setSelectedItem(item) {
    this.fire('pt-item-confirmed', this.value);
    this.setValidity(true, undefined);
    this.async(function () {
      this.fire('change');
    });
  }
  _selectOrDeselectAll(checkFlag) {
    var self = this;
    self.displayList = [];
    self.valArr = [];
    self._listdata.forEach((elem, index) => {
      self.set('_listdata.' + index + '.check', checkFlag);
      if (checkFlag) {
        if (elem.name !== 'All') {
          self.displayList.push(elem.name);
        }
      }
      else {
        self.displayList = [];
      }
      if (elem.children) {
        if (elem.children.length) {
          elem.children.forEach((ch, childIndex) => {
            self.set('_listdata.' + index + '.children.' + childIndex + '.check', checkFlag);
            if (checkFlag) {
              if (self.valueproperty) {
                if(!self.valArr.includes(ch[self.valueproperty])) self.valArr.push(ch[self.valueproperty]);
              }
              else if(!self.valArr.includes(e)){
                self.valArr.push(ch);
              }
            }
            else {
              self.valArr = [];
            }
          });
        }
      }
    });
    self.value = JSON.parse(JSON.stringify(self.valArr))
    // self.set('listdata', self._listdata);
  }
  _selectChild(child, pt, check) {
    var self = this;
    var flag = 0;
    var ptIndex = self._listdata.indexOf(pt);
    if (ptIndex >= 0) {
      if (!check) {
        self.set('_listdata.' + ptIndex + '.check', check);
      }
      self._listdata[ptIndex].children.forEach((e, index) => {
        if (e[self.valueproperty] === child[self.valueproperty]) {
          self.set('_listdata.' + ptIndex + '.children.' + index + '.check', check);
          if (check) {
            if (self.valueproperty) {
              if(!self.valArr.includes(e[self.valueproperty])) self.valArr.push(e[self.valueproperty]);
            }
            else if(!self.valArr.includes(e)){
              self.valArr.push(e);
            }
            if (!self.displayList.includes(e.name)) {
              self.displayList.push(e.name);
            }
          }
          else {
            if (self.valArr.includes(e[self.valueproperty]) || self.valArr.includes(e)) {
              var i = self.valArr.indexOf(self.valueproperty ? e[self.valueproperty] : e);
              if (i >= 0) {
                self.valArr.splice(i, 1);
              }
            }
            var i = self.displayList.indexOf(e.name);
            if (i >= 0) {
              self.displayList.splice(i, 1);
            }
          }
        }
        if (!check) {
          if (e.check) {
            if (!self.displayList.includes(e.name)) {
              self.displayList.push(e.name);
            }
          }
        }
        if (self._listdata[ptIndex].children[index].check) {
          flag++;
        }

      });
      if (flag === self._listdata[ptIndex].children.length) {
        self.set('_listdata.' + ptIndex + '.check', check);
        self._listdata[ptIndex].children.forEach((el) => {
          var i = self.displayList.indexOf(el.name);
          if (i >= 0) {
            self.displayList.splice(i, 1);
          }
        })
        if (!self.displayList.includes(pt.name)) {
          self.displayList.push(pt.name);
        }
      }
      else {
        var i = self.displayList.indexOf(pt.name);
        if (i >= 0) {
          self.displayList.splice(i, 1);
        }
      }
    }
    self.value = JSON.parse(JSON.stringify(self.valArr))
    //this.set('listdata', self._listdata);
  }
  _selectParent(pt, check) {
    var self = this;
    if (this._listdata.indexOf(pt) >= 0) {
      self.set('_listdata.' + this._listdata.indexOf(pt) + '.check', check);
      this._listdata[this._listdata.indexOf(pt)].children.forEach((e, index) => {
        if (self.displayList.includes(e.name)) {
          var i = self.displayList.indexOf(e.name);
          if (i >= 0) {
            self.displayList.splice(i, 1);
          }
        }
        self.set('_listdata.' + this._listdata.indexOf(pt) + '.children.' + index + '.check', check);
        if (check) {
          if (self.valueproperty) {
            if(!self.valArr.includes(e[self.valueproperty])) self.valArr.push(e[self.valueproperty]);
          }
          else if(!self.valArr.includes(e)){
            self.valArr.push(e);
          }
        }
        else {
          if (self.valArr.includes(e[self.valueproperty]) || self.valArr.includes(e)) {
            var i = self.valArr.indexOf(self.valueproperty ? e[self.valueproperty] : e);
            if (i >= 0) {
              self.valArr.splice(i, 1);
            }
          }
        }
      });
    }
    if (check && !self.displayList.includes(pt.name)) {
      self.displayList.push(pt.name);
    }
    else {
      var i = self.displayList.indexOf(pt.name);
      if (i >= 0) {
        self.displayList.splice(i, 1);
      }
    }
    self.value = JSON.parse(JSON.stringify(self.valArr))
    //this.set('listdata', this._listdata);
  }

}

window.customElements.define(OeDropdownSubmenu.is, OeDropdownSubmenu);