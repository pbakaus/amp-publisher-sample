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
    this.category = null;
    this.cards = [];
    this.feedReader = new FeedReader;
    this.element = document.querySelector('.sr-navigation');

    this.bind();

    // initialize slide logic
    this.initMenuSlide();

    // Create the nav items from categories
    this.create();

    // The history module resolves the initial state from either the history API
    // or the loaded URL, in case there's no history entry.
    var state = shadowReader.history.state;

    if (state.articleUrl) {
      // TODO
    } else {
      // If there's no article to be loaded, just load the default or
      // selected category.
      this.switchCategory(state.category);
    }

  }

  clear() {
    document.querySelector('ul.sr-navigation').innerHTML = '';
  }

  create() {

    let fragment = document.createDocumentFragment();

    for (let category in shadowReader.backend.categories) {
      let item = document.createElement('li');
      let link = document.createElement('a');
      link.href = '#';
      link.dataset.tag = category;
      link.textContent = shadowReader.backend.categories[category];
      item.appendChild(link);
      fragment.appendChild(item);
    }

    this.element.appendChild(fragment);

  }

  initMenuSlide() {

    this.dragObserver = new DragObserver(document, { axis: 'x' });
    var wasOpen = false;
    var delta = 0;

    this.dragObserver.bind('start', () => {
      wasOpen = document.body.classList.contains('sr-nav-shown');
      this.element.classList.add('sr-disable-transitions');
    });

    this.dragObserver.bind('move', (position) => {
      delta = position.x;
      let x = Math.max(-200, Math.min(position.x, 200) - (wasOpen ? 0 : 200));
      this.element.style.transform = 'translateX(' + x + 'px)';
    });

    this.dragObserver.bind('stop', () => {
      this.element.classList.remove('sr-disable-transitions');
      this.element.style.transform = '';
      if (Math.abs(delta) > 70) {
        this[wasOpen ? 'hide' : 'show']();
      }
    });

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
    this.categoryTitle = shadowReader.backend.getCategoryTitle(category);

    // mark menu element as active
    this.setNavElement(category);

    // set the category
    this.category = category;

    // set current cards to loading
    for (let card of this.cards) {
      card.elem.classList.add('sr-loading');
    }

    // hide menu
    this.hide();

    // fetch new nav entries via RSS via YQL
    return this.feedReader.fetch(category).then(entries => {

      // empty items container (lazy..)
      shadowReader.itemsElement.innerHTML = '';
      this.cards = [];

      // render new entries
      for (let entry of entries) {
        this.cards.push(new Card(entry, /*headless*/false));
      }

      // reset scroll position
      document.scrollingElement.scrollTop = 0;

      // restore focus
      shadowReader.itemsElement.firstElementChild.children[1].focus();

    });

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

  resize() {
    for (let card of this.cards) {
      card.refresh();
    }
  }

  bind() {

    /* history navigation */
    window.addEventListener('popstate', event => {

      var state = {
        category: event.state && event.state.category ? event.state.category : this.category,
        articleUrl: event.state ? event.state.articleUrl : null
      };

      // switch to the correct category if not already on it
      if (this.category !== state.category) {
        this.switchCategory(state.category);
      }

    }, false);

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

      // set entry in the browser history, navigate URL bar
      shadowReader.history.navigate(null);

      event.preventDefault();
    }), false;

    /* resize event, mostly relevant for Desktop resolutions */
    let debounce;
    window.addEventListener('resize', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.resize();
      }, 100);
    });

  }

}