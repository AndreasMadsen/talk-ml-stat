(function () {
  const manageState = window.require('./manage_state');

  class State {
    constructor() {
      this.img = document.getElementById('fishing-xkcd-img');
    }

    pause() {}

    set(stateIndex) {
      this.img.classList.remove('position0');
      this.img.classList.remove('position1');
      this.img.classList.remove('position2');
      this.img.classList.remove('position3');
      this.img.classList.add('position' + stateIndex);
    }
  }

  const state = new State();
  manageState(state, document.currentScript.parentNode, 'fishing-xkcd-logic');
})();
