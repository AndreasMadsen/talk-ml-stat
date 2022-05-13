(function () {
  const section = document.currentScript.parentNode;

  function getFragmentIndex() {
    const activeFragments = section
      .querySelectorAll('.fragment.current-visible.visible');
    if (activeFragments.length > 0) {
      const latest = activeFragments[activeFragments.length - 1];
      return (+latest.dataset.fragmentIndex) + 1;
    }
    return 0;
  }

  Reveal.addEventListener('fragmentshown', function(event) {
    if (event.fragment.parentNode.id !== 'fishing-xkcd-logic') return;
    setPosition(getFragmentIndex());
  });

  Reveal.addEventListener('fragmenthidden', function(event) {
    if (event.fragment.parentNode.id !== 'fishing-xkcd-logic') return;
    setPosition(getFragmentIndex());
  });

  Reveal.addEventListener('slidechanged', function(event) {
    if (event.currentSlide === section) {
      setPosition(getFragmentIndex());
    }
  });

  const img = document.getElementById('fishing-xkcd-img');
  function setPosition(stateIndex) {
    img.classList.remove('position0');
    img.classList.remove('position1');
    img.classList.remove('position2');
    img.classList.remove('position3');
    img.classList.add('position' + stateIndex);
  }
})();
