(function () {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('[data-track]');
  const slides = Array.from(track.querySelectorAll('[data-slide]'));
  const prev = carousel.querySelector('[data-prev]');
  const next = carousel.querySelector('[data-next]');
  const dots = Array.from(carousel.querySelectorAll('[data-dot]'));

  if (!slides.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let scrollRaf;

  carousel.setAttribute('data-enhanced', 'true');

  const getReferenceOffset = () => (slides.length ? slides[0].offsetLeft : 0);

  const updateState = ({ focus = false } = {}) => {
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.classList.toggle('is-active', isActive);
      if (focus && isActive) {
        const focusTarget = slide.querySelector('a:not(.is-disabled), button:not([disabled]), [tabindex="0"]');
        if (focusTarget) {
          focusTarget.focus({ preventScroll: true });
        }
      }
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const scrollToIndex = (index, { focus = false, immediate = false } = {}) => {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    const target = slides[activeIndex];
    const offset = target.offsetLeft - getReferenceOffset();

    track.scrollTo({
      left: offset,
      behavior: immediate || prefersReducedMotion ? 'auto' : 'smooth',
    });

    updateState({ focus });
  };

  const handlePrev = () => scrollToIndex(activeIndex - 1, { focus: true });
  const handleNext = () => scrollToIndex(activeIndex + 1, { focus: true });

  prev?.addEventListener('click', handlePrev);
  next?.addEventListener('click', handleNext);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = Number(dot.dataset.index);
      if (!Number.isNaN(targetIndex)) {
        scrollToIndex(targetIndex, { focus: true });
      }
    });
  });

  const syncOnScroll = () => {
    if (scrollRaf) {
      cancelAnimationFrame(scrollRaf);
    }

    scrollRaf = requestAnimationFrame(() => {
      const referenceOffset = getReferenceOffset();
      const { scrollLeft } = track;
      let nearestIndex = activeIndex;
      let smallestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const distance = Math.abs((slide.offsetLeft - referenceOffset) - scrollLeft);
        if (distance < smallestDistance - 1) {
          smallestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex !== activeIndex) {
        activeIndex = nearestIndex;
        updateState();
      }
    });
  };

  track.addEventListener('scroll', syncOnScroll, { passive: true });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  });

  window.addEventListener('resize', () => {
    scrollToIndex(activeIndex, { immediate: true });
  });

  // Initialize state so the first project is in view.
  updateState();
  scrollToIndex(activeIndex, { immediate: true });
})();
