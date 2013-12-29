var Metamorph = requireModule("metamorph");

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

test("it should allow the entire HTML, including start and end tags, to be replaced", function() {
  var morph = Metamorph("one two three");
  $("#qunit-fixture").html(morph.outerHTML());

  morph.replaceWith(morph.startTag() + "three four five six" + morph.endTag());

  ok($("#qunit-fixture").text().match(/^.*three four five six\s*$/), "Contains the updated text");
});

test("it should allow low-level APIs to get the start and end tags", function() {
  var morph = Metamorph(), output;

  output  = morph.startTag();
  output += "one two three";
  output += morph.endTag();

  $("#qunit-fixture").html(output);

  morph.html("three four five six");

  ok($("#qunit-fixture").text().match(/^.*three four five six\s*$/), "Contains the updated text");
});

test("it should allow you to remove the entire morph from the page", function() {
  var morph = Metamorph("one two three");
  $("#qunit-fixture").html(morph.outerHTML());

  morph.remove();

  ok(morph.isRemoved(), "the morph correctly reports that it's removed");

  raises(function() {
    morph.html("three");
  });
});

test("it should allow you to replace the entire morph", function() {
  var morph = Metamorph("one two three");
  $("#qunit-fixture").html(morph.outerHTML());

  morph.replaceWith("nothing!");

  equal($("#qunit-fixture script").length, 0, "the start and end script tags were removed");
});

test("it should work inside a table", function() {
  var morph = Metamorph("<tr><td>HI!</td></tr>");
  $("#qunit-fixture").html("<table id='morphing'>" + morph.outerHTML() + "</table>");

  ok($("#morphing td").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<tr><td>BUH BYE!</td></tr>");

  ok($("#morphing td").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");

  morph.remove();

  ok($("#morphing").text().match(/^\s*$/), "Should leave no trace");
});

test("it should work inside a tbody", function() {
  var morph = Metamorph("<tr><td>HI!</td></tr>");
  $("#qunit-fixture").html("<table id='morphing'><tbody>" + morph.outerHTML() + "</tbody></table>");

  ok($("#morphing td").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<tr><td>BUH BYE!</td></tr>");

  ok($("#morphing td").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");

  morph.remove();

  ok($("#morphing").text().match(/^\s*$/), "Should leave no trace");
});

test("it should work inside a tr", function() {
  var morph = Metamorph("<td>HI!</td>");
  $("#qunit-fixture").html("<table id='morphing'><tr>" + morph.outerHTML() + "</tr></table>");

  ok($("#morphing td").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<td>BUH BYE!</td>");

  ok($("#morphing td").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");
  morph.remove();

  ok($("#morphing").html().match(/<tr>\s*<\/tr>/i), "Should leave no trace");
});

test("it should work inside a ul", function() {
  var morph = Metamorph("<li>HI!</li>");
  $("#qunit-fixture").html("<ul id='morphing'>" + morph.outerHTML() + "</ul>");

  ok($("#morphing li").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<li>BUH BYE!</li>");

  ok($("#morphing li").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");
  morph.remove();

  ok($("#morphing").html().match(/^\s*$/), "Should leave no trace");
});

test("it should work inside a select", function() {
  var morph = Metamorph("<option>HI!</option>");
  $("#qunit-fixture").html("<select id='morphing'>" + morph.outerHTML() + "</select>");

  ok($("#morphing option").text().match(/^\s*HI!\s*$/), "precond - Should include the contents");

  morph.html("<option>BUH BYE!</option>");

  ok($("#morphing option").text().match(/^\s*BUH BYE!\s*$/), "Should include the new contents");
  morph.remove();

  ok($("#morphing").html().match(/^\s*$/), "Should leave no trace");
});

test("it can be appended to an existing node", function() {
  var morph = Metamorph("<tr><td>HI!</td></tr>");

  $("<table><tbody id='morphing'></tbody></table>").appendTo("#qunit-fixture");

  morph.appendTo($("#morphing")[0]);

  ok($("#morphing").text().match(/\s*HI!\s*$/), "metamorphs can be inserted into the DOM");

  morph.html("<tr><td>BYE!</td></tr>");

  ok($("#morphing").text().match(/\s*BYE!\s*$/), "metamorphs can be inserted into the DOM");
});

test("arbitrary HTML can be appended after a morph", function() {
  var morph = Metamorph("<tr><td>cool story bro</td></tr>");

  $("#qunit-fixture").html("<table>"+morph.outerHTML()+"<table>");

  equal($("#qunit-fixture table td").length, 1, "precond - creates a table with a td");

  morph.after("<tr><td>even cooler story!!!</td></tr><tr><td>seems good bro</td></tr>");

  equal($("#qunit-fixture table td").length, 3, "appends two tds to the table");
  equal($("#qunit-fixture table").text(), "cool story broeven cooler story!!!seems good bro", "inserts nodes in correct order");
});

test("arbitrary HTML can be prepended as the first child of a morph and removed", function() {
  var morph = Metamorph("<tr><td>cool story bro</td></tr>");

  $("#qunit-fixture").html("<table>"+morph.outerHTML()+"<table>");
  equal($("#qunit-fixture table td").length, 1, "precond - creates a table with a td");

  morph.prepend("<tr><td>the best story evar</td><td>seems good bro</td></tr>");

  equal($("#qunit-fixture table td").length, 3, "prepends two tds to the table");
  equal($("#qunit-fixture table").text(), "the best story evarseems good brocool story bro", "inserts nodes in correct order");
});


/************/
/* IE TESTS */
/************/

if ($.browser.msie) {

  test("it handles replacing with noscope elements", function() {
    var morph = Metamorph("Testing");
    morph.appendTo($("#qunit-fixture")[0]);

    ok($("#qunit-fixture").text().match(/Testing/), "should have starting text");
    ok(!$("#qunit-fixture").html().match(/&shy;/), "should not have &shy;");

    morph.replaceWith("<script type='text/javascript' src='test.js'></script>Contents");

    ok($("#qunit-fixture").html().match(/script/), "should have script tag");
    ok(!$("#qunit-fixture").html().match(/&shy;/), "should not have &shy;");
  });

  test("it doesn't leave 'shys' hanging around in table", function() {
    var morph = Metamorph('<tr>Testing</tr>');

    $('#qunit-fixture').html('<table></table>');

    morph.appendTo($("#qunit-fixture table")[0]);

    ok($("#qunit-fixture").text().match(/Testing/), "should have starting text");
    ok(!$("#qunit-fixture").html().match(/&shy;/), "should not have &shy;");
  });

  test("it doesn't leave 'shys' hanging around in tbody", function() {
    var morph = Metamorph('<tr>Testing</tr>');

    $('#qunit-fixture').html('<table><tbody></tbody></table>');

    morph.appendTo($("#qunit-fixture tbody")[0]);

    ok($("#qunit-fixture").text().match(/Testing/), "should have starting text");
    ok(!$("#qunit-fixture").html().match(/&shy;/), "should not have &shy;");
  });

  test("it handles nested morphs with preceeding spaces", function() {
    var child = Metamorph("Child"),
        parent = Metamorph("Parent: "+child.outerHTML());

    parent.appendTo($('#qunit-fixture')[0]);

    child.html('Updated');

    ok($('#qunit-fixture').text().match(/Parent: Updated/), "should not remove spaces");
  });

}