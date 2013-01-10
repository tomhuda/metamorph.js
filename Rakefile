require "bundler/setup"
require "js_module_transpiler"
require "uglifier"

directory "browser"

file "browser/metamorph.js" => ["browser", "lib/metamorph.js"] do
  library = File.read("lib/metamorph.js")
  open "browser/metamorph.js", "w" do |file|
    converter = JsModuleTranspiler::Compiler.new(File.read("./lib/metamorph.js"), "metamorph", into: "Metamorph")
    file.puts converter.to_globals
  end
end

file "browser/metamorph.amd.js" => ["browser", "lib/metamorph.js"] do
  library = File.read("lib/metamorph.js")
  open "browser/metamorph.amd.js", "w" do |file|
    require "js_module_transpiler"

    converter = JsModuleTranspiler::Compiler.new(File.read("./lib/metamorph.js"), "metamorph")
    file.puts converter.to_amd
  end
end

file "browser/metamorph.min.js" => "browser/metamorph.js" do
  output = Uglifier.compile(File.read("browser/metamorph.js"))

  open "browser/metamorph.min.js", "w" do |file|
    file.puts output
  end
end

task :clean do
  rm_rf 'browser'
end

task :dist => ["browser/metamorph.js", "browser/metamorph.min.js", "browser/metamorph.amd.js"]

task :default => :dist
