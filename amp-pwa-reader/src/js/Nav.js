/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class Nav {

  constructor() {

    this.categories = {
      'us': 'top news',
      'us-news--us-politics': 'politics',
      'world': 'world',
      'commentisfree': 'opinion',
      'us--technology': 'tech',
      'us--culture': 'arts',
      'us--lifeandstyle': 'lifestyle',
      'fashion': 'fashion',
      'us--business': 'business',
      'us--travel': 'travel'
    };

    this.category = null;
    this.cards = [];
    this.element = document.querySelector('.sr-navigation');

    this.bind();

    // Create the nav items from categories
    this.create();

  }

  clear() {
    document.querySelector('ul.sr-navigation').innerHTML = '';
  }

  create() {

    let fragment = document.createDocumentFragment();

    for (let category in this.categories) {
      let item = document.createElement('li');
      let link = document.createElement('a');
      link.href = '#';
      link.dataset.tag = category;
      link.textContent = this.categories[category];
      item.appendChild(link);
      fragment.appendChild(item);
    }

    this.element.appendChild(fragment);

  }

  getNavElement(category) {
    return document.querySelector('.sr-navigation a[data-tag="' + category + '"]');
  }

  setNavElement(category) {

    // mark old menu element as inactive
    if (this.category) {
      let oldNavElement = this.getNavElement(this.category);
      oldNavElement && oldNavElement.parentNode.classList.remove('active');
    }

    // mark new one as active
    let navElement = this.getNavElement(category);
    navElement.parentNode.classList.add('active');

    // change category title
    document.querySelector('.sr-category span').textContent = this.categoryTitle;

  }

  switchCategory(category) {

    // set the new title
    this.categoryTitle = this.categories[category];

    // mark menu element as active
    this.setNavElement(category);

    // set the category
    this.category = category;

    // hide menu
    this.hide();

  }

  show() {

    //disable focus for all menu elements
    let children = Array.from(this.element.children); // sadly needed for Safari
    for (let child of children) {
      child.firstChild.removeAttribute('tabindex');
    }

      // focus the first element in the menu
    this.element.children[0].firstChild.focus();

    document.body.classList.add('sr-nav-shown');

  }

  hide() {

    //disable focus for all menu elements
    let children = Array.from(this.element.children); // sadly needed for Safari
    for (let child of children) {
      child.firstChild.setAttribute('tabindex', '-1');
    }

    // focus on the first element in the main view
    let focusableCard = shadowReader.itemsElement.firstElementChild.children[1];
    focusableCard && focusableCard.focus();

    document.body.classList.remove('sr-nav-shown');
  }

  toggle() {
    return this[document.body.classList.contains('sr-nav-shown') ? 'hide' : 'show']();
  }

  bind() {

    /* clicks on the hamburger menu icon */
    document.querySelector('.sr-hamburger').addEventListener(shadowReader.clickEvent, () => {
      this.toggle();
    }), false;

    /* clicks on menu links */
    document.querySelector('.sr-navigation').addEventListener(shadowReader.clickEvent, event => {

      // we're doing event delegation, and only want to trigger action on links
      if (event.target.nodeName !== 'A')
        return;

      // switch to the clicked category
      this.switchCategory(event.target.dataset.tag, event.target.parentNode);

      event.preventDefault();
    }), false;

  }

}