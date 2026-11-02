import json
import os
import requests
from flask import app, request

# Environmental variables
MEDIA_CATALOG_SERVICE_URL = os.environ.get("MEDIA_CATALOG_SERVICE_URL")

app = app.Flask(__name__)


def get_stored_media() -> list[dict]:
    response = requests.get(f"{MEDIA_CATALOG_SERVICE_URL}/stored",)
    return response.json()["message"]


def filter_flatrate(offers: list[dict]):
    """
    First step of the service filtering process
    Filter to only include offers with a "FLATRATE*" cost type
    """
    flatrate_services = []
    for offer in offers:
        if offer.get("type").find("FLATRATE") != -1:
            flatrate_services.append(offer)
    return flatrate_services


def consolidate_duplicates(offers: list[dict]):
    """
    Second step of the service filtering process
    Merge duplicates and setup dict structure
    """
    services = {}
    for offer in offers:
        if offer.get("name") not in services:
            services[offer["name"]] = {"url": offer["url"]}
    return services


def get_services(offers: list[dict]) -> dict:
    flatrate_offers = filter_flatrate(offers)
    services = consolidate_duplicates(flatrate_offers)
    return services


@app.route('/', methods=['GET'])
def recommendation() -> dict:
    collection = get_stored_media()
    service_coverage = {}
    try:
        for media in collection:
            media_services = get_services(media["offers"])
            for service, data in media_services.items():
                if service not in service_coverage:
                    service_coverage[service] = {
                        "media": [
                            {
                                "title": media["title"],
                                "url": data["url"],
                            }
                        ],
                        "count": 1,
                        "total": len(collection)
                    }
                else:
                    service_coverage[service]["media"].append(
                        {
                            "title": media["title"],
                            "url": data["url"]
                        })
                    service_coverage[service]["count"] += 1

    except:
        return {}, 500

    # Extract the dict and sort into a list descending with the coverage percentage
    sorted_dicts = sorted([{"service": service, **data} for service, data in service_coverage.items()],
                          key=lambda i: i["count"], reverse=True)
    return sorted_dicts, 200
