import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

def fetch_all_players_and_store(all_players_file):
    headers = {
        'accept': 'application/json',
        'tempToken': os.getenv('TEMP_TOKEN')
    }
    
    try:
        response = requests.get("https://project.trumedianetworks.com/api/mlb/players", headers=headers)
        response.raise_for_status()
        players = response.json()

        for player in players:
            player_id = player.get("playerId")
            if player_id:
                player_data = fetch_individual_player_data(player_id)
                if player_data:
                    player['gameData'] = player_data

        with open(all_players_file, 'w') as file:
            json.dump(players, file, indent=4)
        print(f"All players' summary data with individual data successfully fetched and stored in {all_players_file}")
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")

def fetch_individual_player_data(player_id):
    individual_api_url = f"https://project.trumedianetworks.com/api/mlb/player/{player_id}"
    headers = {
        'accept': 'application/json',
        'tempToken': os.getenv('TEMP_TOKEN')
    }
    try:
        response = requests.get(individual_api_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching individual player data for {player_id}: {e}")
        return None


if __name__ == "__main__":
    all_players_file = "data/api.json"
    fetch_all_players_and_store(all_players_file)
