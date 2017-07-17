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

class Reddit extends Backend {

  constructor() {
    super({
      appTitle: 'Reddit',
      ampEndpoint: 'https://amp.reddit.com/',
      defaultCategory: 'front',
      categories: {
        'front': 'front page',
        'r/askreddit': 'Ask Reddit'
      }
    });
  }

  /*
   * RSS Feed related getters and functions.
   */

  getRSSUrl(category) {
    return 'https://www.reddit.com/' + (category === 'front' ? '' : category) + '.json?raw_json=1';
  }

  getRSSTitle(entry) {
    return entry.data.title;
  }

  getRSSDescription(entry) {
    return entry.data.num_comments + ' comments';
  }

  getRSSImage(entry) {
    let preview = entry.data.preview && entry.data.preview.images && entry.data.preview.images[0];
    return preview ? preview.source.url : entry.data.thumbnail;
  }

  /*
   * AMP Doc related functions.
   */

  getAMPUrl(url) {
    return url.replace('www.', 'amp.');
  }

  constructAMPUrl(category, path) {
    return this.ampEndpoint + path;
  }

  sanitize(doc) {

    doc.querySelector('nav.TopNav').remove();

    // remove content head
    /*this._title = ;
    this._description = ;
    this._image = featuredImage.getAttribute('src');
    this._imageRatio = featuredImage.getAttribute('height') / featuredImage.getAttribute('width');*/

  }

}

Backend.classes['reddit'] = Reddit;