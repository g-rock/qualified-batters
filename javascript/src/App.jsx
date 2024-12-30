import React, { useEffect, useMemo, useState } from 'react';
import Table from './components/table';
import Scatter from './components/scatter';
import Line from './components/line';
import AxisSelector from './components/AxisSelector';

function App() {

  // i do not like all this boilerplate in react :/ ..
  const [rowData, setRowData] = useState([]);
  const [avgData, setAvgData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [scatterXLabel, setScatterXLabel] = useState('cumAVG');
  const [scatterYLabel, setScatterYLabel] = useState('cumOPS');
  const [lineYLabel, setLineYLabel] = useState('cumOPS');
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playerDataResp = await fetch('/data/player_data.json');
        const playerData = await playerDataResp.json();

        const leagueDataResp = await fetch('/data/league_averages.json');
        const leagueData = await leagueDataResp.json();
        setRowData(playerData);
        setAvgData(leagueData);

      } catch (error) {
        console.error('Error fetching the data:', error);
      }
    };

    fetchData();
  }, []);

  const scatterData = useMemo(() => {
    if (rowData.length > 0) {
      return rowData.map(player => ({
        x: player[scatterXLabel],
        y: player[scatterYLabel],
        playerName: player.playerFullName,
      }));
    }
    return [];
  }, [rowData, scatterXLabel, scatterYLabel]);

  useEffect(() => {
    if (selectedPlayers.length > 0) {
      const selectedPlayerNames = new Set(selectedPlayers.map(row => row.playerFullName));
      const updatedLineData = rowData
        .filter(player => selectedPlayerNames.has(player.playerFullName))
        .map(player => ({
          playerName: player.playerFullName,
          customData: player.gameData.map(g => ({
            'Value': g[lineYLabel],
            'Date': g.date,
            'PA': g.PA,
            'AB': g.AB,
            'H': g.H,
            'BB': g.BB,
            'HBP': g.HBP,
            'SF': g.SF,
            'TB': g.TB,
          })),
        }));
      setLineData(updatedLineData);
    } else {
      setLineData([]);
    }
  }, [rowData, selectedPlayers, lineYLabel]);

  const handleSelectionChange = (selectedRows) => {
    setSelectedPlayers(selectedRows);
  };

  const axisOptions = [
    { label: 'Games (G)', value: 'cumG' },
    { label: 'Plate Appearances (PA)', value: 'cumPA' },
    { label: 'At-bats (AB)', value: 'cumAB' },
    { label: 'Hits (H)', value: 'cumH' },
    { label: 'Walks (BB)', value: 'cumBB' },
    { label: 'Batting Average (AVG)', value: 'cumAVG' },
    { label: 'On-base Percentage (OBP)', value: 'cumOBP' },
    { label: 'Slugging Percentage (SLG)', value: 'cumSLG' },
    { label: 'Total Bases (TB)', value: 'cumTB' },
    { label: 'On-base Plus Slugging (OPS)', value: 'cumOPS' },
  ];

  const scatterYAxisOptions = axisOptions;

  const lineYAxisOptions = axisOptions.filter(option =>
    ['cumAVG', 'cumOPS', 'cumOBP', 'cumSLG'].includes(option.value)
  );

  return (
    <div>
      <div className="header">
        <h1>2023 Qualified Batters</h1>
      </div>
      <div className="page">
        <div className="chart-view">
          {scatterData.length > 0 && (
            <div className="chart">
              <h3>Season Totals</h3>
              <Scatter 
                xyData={scatterData}
                xLabel={scatterXLabel.replace('cum', '')} 
                yLabel={scatterYLabel.replace('cum', '')}
                selectedPlayers={selectedPlayers}
                avg={avgData[`league_${scatterYLabel.replace('cum', '')}`]}
              />
              <p className='chart-note'>League {scatterYLabel.replace('cum', '')} ({avgData[`league_${scatterYLabel.replace('cum', '')}`].toFixed(3)}) based on season totals among qualified batters</p>
              <AxisSelector 
                xLabel={scatterXLabel} 
                yLabel={scatterYLabel} 
                setXLabel={setScatterXLabel} 
                setYLabel={setScatterYLabel} 
                options={scatterYAxisOptions}
                showXAxisSelector={true}
              />
            </div>
          )}

          {selectedPlayers.length > 0 && lineData.length > 0 ? (
            <div className="chart">
              <h3>Cumulative Daily Totals</h3>
              <Line 
                lineData={lineData}
                yLabel={lineYLabel.replace('cum', '')}
                avgData={avgData['league_by_date']}
              />
              <p className='chart-note'>League {lineYLabel.replace('cum', '')} line based on daily cumulative statistics among qualified batters</p>
              <AxisSelector 
                yLabel={lineYLabel} 
                setYLabel={setLineYLabel} 
                options={lineYAxisOptions}
                showXAxisSelector={false}
              />
            </div>
          ) : (
            <div className="chart">
              <h3>Cumulative Daily Totals</h3>
              <p>Select players from table to see totals</p>
            </div>
          )}
        </div>

        <div className="table-view">
          <Table 
            rowData={rowData} 
            onSelectionChange={handleSelectionChange} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
