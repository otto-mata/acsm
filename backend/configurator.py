from typing import Literal


TyresType = Literal["SM", "ST", "SV", "US", "SS", "S", "M", "H"]
BlacklistMode = Literal["Kick", "KickUntilRestart", "Ban"]


class ServerConfig:
    name: str
    cars: str
    config_track: str
    track: str
    sun_angle: int
    password: str
    admin_password: str
    udp_port: int
    tcp_port: int
    http_port: int
    max_ballast_kg: int
    qualify_max_wait_perc: int
    pickup_mode_enabled: bool
    loop_mode: bool
    sleep_time: int
    client_send_interval_hz: int
    send_buffer_size: int
    recv_buffer_size: int
    race_over_time: int
    kick_quorum: int
    voting_quorum: int
    vote_duration: int
    blacklist_mode: BlacklistMode
    fuel_rate: int
    damage_multiplier: int
    tyre_wear_rate: int
    allowed_tyres_out: int
    abs_allowed: int
    tc_allowed: int
    start_rule: int
    stability_allowed: bool
    autoclutch_allowed: bool
    tyre_blankets_allowed: bool
    force_virtual_mirror: bool
    register_to_lobby: int
    max_clients: int
    num_threads: int
    udp_plugin_local_port: int
    udp_plugin_address: str
    auth_plugin_address: str
    legal_tyres: list[TyresType]
    welcome_message: str
    time_of_day_mult: int

    def __init__(
        self,
        name: str = "AC_Server",
        cars: str = "bmw_m3_e30",
        config_track: str = "",
        track: str = "magione",
        sun_angle: int = 48,
        password: str = "",
        admin_password: str = "mypassword",
        udp_port: int = 9600,
        tcp_port: int = 9600,
        http_port: int = 8081,
        max_ballast_kg: int = 100,
        qualify_max_wait_perc: int = 120,
        pickup_mode_enabled: bool = True,
        loop_mode: bool = True,
        sleep_time: int = 1,
        client_send_interval_hz: int = 18,
        send_buffer_size: int = 0,
        recv_buffer_size: int = 0,
        race_over_time: int = 180,
        kick_quorum: int = 85,
        voting_quorum: int = 80,
        vote_duration: int = 20,
        blacklist_mode: BlacklistMode = "KickUntilRestart",
        fuel_rate: int = 100,
        damage_multiplier: int = 100,
        tyre_wear_rate: int = 100,
        allowed_tyres_out: int = 2,
        abs_allowed: int = 1,
        tc_allowed: int = 1,
        start_rule: int = 0,
        stability_allowed: bool = False,
        autoclutch_allowed: bool = False,
        tyre_blankets_allowed: bool = False,
        force_virtual_mirror: bool = True,
        register_to_lobby: int = 1,
        max_clients: int = 18,
        num_threads: int = 2,
        udp_plugin_local_port: int = 0,
        udp_plugin_address: str = "",
        auth_plugin_address: str = "",
        legal_tyres: list[TyresType] = ["SV"],
        welcome_message: str = "",
        time_of_day_mult: int = 1,
    ) -> None:
        self.name = name
        self.cars = cars
        self.config_track = config_track
        self.track = track
        self.sun_angle = sun_angle
        self.password = password
        self.admin_password = admin_password
        self.udp_port = udp_port
        self.tcp_port = tcp_port
        self.http_port = http_port
        self.max_ballast_kg = max_ballast_kg
        self.qualify_max_wait_perc = qualify_max_wait_perc
        self.pickup_mode_enabled = pickup_mode_enabled
        self.loop_mode = loop_mode
        self.sleep_time = sleep_time
        self.client_send_interval_hz = client_send_interval_hz
        self.send_buffer_size = send_buffer_size
        self.recv_buffer_size = recv_buffer_size
        self.race_over_time = race_over_time
        self.kick_quorum = kick_quorum
        self.voting_quorum = voting_quorum
        self.vote_duration = vote_duration
        self.blacklist_mode = blacklist_mode
        self.fuel_rate = fuel_rate
        self.damage_multiplier = damage_multiplier
        self.tyre_wear_rate = tyre_wear_rate
        self.allowed_tyres_out = allowed_tyres_out
        self.abs_allowed = abs_allowed
        self.tc_allowed = tc_allowed
        self.start_rule = start_rule
        self.stability_allowed = stability_allowed
        self.autoclutch_allowed = autoclutch_allowed
        self.tyre_blankets_allowed = tyre_blankets_allowed
        self.force_virtual_mirror = force_virtual_mirror
        self.register_to_lobby = register_to_lobby
        self.max_clients = max_clients
        self.num_threads = num_threads
        self.udp_plugin_local_port = udp_plugin_local_port
        self.udp_plugin_address = udp_plugin_address
        self.auth_plugin_address = auth_plugin_address
        self.legal_tyres = legal_tyres
        self.welcome_message = welcome_message
        self.time_of_day_mult = time_of_day_mult


class RacingMode:
    type: Literal["practice", "qualify", "race"]
    is_open: bool
    time: int
    wait_time: int
    laps: int

    def __init__(
        self,
        type: Literal["practice", "qualify", "race"],
        *,
        is_open: bool = True,
        time: int = 10,
        wait_time: int = 0,
        laps: int = 0,
    ) -> None:
        if type not in ["practice", "qualify", "race"]:
            raise RuntimeError(f"Unknown racing mode type '{type}'")
        self.type = type
        self.is_open = is_open
        self.time = time
        self.wait_time = wait_time
        self.laps = laps
        if not self.time and not self.laps:
            raise RuntimeError("Cannot have no time set and no lap count")

    def serialize(self) -> list[str]:
        srl: list[str] = []
        srl.append(f"[{self.type.upper()}]\n")
        srl.append(f"NAME={self.type.capitalize()}\n")
        srl.append(f"IS_OPEN={1 if self.is_open else 0}\n")
        if self.time != 0:
            srl.append(f"TIME={self.time}\n")
        if self.wait_time != 0:
            srl.append(f"WAIT_TIME={self.wait_time}\n")
        if self.laps != 0:
            srl.append(f"LAPS={self.laps}\n")
        return srl


class PracticeConfig(RacingMode):
    def __init__(
        self,
        *,
        is_open: bool = True,
        time: int = 10,
        wait_time: int = 0,
        laps: int = 0,
    ) -> None:
        super().__init__(
            "practice", is_open=is_open, time=time, wait_time=wait_time, laps=laps
        )


class QualifyConfig(RacingMode):
    def __init__(
        self,
        *,
        is_open: bool = True,
        time: int = 10,
        wait_time: int = 0,
        laps: int = 0,
    ) -> None:
        super().__init__(
            "qualify", is_open=is_open, time=time, wait_time=wait_time, laps=laps
        )


class RaceConfig(RacingMode):
    def __init__(
        self,
        *,
        is_open: bool = True,
        time: int = 0,
        wait_time: int = 60,
        laps: int = 5,
    ) -> None:
        super().__init__(
            "race", is_open=is_open, time=time, wait_time=wait_time, laps=laps
        )


class DynamicTrackConfig:
    session_start: int
    randomness: int
    session_transfer: int
    lap_gain: int

    def __init__(
        self,
        *,
        session_start: int = 95,
        randomness: int = 2,
        session_transfer: int = 90,
        lap_gain: int = 10,
    ) -> None:
        self.lap_gain = lap_gain
        self.randomness = randomness
        self.session_start = session_start
        self.session_transfer = session_transfer


class WeatherConfig:
    graphics: str
    base_temperature_ambient: int
    base_temperature_road: int
    variation_ambient: int
    variation_road: int

    def __init__(
        self,
        *,
        graphics: str = "3_clear",
        base_temperature_ambient: int = 18,
        base_temperature_road: int = 6,
        variation_ambient: int = 1,
        variation_road: int = 1,
    ) -> None:
        self.graphics = graphics
        self.base_temperature_ambient = base_temperature_ambient
        self.base_temperature_road = base_temperature_road
        self.variation_ambient = variation_ambient
        self.variation_road = variation_road
