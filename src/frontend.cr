module Frontend
  INDEX_HTML = {{ read_file("#{__DIR__}/../public/index.html") }}
  APP_JS     = {{ read_file("#{__DIR__}/../public/app.js") }}
end
