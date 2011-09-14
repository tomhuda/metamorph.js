module("metamorph");

test("it should return a metamorph object", function() {
  var morph = Metamorph("one two three");

  equals(typeof morph, 'object', "returns an object");
});

test("it should return a string of HTML containing the string when outerHTML is called", function() {
  var morph = Metamorph("one two three");
  $("#qunit-fixture").html(morph.outerHTML());

  ok($("#qunit-fixture").text().match(/^.*one two three\s*$/), "Contains exactly the text injected");
});

test("it should allow HTML to be updated after injected into the DOM", function() {
  var morph = Metamorph("one two three");
  $("#qunit-fixture").html(morph.outerHTML());

  morph.html("three four five six");

  ok($("#qunit-fixture").text().match(/^.*three four five six\s*$/), "Contains the updated text");
});

test("it should allow you to remove the entire morph from the page", function() {
  var morph = Metamorph("one two three");
  $("#qunit-fixture").html(morph.outerHTML());

  morph.remove();

  raises(function() {
    morph.html("three");
  });
});

test("it should work inside a table", function() {
  var morph = Metamorph("<tr><td>HI!</td></tr>");
  $("#qunit-fixture").html("<table id='morphing'>" + morph.outerHTML() + "</table>");

  ok($("#morphing td").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<tr><td>BUH BYE!</td></tr>");

  ok($("#morphing td").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");

  morph.remove();

  ok($("#morphing").text().match(/\s*/));
});

test("it should work inside a tbody", function() {
  var morph = Metamorph("<tr><td>HI!</td></tr>");
  $("#qunit-fixture").html("<table id='morphing'><tbody>" + morph.outerHTML() + "</tbody></table>");

  ok($("#morphing td").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<tr><td>BUH BYE!</td></tr>");

  ok($("#morphing td").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");

  morph.remove();

  ok($("#morphing").text().match(/\s*/));
});

test("it should work inside a tr", function() {
  var morph = Metamorph("<td>HI!</td>");
  $("#qunit-fixture").html("<table id='morphing'><tr>" + morph.outerHTML() + "</tr></table>");

  ok($("#morphing td").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<td>BUH BYE!</td>");

  ok($("#morphing td").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");
  morph.remove();

  ok($("#morphing").html().match(/<tr>\s*<\/tr>/i));
});

test("it should work inside a ul", function() {
  var morph = Metamorph("<li>HI!</li>");
  $("#qunit-fixture").html("<ul id='morphing'>" + morph.outerHTML() + "</ul>");

  ok($("#morphing li").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<li>BUH BYE!</li>");

  ok($("#morphing li").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");
  morph.remove();

  ok($("#morphing").html().match(/\s*/));
});

test("it should work inside a select", function() {
  var morph = Metamorph("<option>HI!</option>");
  $("#qunit-fixture").html("<select id='morphing'>" + morph.outerHTML() + "</select>");

  ok($("#morphing option").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<option>BUH BYE!</option>");

  ok($("#morphing option").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");
  morph.remove();

  ok($("#morphing").html().match(/\s*/));
});

test("it can be appended to an existing node", function() {
  var morph = Metamorph("<tr><td>HI!</td></tr>");

  $("<table><tbody id='morphing'></tbody></table>").appendTo("#qunit-fixture");

  morph.appendTo($("#morphing")[0]);

  ok($("#morphing").text().match(/\s*HI!\s*$/), "metamorphs can be inserted into the DOM");

  morph.html("<tr><td>BYE!</td></tr>");

  ok($("#morphing").text().match(/\s*BYE!\s*$/), "metamorphs can be inserted into the DOM");
});
