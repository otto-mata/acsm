from flask import Flask, request, Response
import json

app = Flask(__name__)


# Enable CORS for cross-origin requests from the frontend
@app.after_request
def after_request(response: Response) -> Response:
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


@app.post("/presets")
def create_preset() -> str:
    server_cfg = request.form.get("server_config")
    car_entries = request.form.get("car_entries")

    print("=" * 60)
    print("PRESET DEPLOYMENT REQUEST")
    print("=" * 60)

    # Parse and display server config
    if server_cfg:
        config = json.loads(server_cfg)
        print("\nServer Configuration:")
        print(f"  Name: {config.get('NAME')}")
        print(f"  Track: {config.get('TRACK')}")
        print(f"  Layout: {config.get('CONFIG_TRACK') or 'Default'}")
        print(f"  Max Clients: {config.get('MAX_CLIENTS')}")
        print(f"  UDP Port: {config.get('UDP_PORT')}")

    # Parse and display car entries with random skin info
    if car_entries:
        cars = json.loads(car_entries)
        print(f"\nCar Entries ({len(cars)} total):")
        for idx, car_entry in enumerate(cars, 1):
            car_slug = car_entry.get("car")
            skin = car_entry.get("skin")
            is_random = car_entry.get("isRandom")

            if is_random:
                print(f"  {idx}. {car_slug} - [RANDOM SKIN]")
            else:
                print(f"  {idx}. {car_slug}/{skin}")

    print("=" * 60)

    return "200 OK"
