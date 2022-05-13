function manageState(state, section, wrapper_id) {
    function getFragmentIndex() {
        const activeFragments = section
            .querySelectorAll('.fragment.current-visible.visible');
        if (activeFragments.length > 0) {
            const latest = activeFragments[activeFragments.length - 1];
            return (+latest.dataset.fragmentIndex) + 1;
        }
        return 0;
    }

    window.Reveal.addEventListener('fragmentshown', function(event) {
        if (event.fragment.parentNode.id !== wrapper_id) return;
        state.set(getFragmentIndex());
    });

    window.Reveal.addEventListener('fragmenthidden', function(event) {
        if (event.fragment.parentNode.id !== wrapper_id) return;
        state.set(getFragmentIndex());
    });

    window.Reveal.addEventListener('slidechanged', function(event) {
        if (event.previousSlide === section) {
            state.pause();
        } else if (event.currentSlide === section) {
            state.resume();
        }
    });

    state.set(getFragmentIndex());
    if (window.Reveal.getCurrentSlide() !== section) state.pause();
}

module.exports = manageState;
