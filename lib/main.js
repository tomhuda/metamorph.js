// ==========================================================================
// Project:   metamorph
// Copyright: ©2011 My Company Inc. All rights reserved.
// ==========================================================================

(function(window) {

  var K = function(){},
      guid = 0;

  var Metamorph = function(html) {
    var self;

    if (this instanceof Metamorph) {
      self = this;
    } else {
      self = new K;
    }

    self.innerHTML = html;
    var myGuid = 'metamorph-'+(guid++);
    self.start = myGuid + '-start';
    self.end = myGuid + '-end';

    return self;
  };

  K.prototype = Metamorph.prototype;

  Metamorph.prototype.outerHTML = function() {
    return "<script id='" + this.start + "' type='text/x-placeholder'></script>" +
           this.innerHTML +
           "<script id='" + this.end + "' type='text/x-placeholder'></script>"
  };

  Metamorph.prototype.html = function(html) {
    this.checkRemoved();

    var range = this.range();

    range.deleteContents();
    var fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
  };

  Metamorph.prototype.remove = function() {
    var range = this.range(true);

    range.deleteContents();
    this.removed = true;
  };

  Metamorph.prototype.range = function(outerToo) {
    var range = document.createRange();
    var before = $("#" + this.start);
    var after = $("#" + this.end);

    if (outerToo) {
      range.setStartBefore(before[0]);
      range.setEndAfter(after[0]);
    } else {
      range.setStartAfter(before[0]);
      range.setEndBefore(after[0]);
    }

    return range;
  };

  Metamorph.prototype.checkRemoved = function() {
    var before = $("#" + this.start)[0];
    var after = $("#" + this.end)[0];

    if (!before || !after) {
      throw new Error("Cannot perform operations on a Metamorph that is not in the DOM.");
    }
  };

  window.Metamorph = Metamorph;


})(this);
