from __future__ import annotations

from typing import Dict, List

import requests


class RouteService:
    def __init__(self, osrm_base_url: str) -> None:
        self.osrm_base_url = osrm_base_url.rstrip("/")

    def _fallback_route(
        self,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
    ) -> Dict:
        return {
            "distance_m": None,
            "duration_s": None,
            "geometry": [[start_lat, start_lng], [end_lat, end_lng]],
            "source": "fallback",
        }

    def get_route(
        self,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
    ) -> Dict:
        url = (
            f"{self.osrm_base_url}/route/v1/driving/"
            f"{start_lng},{start_lat};{end_lng},{end_lat}"
            "?overview=full&geometries=geojson"
        )

        try:
            response = requests.get(url, timeout=4)
            response.raise_for_status()
            data = response.json()
            route = data.get("routes", [])[0]
            coordinates: List[List[float]] = route.get("geometry", {}).get("coordinates", [])

            return {
                "distance_m": route.get("distance"),
                "duration_s": route.get("duration"),
                "geometry": [[lat, lng] for lng, lat in coordinates],
                "source": "osrm",
            }
        except Exception:
            return self._fallback_route(start_lat, start_lng, end_lat, end_lng)
