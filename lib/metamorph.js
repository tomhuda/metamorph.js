// ==========================================================================
// Project:   metamorph
// Copyright: ©2011 My Company Inc. All rights reserved.
// ==========================================================================

(function(window) {

  var K = function(){},
      guid = 0,
      document = window.document,

      // Feature-detect the W3C range API, the extended check is for IE9 which only partially supports ranges
      supportsRange = ('createRange' in document) && (typeof Range !== 'undefined') && Range.prototype.createContextualFragment,

      // Internet Explorer prior to 9 does not allow setting innerHTML if the first element
      // is a "zero-scope" element. This problem can be worked around by making
      // the first node an invisible text node. We, like Modernizr, use &shy;
      needsShy = (function(){
        var testEl = document.createElement('div');
        testEl.innerHTML = "<div></div>";
        testEl.firstChild.innerHTML = "<script></script>";
        return testEl.firstChild.innerHTML === '';
      })();

  // Constructor that supports either Metamorph('foo') or new
  // Metamorph('foo');
  // 
  // Takes a string of HTML as the argument.

  var Metamorph = function(html) {
    var self;

    if (this instanceof Metamorph) {
      self = this;
    } else {
      self = new K();
    }

    self.innerHTML = html;
    var myGuid = 'metamorph-'+(guid++);
    self.start = myGuid + '-start';
    self.end = myGuid + '-end';

    return self;
  };

  K.prototype = Metamorph.prototype;

  var htmlFunc, removeFunc, outerHTMLFunc, appendToFunc, afterFunc, prependFunc, startTagFunc, endTagFunc, isRemovedFunc;

  outerHTMLFunc = function() {
    return this.startTag() + this.innerHTML + this.endTag();
  };

  // If we have the W3C range API, this process is relatively straight forward.
  if (supportsRange) {

    startTagFunc = function() {
      return "<!--" + this.start + "-->";
    };

    endTagFunc = function() {
      return "<!--" + this.end + "-->";
    };

    // IE 9 supports ranges but doesn't define createContextualFragment
    if (!Range.prototype.createContextualFragment) {
      Range.prototype.createContextualFragment = function(html) {
        var frag = document.createDocumentFragment(),
             div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
      };
    }

    var markers = {};

    var inBody = function(node) {
      return !!(node && (document.body.compareDocumentPosition(node) & 16));
    };

    var getMarker = function(name) {
      var marker = markers[name],
          commentIterator, comment;

      // Find marker nodes if not cached already
      if (!marker) {
        // NodeFilter.SHOW_COMMENT == 128
        commentIterator = document.createTreeWalker(
          document.body, 128, null, false
        );
        while (comment = commentIterator.nextNode()) {
          markers[comment.data] = comment;
        }
        marker = markers[name];
      }

      // Comment nodes may continue to exist even if they have been removed from
      // the document. Thus, make sure they are still somewhere in the body.
      if (!inBody(marker)) {
        delete markers[name];
        return;
      }

      return marker;
    };

    // Get a range for the current morph. Optionally include the starting and
    // ending placeholders.
    var rangeFor = function(morph, outerToo) {
      var start = getMarker(morph.start),
          end = getMarker(morph.end),
          range = document.createRange();

      if (start && end) {

        if (outerToo) {
          range.setStartBefore(start);
          range.setEndAfter(end);
        } else {
          range.setStartAfter(start);
          range.setEndBefore(end);
        }
        return range;
      }
    };

    htmlFunc = function(html, outerToo) {
      // get a range for the current metamorph object
      var range = rangeFor(this, outerToo);

      // delete the contents of the range, which will be the
      // nodes between the starting and ending placeholder.
      range.deleteContents();

      // create a new document fragment for the HTML
      var fragment = range.createContextualFragment(html);

      // insert the fragment into the range
      range.insertNode(fragment);
    };

    removeFunc = function() {
      // get a range for the current metamorph object including
      // the starting and ending placeholders.
      var range = rangeFor(this, true);

      // delete the entire range.
      range.deleteContents();
    };

    appendToFunc = function(node) {
      var range = document.createRange();
      range.setStart(node, 0);
      range.collapse(false);
      var frag = range.createContextualFragment(this.outerHTML());
      node.appendChild(frag);
    };

    afterFunc = function(html) {
      var range = document.createRange();
      var end = getMarker(this.end);

      range.setStartAfter(end);
      range.setEndAfter(end);

      var fragment = range.createContextualFragment(html);
      range.insertNode(fragment);
    };

    prependFunc = function(html) {
      var range = document.createRange();
      var start = getMarker(this.start);

      range.setStartAfter(start);
      range.setEndAfter(start);

      var fragment = range.createContextualFragment(html);
      range.insertNode(fragment);
    };

    isRemovedFunc = function() {
      return rangeFor(this) == null;
    };

  } else {

    if (document.createElement('comment').length == 0) {
      // Will be true in only IE6-8, which support the comment element. Comment
      // elements in IE6-8 have a length property that returns the number of
      // characters in the comment data. Other browsers will return undefined.

      // Even though comment elements support the element API, they act like an
      // HTML comment during rendering; neither comment elements nor their
      // children are rendered, and they do not affect CSS selectors.

      // Note that the id is both included on the comment element itself as well
      // as inside the comment element. This is for the case of markers in
      // select elements. See getMarker() below for more info.

      startTagFunc = function() {
        // The empty script tag at the beginning is a hack that somehow keeps
        // IE from removing the comment node when being inserted via innerHTML.
        // Instead, the script tag will be removed and only the comment will be
        // inserted. This is consistent in IE6-8.
        return "<script></script><comment id='" + this.start + "'>" + this.start + "</comment>";
      };

      endTagFunc = function() {
        return "<comment id='" + this.end + "'>" + this.end + "</comment>";
      };

    } else {
      // Just in case, fallback to a script element. This shouldn't happen in any
      // commonly used browser.

      startTagFunc = function() {
        return "<script id='" + this.start + "' type='text/x-placeholder'></script>";
      };

      endTagFunc = function() {
        return "<script id='" + this.end + "' type='text/x-placeholder'></script>";
      };

    }

    /**
     * This code is mostly taken from jQuery, with one exception. In jQuery's case, we
     * have some HTML and we need to figure out how to convert it into some nodes.
     *
     * In this case, jQuery needs to scan the HTML looking for an opening tag and use
     * that as the key for the wrap map. In our case, we know the parent node, and
     * can use its type as the key for the wrap map.
     **/
    var wrapMap = {
      select: [ 1, "<select multiple='multiple'>", "</select>" ],
      fieldset: [ 1, "<fieldset>", "</fieldset>" ],
      table: [ 1, "<table>", "</table>" ],
      tbody: [ 2, "<table><tbody>", "</tbody></table>" ],
      tr: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
      colgroup: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
      map: [ 1, "<map>", "</map>" ],
      _default: [ 0, "", "" ]
    };

    /**
     * Given a parent node and some HTML, generate a set of nodes. Return the first
     * node, which will allow us to traverse the rest using nextSibling.
     *
     * We need to do this because innerHTML in IE does not really parse the nodes.
     **/
    var firstNodeFor = function(parentNode, html) {
      var arr = wrapMap[parentNode.tagName.toLowerCase()] || wrapMap._default;
      var depth = arr[0], start = arr[1], end = arr[2];

      if (needsShy) { html = '&shy;'+html; }

      var element = document.createElement('div');
      element.innerHTML = start + html + end;

      for (var i=0; i<=depth; i++) {
        element = element.firstChild;
      }

      // Look for &shy; to remove it.
      if (needsShy) {
        var shyElement = element;

        // Sometimes we get nameless elements with the shy inside
        while (shyElement.nodeType === 1 && !shyElement.nodeName && shyElement.childNodes.length === 1) {
          shyElement = shyElement.firstChild;
        }

        // At this point it's the actual unicode character.
        if (shyElement.nodeType === 3 && shyElement.nodeValue.charAt(0) === "\u00AD") {
          shyElement.nodeValue = shyElement.nodeValue.slice(1);
        }
      }

      return element;
    };

    /**
     * In some cases, Internet Explorer can create an anonymous node in
     * the hierarchy with no tagName. You can create this scenario via:
     *
     *     div = document.createElement("div");
     *     div.innerHTML = "<table>&shy<script></script><tr><td>hi</td></tr></table>";
     *     div.firstChild.firstChild.tagName //=> ""
     *
     * If our script markers are inside such a node, we need to find that
     * node and use *it* as the marker.
     **/
    var realNode = function(start) {
      while (start.parentNode.tagName === "") {
        start = start.parentNode;
      }

      return start;
    };

    /**
     * When automatically adding a tbody, Internet Explorer inserts the
     * tbody immediately before the first <tr>. Other browsers create it
     * before the first node, no matter what.
     *
     * This means the the following code:
     *
     *     div = document.createElement("div");
     *     div.innerHTML = "<table><script id='first'></script><tr><td>hi</td></tr><script id='last'></script></table>
     *
     * Generates the following DOM in IE:
     *
     *     + div
     *       + table
     *         - script id='first'
     *         + tbody
     *           + tr
     *             + td
     *               - "hi"
     *           - script id='last'
     *
     * Which means that the two script tags, even though they were
     * inserted at the same point in the hierarchy in the original
     * HTML, now have different parents.
     *
     * This code reparents the first script tag by making it the tbody's
     * first child.
     **/
    var fixParentage = function(start, end) {
      if (start.parentNode !== end.parentNode) {
        end.parentNode.insertBefore(start, end.parentNode.firstChild);
      }
    };


    var getMarker = function(name) {
      var marker = document.getElementById(name);
      if (marker) {
        // Get the real starting node. See realNode for details.
        return realNode(marker);
      }

      // IE removes comment elements and html comments that are children of
      // select elements, but it turns their contents into a text node. These
      // text nodes are not rendered, but they can be accessed as childNodes.
      // Since this only happens to children of select elements, it is possible
      // to find the comment markers via document.getElementById() in most
      // cases, and the fallback test for a marker in a select element should
      // be reasonably efficient.
      var selects = document.getElementsByTagName("select"),
          i = 0, select, nodes, node, j;
      while (select = selects[i++]) {
        nodes = select.childNodes;
        j = 0;
        while (node = nodes[j++]) {
          // Node.TEXT_NODE == 3
          if (node.nodeType === 3 && node.nodeValue === name) {
            return node;
          }
        }
      }
    };

    htmlFunc = function(html, outerToo) {
      var start = getMarker(this.start);
      var end = getMarker(this.end);
      var parentNode = end.parentNode;
      var node, nextSibling, last;

      // make sure that the start and end nodes share the same
      // parent. If not, fix it.
      fixParentage(start, end);

      // remove all of the nodes after the starting placeholder and
      // before the ending placeholder.
      node = start.nextSibling;
      while (node) {
        nextSibling = node.nextSibling;
        last = node === end;

        // if this is the last node, and we want to remove it as well,
        // set the `end` node to the next sibling. This is because
        // for the rest of the function, we insert the new nodes
        // before the end (note that insertBefore(node, null) is
        // the same as appendChild(node)).
        //
        // if we do not want to remove it, just break.
        if (last) {
          if (outerToo) { end = node.nextSibling; } else { break; }
        }

        node.parentNode.removeChild(node);

        // if this is the last node and we didn't break before
        // (because we wanted to remove the outer nodes), break
        // now.
        if (last) { break; }

        node = nextSibling;
      }

      // get the first node for the HTML string, even in cases like
      // tables and lists where a simple innerHTML on a div would
      // swallow some of the content.
      node = firstNodeFor(start.parentNode, html);

      // copy the nodes for the HTML between the starting and ending
      // placeholder.
      while (node) {
        nextSibling = node.nextSibling;
        parentNode.insertBefore(node, end);
        node = nextSibling;
      }
    };

    // remove the nodes in the DOM representing this metamorph.
    //
    // this includes the starting and ending placeholders.
    removeFunc = function() {
      var start = getMarker(this.start);
      var end = getMarker(this.end);

      this.html('');
      start.parentNode.removeChild(start);
      end.parentNode.removeChild(end);
    };

    appendToFunc = function(parentNode) {
      var node = firstNodeFor(parentNode, this.outerHTML());

      while (node) {
        nextSibling = node.nextSibling;
        parentNode.appendChild(node);
        node = nextSibling;
      }
    };

    afterFunc = function(html) {
      var end = getMarker(this.end);
      var parentNode = end.parentNode;
      var nextSibling;
      var node;

      // get the first node for the HTML string, even in cases like
      // tables and lists where a simple innerHTML on a div would
      // swallow some of the content.
      node = firstNodeFor(parentNode, html);

      // copy the nodes for the HTML between the starting and ending
      // placeholder.
      while (node) {
        nextSibling = node.nextSibling;
        parentNode.insertBefore(node, end.nextSibling);
        node = nextSibling;
      }
    };

    prependFunc = function(html) {
      var start = getMarker(this.start);
      var parentNode = start.parentNode;
      var nextSibling;
      var node;

      node = firstNodeFor(parentNode, html);
      var insertBefore = start.nextSibling;

      while (node) {
        nextSibling = node.nextSibling;
        parentNode.insertBefore(node, insertBefore);
        node = nextSibling;
      }
    };

    isRemovedFunc = function() {
      var before = getMarker(this.start);
      var after = getMarker(this.end);

      return !before || !after;
    };
  }

  Metamorph.prototype.html = function(html) {
    this.checkRemoved();
    if (html === undefined) { return this.innerHTML; }

    htmlFunc.call(this, html);

    this.innerHTML = html;
  };

  Metamorph.prototype.replaceWith = function(html) {
    this.checkRemoved();
    htmlFunc.call(this, html, true);
  };

  Metamorph.prototype.remove = removeFunc;
  Metamorph.prototype.outerHTML = outerHTMLFunc;
  Metamorph.prototype.appendTo = appendToFunc;
  Metamorph.prototype.after = afterFunc;
  Metamorph.prototype.prepend = prependFunc;
  Metamorph.prototype.startTag = startTagFunc;
  Metamorph.prototype.endTag = endTagFunc;
  Metamorph.prototype.isRemoved = isRemovedFunc;

  Metamorph.prototype.checkRemoved = function() {
    if (this.isRemoved()) {
      throw new Error("Cannot perform operations on a Metamorph that is not in the DOM.");
    }
  };

  window.Metamorph = Metamorph;
})(this);

