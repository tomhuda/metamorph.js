# Metamorph.js

Metamorph.js is a library that allows you to create a string of HTML,
insert it into the DOM, and update the contents later. It works for
normal cases, like inserting text into a `<p>` tag, and more complicated
cases, like updating an `<li>` inside a `<ul>` or a `<tr>` inside a
`<table>` (even after the `<tbody>` was automatically generated).

## Supported Browsers

Metamorph.js works on all browsers that support the W3C range API, with
a pure-DOM-based fallback for browsers that don't. Since virtually all
brwosers except for Internet Explorer support the W3C range API, the
DOM-based fallback was developed and tested using Internet Explorer.

It has been tested on Internet Explorer 6+, Firefox 3+, Safari 5, and
the current version of Chrome.

It should work on virtually all browsers currently in wide use. If you
find that the tests don't run on a generally available browser, please
file a bug.

## Usage

    // create the morph object
    var morph = Metamorph("HI!");

    // insert it into the DOM
    $("#foo").html(morph.outerHTML());

    // replace the contents
    morph.html("BYE!");

    // remove the morph
    morph.remove();

## Notes

Metamorph.js does not insert any visible, stylable elements into the
DOM and does not modify the DOM depth of the contents. This means that
existing stylesheets should work without modification.

When working with elements with particular content models, such as
tables, you may insert any valid content. For example, you may insert
a `<tr>` or `<tbody>` into a `<table>`, but not other content. You may
insert an `<li>` into a `<ul>`, but not a `<p>`.

This holds for the initial insertion as well as any updates.

    var ul = $("<ul>").appendTo("body").end();

    var morph = Metamorph("<li>HI!</li>");
    ul.append(morph.outerHTML()); // legal

    var otherMorph = Metamorph("<p>HI!</p>");
    ul.append(otherMorph.outerHTML()); // illegal

    morph.html("<li>BYE!</li>") // legal
    morph.html("<p>BYE!</p>") // illegal

## Implementation

Metamorph.js inserts a starting and ending `<script>` tag in the
`outerHTML` of a morph object. In all browsers, `<script>` tags may
appear anywhere in the DOM and do not affect display.

In browsers that support W3C ranges, the implementation is rather
straight forward. Metamorph.js creates a range, and places its starting
point after the first placeholder, and its ending point before the
second placeholder. It then deletes the contents of the range.

Then, using `range.createContextualFragment`, it creates a document
fragment for the content and inserts it into the range. Because
contextual fragments are not subject to the normal content model
restrictions of the DOM, it is possible to make a contextual fragment
for HTML like `<li>HI</li>`.

Internet Explorer's TextRange object is not sufficiently flexible to
surround arbitrary nodes that do not immediately contain text (such as a
`<tbody>` node). As a result, when the W3C range API is not available, a
much more complex solution is required.

Additionally, a number of bugs in Internet Explorer's handling of
innerHTML, and its DOM implementation require some additional
workarounds. For full information, the Internet Explorer workarounds are
well-documented in the code.

## Choices

The motivation for the Metamorph library is to make it possible for template
engines to insert metamorph literals into a String of outputted HTML
that they are generating. Because is not always possible to insert a Metamorph
directly into the DOM, the main initial API is `outerHTML`.

We plan to add some additional conveniences to the Metamorph object to
allow you to do things like: `morph.appendTo(node)`, to simplify other
uses that were not the original motivation for the project.
