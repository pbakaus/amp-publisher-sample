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

class Card {

  constructor(data) {

    this.data = data;
    this.currentTransform = { scaleX: 1, scaleY: 1 };
    this.naturalDimensions = { width: 0, height: 0 };

    this.create();
    this.bind();

    this.render();

  }

  resizeChildren(dimensions, animate, toFullView) {

    let width = this.imageData.width;
    let height = this.imageData.height;
    let elemWidth = dimensions.width;
    let elemHeight = dimensions.height;
    let scaleY = elemHeight / height;
    let scaleX = elemWidth / width;

    let fitHorizontally = scaleX > scaleY;
    let centerX = 'translateX(' + (-(((width * scaleY) - elemWidth) / 2)) + 'px)';
    let centerY = 'translateY(' + (-(((height * scaleX) - elemHeight) / 2)) + 'px)';

    if (animate === false) {
      this.elem.classList.add('sr-disable-transitions');
    }

    // rescale image
    this.img.style.transform = (fitHorizontally ? centerY : centerX) + // center
      'scaleY(' + (1 / this.currentTransform.scaleY) + ')' + // normalizing
      'scaleX(' + (fitHorizontally ? scaleX : scaleY) + ')' + // fill the whole card
      'scaleY(' + (fitHorizontally ? scaleX : scaleY) + ')' + // fill the whole card
      'scaleX(' + (1 / this.currentTransform.scaleX) + ')' + // normalizing
      'scale(var(--hover-scale))'; // additional CSS variable we can control (we use it for hover effects)

    // rescale inner element
    this.innerElem.style.transform = 'scaleX(' + (1 / this.currentTransform.scaleX) + ')' // normalizing
      + 'scaleY(' + (1 / this.currentTransform.scaleY) + ')'; // normalizing

    // if the paragraph was hidden before, we need to slide it in..
    if (!this.elem.matches('.sr-card:first-child') && toFullView) {
      let paragraph = this.elem.children[1].children[1];
      this.innerElem.style.transform += ' translateY(-' + (paragraph.offsetHeight+16) + 'px)'; // 16px = 1em
    }

    // back to transitions after next render tick if prev disabled..
    if (animate === false) {
      setTimeout(() => { // turns out requestAnimationFrame isn't enough here..
        this.elem.classList.remove('sr-disable-transitions');
      }, 0);
    }

  }

  create() {

    var elem = document.createElement('div'),
      innerElem = document.createElement('a'),
      img = document.createElement('img'),
      h2 = document.createElement('h2'),
      p = document.createElement('p');

    h2.innerHTML = this.data.title;
    p.innerHTML = this.data.description;
    innerElem.className = 'sr-inner';
    innerElem.href = this.data.link || '';
    elem.className = 'sr-card';
    img.src = this.data.image;
    img.setAttribute('role', 'presentation'); // prevents screen reader access

    img.style.opacity = 0;
    img.onload = () => {

      this.imageData = {
        ratio: img.offsetHeight / img.offsetWidth,
        width: img.offsetWidth,
        height: img.offsetHeight
      };

      this.naturalDimensions = {
        width: this.elem.offsetWidth,
        height: this.elem.offsetHeight
      };

      this.resizeChildren(this.naturalDimensions, false);
      img.style.opacity = '';
      this.setReady();

    };

    innerElem.appendChild(h2);
    innerElem.appendChild(p);
    elem.appendChild(img);
    elem.appendChild(innerElem);

    this.elem = elem;
    this.img = img;
    this.innerElem = innerElem;

  }

  refresh() {

    this.naturalDimensions = {
      width: this.elem.offsetWidth,
      height: this.elem.offsetHeight
    };

    this.resizeChildren(this.naturalDimensions, false);

  }

  activate() {
    // TODO
    console.log('TODO: Activate card');
  }

  deactivate() {
    // TODO
  }

  bind() {
    /* use click event on purpose here, to not interfere with panning */
    this.innerElem.addEventListener('click', (event) => {

      // we only activate a card if we're on a narrow resolution, otherwise
      // we simply navigate to the link for now.
      if (innerWidth >= 768) {
        return;
      }

      // don't trigger the default link click
      event.preventDefault();

      // activate the card
      this.activate();

    });
  }

  render() {
    shadowReader.itemsElement.appendChild(this.elem);
  }

  setReady() {
    this._ready = true;
    if (this._readyQueue) {
      for (let cb of this._readyQueue) {
        cb();
      }
      this._readyQueue = [];
    }
  }

  ready(cb) {
    if (!this._ready) {
      this._readyQueue = this._readyQueue || [];
      this._readyQueue.push(cb);
    } else {
      cb();
    }
  }

}