import http.server
import socketserver
import json
import signal
import sys
from urllib.parse import parse_qs

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        print("Received data:", post_data)  # Log the raw data for debugging
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            print("Parsed JSON:", data)  # Log the parsed JSON for debugging
            
            # Append the data to a file
            with open('game_log.csv', 'a') as f:
                for row in data:
                    f.write(','.join(map(str, row)) + '\n')
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Data received and stored successfully")
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Invalid JSON data")

def signal_handler(signal, frame):
    print("\nGracefully shutting down the server...")
    httpd.shutdown()
    httpd.server_close()
    sys.exit(0)

# Setup the server
with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)  # Handle Ctrl+C (SIGINT)
    signal.signal(signal.SIGTERM, signal_handler)  # Handle termination signal (SIGTERM)

    print(f"Serving at port {PORT}")
    try:
        httpd.serve_forever()
    except Exception as e:
        print(f"Error occurred: {e}")
        httpd.shutdown()
        httpd.server_close()
        sys.exit(1)
