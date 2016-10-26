import {
  select
} from 'd3-selection'

import {
  dispatch as d3_dispatch
} from 'd3-dispatch'

import {
  timer as d3_timer
} from 'd3-timer'

import {
  bisect as d3_bisect
} from 'd3-array'

export default function scroller(els) {
  var windowHeight;
  var container = select('body');
  // event dispatcher
  var dispatch = d3_dispatch("active", "progress");

  // d3 selection of all the
  // text sections that will
  // be scrolled through
  var sections = null;

  // array that will hold the
  // y coordinate of each section
  // that is scrolled through
  var sectionPositions = [];
  var currentIndex = -1;
  // y coordinate of
  var containerStart = 0;

  /**
   * scroll - constructor function.
   * Sets up scroller to monitor
   * scrolling of els selection.
   *
   * @param els - d3 selection of
   *  elements that will be scrolled
   *  through by user.
   */
  function scroll(els) {
    sections = els;

    // when window is scrolled call
    // position. When it is resized
    // call resize.
    console.log("scroll",els)

    select(window)
      .on("scroll.scroller", position)
      .on("resize.scroller", resize);

    // manually call resize
    // initially to setup
    // scroller.
    resize();

    // hack to get position
    // to be called once for
    // the scroll position on
    // load.

    d3_timer(function() {
      position();
      return true;
    });
  }

  /**
   * resize - called initially and
   * also when page is resized.
   * Resets the sectionPositions
   *
   */
  function resize() {
    // sectionPositions will be each sections
    // starting position relative to the top
    // of the first section.
    sectionPositions = [];
    var startPos;
    sections.each(function(d,i) {
      var top = this.getBoundingClientRect().top;
      if(i === 0) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
    containerStart = container.node().getBoundingClientRect().top + window.pageYOffset;
  }

  /**
   * position - get current users position.
   * if user has scrolled to new section,
   * dispatch active event with new section
   * index.
   *
   */
  function position() {

    var pos = window.pageYOffset + 50  - containerStart;

    //console.log(pos)

    var sectionIndex = d3_bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size() - 1, sectionIndex);

    

    if (currentIndex !== sectionIndex) {
      console.log(pos,sectionIndex,dispatch)
      dispatch.call("active",this,sectionIndex);
      currentIndex = sectionIndex;
    }

    var prevIndex = Math.max(sectionIndex - 1, 0);
    var prevTop = sectionPositions[prevIndex];
    var diff=(sectionPositions[sectionIndex] - prevTop)
    var progress = (pos - prevTop) / diff;
    let local_y=(pos - prevTop);
    //console.log("(",pos,"-",prevTop,")","/","(",sectionPositions[sectionIndex],"-",prevTop,")")
    //console.log(sectionPositions)
    dispatch.call("progress",this,currentIndex,progress,pos,local_y);
  }

  /**
   * container - get/set the parent element
   * of the sections. Useful for if the
   * scrolling doesn't start at the very top
   * of the page.
   *
   * @param value - the new container value
   */
  scroll.container = function(value) {
    if (arguments.length === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  scroll.resize = function() {
    resize();
  }

  let d3_rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3__rebind(target, source, source[method]);
    return target;
  };

  function d3__rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }

   // allows us to bind to scroller events
  // which will interally be handled by
  // the dispatcher.
  d3_rebind(scroll, dispatch, "on");

  return scroll;
}