import os
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import unquote

# Configure the paths
BASE_DIR = os.path.abspath("./static")  # Path to the directory containing `index.html` and tiles
TILE_DIR = "/var/lib/mod_tile"          # Path to the directory containing your tiles

class TileRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Decode the URL
        path = unquote(self.path)

        # Route requests for tiles
        if path.startswith("/tiles/"):
            tile_path = os.path.join(TILE_DIR, path[len("/tiles/"):])
            if os.path.exists(tile_path):
                self.send_response(200)
                self.send_header("Content-type", "image/png")
                self.end_headers()
                with open(tile_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, "Tile not found")
            return

        # Serve static files (e.g., index.html, JS, CSS)
        super().do_GET()

# Set up and run the server
def run(server_class=HTTPServer, handler_class=TileRequestHandler, port=8000):
    os.chdir(BASE_DIR)  # Serve files from the base directory
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    print(f"Serving at http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
