import sqlite3 as sl3
import json
from pathlib import Path


class CarSkin:
    Name: str
    Slug: str
    Path: Path
    Preview: bytes


class Car:
    Name: str
    Brand: str
    Slug: str
    Path: Path
    Skins: list[CarSkin]


class TrackLayout:
    Name: str
    Slug: str
    Path: Path
    Preview: bytes


class Track:
    Name: str
    Slug: str
    Path: Path
    Layouts: list[TrackLayout]


CTOR_TX = [
    """BEGIN TRANSACTION;""",
    """CREATE TABLE cars (
    id INTEGER PRIMARY KEY,
    name TEXT,
    brand TEXT,
    slug TEXT,
    path TEXT
);""",
    """CREATE TABLE car_skins (
    id INTEGER PRIMARY KEY,
    name TEXT,
    slug TEXT,
    path TEXT,
    preview BLOB,
    car_id INTEGER NOT NULL,
    FOREIGN KEY (car_id)
        REFERENCES cars (id)
);""",
    """CREATE TABLE tracks (
    id INTEGER PRIMARY KEY,
    name TEXT,
    slug TEXT,
    path TEXT
);""",
    """CREATE TABLE track_layouts (
    id INTEGER PRIMARY KEY,
    name TEXT,
    slug TEXT,
    path TEXT,
    track_id INTEGER NOT NULL,
    preview BLOB,
    FOREIGN KEY (track_id)
        REFERENCES tracks (id)
);""",
    """COMMIT;""",
]

CACHE: dict[str, list[str]] = {"tracks": [], "cars": []}


def construct_db(db_path: str):
    path = Path(db_path)
    ctx: sl3.Connection | None = None
    if not path.exists():
        path.touch(mode=644)
        ctx = sl3.connect(str(path))
        try:
            ctx.execute(CTOR_TX[0])
            ctx.execute(CTOR_TX[1])
            ctx.execute(CTOR_TX[2])
            ctx.execute(CTOR_TX[3])
            ctx.execute(CTOR_TX[4])
            ctx.execute(CTOR_TX[5])
        except sl3.Error:
            ctx.rollback()
            ctx.close()
            path.unlink()
            exit(1)
    elif not path.is_file():
        raise RuntimeError("Database path is a directory")


def load_cache():
    try:
        with open("discovery.cars.cache", "r") as f:
            CACHE["cars"] = [name for name in map(lambda x: x.strip(), f.readlines())]
    except FileNotFoundError:
        CACHE["cars"] = []
        open("discovery.cars.cache", "w").close()
    try:
        with open("discovery.tracks.cache", "r") as f:
            CACHE["tracks"] = [name for name in map(lambda x: x.strip(), f.readlines())]
    except FileNotFoundError:
        CACHE["tracks"] = []
        open("discovery.tracks.cache", "w").close()


def save_cache():
    def add_newline(s: str) -> str:
        return s + "\n"

    with open("discovery.cars.cache", "w") as f:
        f.writelines(map(add_newline, CACHE["cars"]))
    with open("discovery.tracks.cache", "w") as f:
        f.writelines(map(add_newline, CACHE["tracks"]))


def discover_cars(content_dir: str):
    path = Path(content_dir)
    ret: list[Car] = []

    if not path.exists() or not path.is_dir():
        raise RuntimeError(f"Invalid path: {content_dir}")
    cars = path / "cars"
    for car in cars.iterdir():
        if car.name in CACHE["cars"]:
            continue
        else:
            CACHE["cars"].append(car.name)
        car_name: str | None = None
        car_brand: str | None = None
        try:
            with open(car / "ui" / "ui_car.json", "rb") as car_info:
                data = json.load(car_info, strict=False)
                car_name = data["name"]
                car_brand = data["brand"]
        except:
            print(car.name)
        car_obj = Car()
        car_obj.Slug = car.name
        car_obj.Path = car.absolute()
        car_obj.Name = car_name or car.name
        car_obj.Brand = car_brand or "N/A"
        car_obj.Skins = []
        try:
            for skin in (car / "skins").iterdir():
                skin_name: str | None = None
                try:
                    with open(skin / "ui_skin.json", "rb") as skin_info:
                        data = json.load(skin_info, strict=False)
                        skin_name = data["skinname"]
                except FileNotFoundError:
                    skin_name = skin.name

                skin_obj = CarSkin()
                try:
                    with open(skin / "preview.jpg", "rb") as img:
                        skin_obj.Preview = img.read()
                except:
                    skin_obj.Preview = b""
                skin_obj.Slug = skin.name
                skin_obj.Name = skin_name or skin.name
                skin_obj.Path = skin.absolute()
                car_obj.Skins.append(skin_obj)
        except FileNotFoundError:
            print(f"No skins for {car.name}")
        ret.append(car_obj)
    return ret


def discover_tracks(content_dir: str):
    path = Path(content_dir)
    ret: list[Track] = []

    if not path.exists() or not path.is_dir():
        raise RuntimeError(f"Invalid path: {content_dir}")

    tracks = path / "tracks"
    for track in tracks.iterdir():
        if track.name in CACHE["tracks"]:
            continue
        else:
            CACHE["tracks"].append(track.name)
        ui_dir = track / "ui"

        t = Track()
        t.Slug = track.name
        t.Path = track.absolute()
        t.Layouts = []
        t.Name = track.name
        if (ui_dir / "ui_track.json").exists():
            try:
                l = TrackLayout()
                l.Slug = "default"
                l.Name = "default"
                l.Path = t.Path
                with open(
                    ui_dir / "ui_track.json", "r", encoding="latin-1"
                ) as track_info:
                    data = json.load(track_info, strict=False)
                    t.Name = data.get("name", track.name)

                with open(ui_dir / "preview.png", "rb") as img:
                    l.Preview = img.read()
                t.Layouts.append(l)
            except Exception as e:
                print(e.with_traceback(None))
                exit(1)
        else:
            for layout in ui_dir.iterdir():
                l = TrackLayout()
                l.Slug = layout.name
                l.Name = layout.name
                l.Path = layout.absolute()
                if (layout / "ui_track.json").exists():
                    try:
                        with open(
                            layout / "ui_track.json", "r", encoding="latin-1"
                        ) as track_info:
                            data = json.load(track_info, strict=False)
                            l.Name = data.get("name", layout.name)
                        with open(layout / "preview.png", "rb") as img:
                            l.Preview = img.read()
                    except Exception as e:
                        print(
                            str(layout / "ui_track.json"), ":", e.with_traceback(None)
                        )
                        exit(1)
                t.Layouts.append(l)
        ret.append(t)
    return ret


def store_cars(cars: list[Car], db_path: str):
    path = Path(db_path)
    ctx: sl3.Connection = sl3.connect(str(path))
    for car in cars:
        ctx.execute(
            """INSERT INTO cars (name, brand, slug, path) VALUES (?, ?, ?, ?)""",
            (car.Name, car.Brand, car.Slug, str(car.Path)),
        )
        ctx.commit()
        cur = ctx.execute("SELECT id FROM cars WHERE slug=?", (car.Slug,))
        car_id = cur.fetchone()[0]
        for skin in car.Skins:
            ctx.execute(
                """INSERT INTO car_skins (name, slug, path, preview, car_id) VALUES (?, ?, ?, ?, ?)""",
                (skin.Name, skin.Slug, str(skin.Path), skin.Preview, car_id),
            )
            ctx.commit()


def store_tracks(tracks: list[Track], db_path: str):
    path = Path(db_path)
    ctx: sl3.Connection = sl3.connect(str(path))
    for track in tracks:
        ctx.execute(
            """INSERT INTO tracks (name, slug, path) VALUES (?, ?, ?)""",
            (track.Name, track.Slug, str(track.Path)),
        )
        ctx.commit()
        cur = ctx.execute("SELECT id FROM tracks WHERE slug=?", (track.Slug,))
        track_id = cur.fetchone()[0]
        for layout in track.Layouts:
            ctx.execute(
                """INSERT INTO track_layouts (name, slug, path, track_id) VALUES (?, ?, ?, ?)""",
                (layout.Name, layout.Slug, str(layout.Path), track_id),
            )
            ctx.commit()


load_cache()
construct_db("./acsm.db")
cars = discover_cars(
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa\\content\\"
)
tracks = discover_tracks(
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa\\content\\"
)
store_cars(cars, "./acsm.db")
store_tracks(tracks, "./acsm.db")
save_cache()
