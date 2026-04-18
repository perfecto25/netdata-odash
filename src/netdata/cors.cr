def cors(ctx : HTTP::Server::Context)
  ctx.response.headers["Access-Control-Allow-Origin"] = "*"
  ctx.response.headers["Content-Type"] = "application/json"
end
