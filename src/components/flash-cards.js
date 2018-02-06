/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js'
import { connect } from '../../node_modules/redux-helpers/connect-mixin.js';
import { SharedStyles } from './shared-styles.js';
import { store } from '../store.js';
import './a-card.js';
import './check-box.js';

import { showCard, getRight, getWrong } from '../actions/alphabet.js';

class FlashCards extends connect(store)(LitElement) {
  static get is() {
    return 'flash-cards';
  }

  static get properties() {
    return {
      cards: Object,
      card: Object,
      showAnswer: Boolean,
    }
  }

  render({card, cards, showAnswer}) {
    return html`
      <style>${SharedStyles}</style>
      <style>
      :host {
        padding: 60px;
      }
      </style>
      <check-box label="Show Answer" checked="${showAnswer}"></check-box>
      <a-card
        showAnswer="${showAnswer}"
        question="${card.question}"
        answer="${card.answer}"
        hint="${card.hint}">
      </a-card>
    `;
  }

  constructor() {
    super();
  }

  ready() {
    // Ready to render!
    super.ready();

    this.addEventListener('checked-changed', (e) => this.showAnswer = e.detail.checked);
    this.addEventListener('next-question', () => this.newQuestion());
    this.addEventListener('answered', (e) => {
      if (e.detail.correct) {
        store.dispatch(getRight(this.card));
      } else {
        store.dispatch(getWrong(this.card));
      }
    });
  }

  update(state) {
    this.cards = state.alphabet.cards;

    // HACK: because of how the redux connect mixin works this is actually
    // called before the constructor.
    if (!this.card) {
      this.card = {};
    }
    // If there isn't a choice yet, make one.
    if (Object.keys(this.cards).length !== 0 && !this.card.question) {
      this.newQuestion();
    }
  }

  newQuestion() {
    // Which kind of alphabet.
    const choices = Object.keys(this.cards);
    const whatKind = Math.floor(Math.random() * choices.length);
    const availableCards = this.cards[choices[whatKind]];
    const whichOne = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[whichOne];

    this.card = {
      question: card.jp,
      hint: choices[whatKind],
      answer: card.en
    }

    store.dispatch(showCard(this.card));
  }
}

window.customElements.define(FlashCards.is, FlashCards);
