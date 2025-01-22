import os
import subprocess
import sys
from server import run as run_server  # Import the server functionality

def run_command(command):
    """Run a shell command."""
    try:
        subprocess.run(command, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        sys.exit(1)

def setup_postgis():
    """Install PostgreSQL and PostGIS."""
    print("Installing PostgreSQL and PostGIS...")
    run_command("sudo apt update")
    run_command("sudo apt install -y postgresql postgresql-contrib postgis osm2pgsql renderd apache2")

    print("Setting up PostGIS database...")
    run_command("sudo -u postgres createdb gis")
    run_command("sudo -u postgres psql -d gis -c 'CREATE EXTENSION postgis;'")

def import_osm_file(osm_file):
    """Import .osm file into PostGIS using osm2pgsql."""
    print(f"Importing {osm_file} into the database...")
    run_command(f"osm2pgsql --create --slim -C 3000 --hstore -d gis {osm_file}")

def configure_renderd():
    """Configure renderd and Apache for tile serving."""
    print("Configuring renderd...")
    run_command("sudo systemctl restart renderd")
    run_command("sudo systemctl restart apache2")

def launch_map_viewer():
    """Launch a simple map viewer with the HTTP server."""
    print("Launching map viewer...")
    run_server()  # Use the server logic from server.py

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py <path_to_osm_file>")
        sys.exit(1)

    osm_file = sys.argv[1]
    if not os.path.isfile(osm_file):
        print(f"Error: File '{osm_file}' does not exist.")
        sys.exit(1)

    setup_postgis()
    import_osm_file(osm_file)
    configure_renderd()
    launch_map_viewer()
