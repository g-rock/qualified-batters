import json
import requests
import pandas as pd
with open('data/api.json', 'r') as file:
    data = json.load(file)

keys_to_keep = ["newestTeamAbbrevName", "date", "PA", "AB", "H", "HR", "BB", "K", "HBP", "SF", "TB", "RBI", "batsHand"]
league_stats = {}
all_game_data = []

# Function to calculate AVG (batting average)
def calculate_avg(hits, at_bats):
    if at_bats > 0:
        return hits / at_bats
    return 0

# Function to calculate OPS (on-base plus slugging)
def calculate_ops(hits, at_bats, bb, hbp, sf, tb):
    # OBP calculation
    obp = (hits + bb + hbp) / (at_bats + bb + hbp + sf) if (at_bats + bb + hbp + sf) > 0 else 0
    # SLG calculation using total bases (TB)
    slg = tb / at_bats if at_bats > 0 else 0
    return obp + slg, obp, slg

def save_image_from_url(image_url, file_path):
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(file_path, 'wb') as f:
            f.write(response.content)
        print(f"Image saved to {file_path}")
    else:
        print("Failed to retrieve the image")

for player in data:
    game_data = player.get('gameData', [])
    all_game_data.extend(game_data)
    player_image_url = player.get('playerImage', '')
    player_id = player.get('playerId')

    # save_image_from_url(player_image_url, f"data/images/{player_id}.png")
    cumulative_hits = 0
    cumulative_pa = 0
    cumulative_at_bats = 0
    cumulative_bb = 0
    cumulative_hbp = 0
    cumulative_sf = 0
    cumulative_tb = 0
    cumulative_games_played = 0
    cumulative_obp = 0
    cumulative_slg = 0
    
    cleaned_game_data = []
    
    for game in game_data:
        hits = game.get("H", 0)
        pa = game.get("PA", 0)
        at_bats = game.get("AB", 0)
        bb = game.get("BB", 0)
        hbp = game.get("HBP", 0)
        sf = game.get("SF", 0)
        tb = game.get("TB", 0)

        cumulative_hits += hits
        cumulative_pa += pa
        cumulative_at_bats += at_bats
        cumulative_bb += bb
        cumulative_hbp += hbp
        cumulative_sf += sf
        cumulative_tb += tb
        
        cumulative_avg = calculate_avg(cumulative_hits, cumulative_at_bats)
        cumulative_ops, cumulative_obp, cumulative_slg = calculate_ops(cumulative_hits, cumulative_at_bats, cumulative_bb, cumulative_hbp, cumulative_sf, cumulative_tb)
        
        cleaned_game = {key: game[key] for key in keys_to_keep if key in game}
        cleaned_game["cumH"] = cumulative_hits
        cleaned_game["cumPA"] = cumulative_pa
        cleaned_game["cumAB"] = cumulative_at_bats
        cleaned_game["cumBB"] = cumulative_bb
        cleaned_game["cumHBP"] = cumulative_hbp
        cleaned_game["cumSF"] = cumulative_sf
        cleaned_game["cumTB"] = cumulative_tb
        cleaned_game["cumAVG"] = f"{round(cumulative_avg, 3):.3f}"
        cleaned_game["cumOPS"] = f"{round(cumulative_ops, 3):.3f}"
        cleaned_game["cumOBP"] = f"{round(cumulative_obp, 3):.3f}"
        cleaned_game["cumSLG"] = f"{round(cumulative_slg, 3):.3f}"
        cleaned_game_data.append(cleaned_game)
    
    # Assign the cleaned gameData back to the player
    player['gameData'] = cleaned_game_data

    if cleaned_game_data:
        last_game = cleaned_game_data[-1]
        cumulative_keys = {key: value for key, value in last_game.items() if key.startswith("cum") or key == "newestTeamAbbrevName"}
        cumulative_keys["cumG"] = len(player.get('gameData', []))
        player.update(cumulative_keys)

df = pd.DataFrame(all_game_data)
total_hits = df['H'].sum()
total_plate_appearances = df['PA'].sum()
total_at_bats = df['AB'].sum()
total_bb = df['BB'].sum()
total_hbp = df['HBP'].sum()
total_sf = df['SF'].sum()
total_tb = df['TB'].sum()
total_g = len(df)
unique_player_count = df['playerId'].nunique()

# Calculate OPS using the summed values for the entire league
league_avg_ops, league_avg_obp, league_avg_slg = calculate_ops(
    total_hits, total_at_bats, total_bb, total_hbp, total_sf, total_tb
)

# Calculate the league averages for each stat
league_averages = {
    'league_H': total_hits / unique_player_count,
    'league_PA': total_plate_appearances / unique_player_count,
    'league_AB': total_at_bats / unique_player_count,
    'league_BB': total_bb / unique_player_count,
    'league_HBP': total_hbp / unique_player_count,
    'league_SF': total_sf / unique_player_count,
    'league_TB': total_tb / unique_player_count,
    'league_G': total_g / unique_player_count,
    'league_OPS': league_avg_ops,
    'league_OBP': league_avg_obp,
    'league_SLG': league_avg_slg,
    'league_AVG': total_hits / total_at_bats
}

for stat, value in league_averages.items():
    print(f"{stat}: {value:.3f}")

df['date'] = pd.to_datetime(df['date']).dt.date
df = df.sort_values(by='date')

# Calculate cumulative sums for the relevant statistics
df['cumH'] = df['H'].cumsum()
df['cumPA'] = df['PA'].cumsum()
df['cumAB'] = df['AB'].cumsum()
df['cumBB'] = df['BB'].cumsum()
df['cumHBP'] = df['HBP'].cumsum()
df['cumSF'] = df['SF'].cumsum()
df['cumTB'] = df['TB'].cumsum()

df['cumOPS'], df['cumOBP'], df['cumSLG'] = zip(*df.apply(
    lambda row: calculate_ops(
        row['cumH'], row['cumAB'], row['cumBB'], row['cumHBP'], row['cumSF'], row['cumTB']
    ), axis=1))

df['cumAVG'] = df['cumH'] / df['cumAB']
df['cumAVG'] = df['cumAVG'].fillna(0)

# Calculate the number of unique players per date
df['unique_players'] = df.groupby('date')['playerId'].transform('nunique')

running_averages_df = df[['date', 'cumAVG', 'cumOPS', 'cumOBP', 'cumSLG']]
running_averages_df.set_index('date', inplace=True)
running_averages_df = running_averages_df[~running_averages_df.index.duplicated(keep='last')]

league_averages_by_date = running_averages_df.reset_index().to_dict(orient='records')
for record in league_averages_by_date:
    record['date'] = str(record['date'])
league_averages['league_by_date'] = league_averages_by_date
with open('data/player_data_indented.json', 'w') as f:
    json.dump(data, f, indent=4)

with open('data/player_data.json', 'w') as f:
    json.dump(data, f)

with open('data/league_averages.json', 'w') as f:
    json.dump(league_averages, f, indent=4)