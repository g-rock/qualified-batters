import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Scatter = ({ xyData, xLabel, yLabel, selectedPlayers, avg }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const selectedPlayerNames = selectedPlayers.map(player => player.playerFullName);

    // Separate data into selected and non-selected points
    const selectedData = xyData.filter(point => selectedPlayerNames.includes(point.playerName));
    const nonSelectedData = xyData.filter(point => !selectedPlayerNames.includes(point.playerName));

    const scatterChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Non-Selected Players',
            data: nonSelectedData,
            backgroundColor: 'rgba(99, 132, 255, 1)',
            borderColor: 'rgba(99, 132, 255, 1)',
            borderWidth: 1,
          },
          {
            label: 'Selected Players',
            data: selectedData,
            backgroundColor: 'rgba(255, 99, 132, 1)', // Selected color
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          annotation: {
            annotations: {
              avgLine: {
                type: 'line',
                yMin: avg,
                yMax: avg,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderColor: 'rgba(0, 0, 0, 1)',
                borderDash: [5, 5],
                pointRadius: 0,
                label: {
                  content: `Average: ${avg}`,
                  enabled: true,
                  position: 'end',
                },
              },
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { x, y, playerName } = context.raw;
                return `${playerName}: ${xLabel}=${x}, ${yLabel}=${y}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel,
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
          y: {
            title: {
              display: true,
              text: yLabel,
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
        },
      },
    });

    return () => {
      scatterChart.destroy();
    };
  }, [xyData, xLabel, yLabel, avg, selectedPlayers]);

  return <canvas ref={canvasRef} />;
};

export default Scatter;
