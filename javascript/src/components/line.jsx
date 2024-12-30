import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns'; // Needed for date handling in Chart.js
Chart.register(annotationPlugin);

const LineChart = ({ lineData, yLabel, avgData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!lineData || lineData.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');

    const datasets = lineData.map((series, index) => ({
      label: series.playerName,
      data: series.customData.map((point) => ({
        x: point.Date,
        y: point.Value,
        ...point,
      })),
      backgroundColor: `rgba(${index * 50}, 99, 132, 0.2)`,
      borderColor: `rgba(${index * 50}, 99, 132, 1)`,
      pointRadius: 0,
      fill: false,
      tooltip: {
        enabled: false,
      }
    }));

    const averageDataset = {
      label: 'League Average',
      data: avgData.map((point) => ({
        x: point.date,
        y: point[`cum${yLabel}`],
      })),
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderColor: 'rgba(0, 0, 0, 1)',
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
    };

    datasets.push(averageDataset);

    const lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: datasets,
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                return `${tooltipItems[0].dataset.label}`;
              },
              label: (tooltipItem) => {
                const pointData = tooltipItem.raw;
                if (tooltipItem.dataset.label === 'League Average') {
                  return [
                    `Date: ${pointData.x}`,
                    `${yLabel}: ${pointData.y.toFixed(3)}`,
                  ]
                } else {
                  return [
                    `Date: ${pointData.x}`,
                    `Cum. ${yLabel}: ${pointData.y}`,
                    `PA: ${pointData.PA}`,
                    `H: ${pointData.H}`,
                    `BB: ${pointData.BB}`,
                    `HBP: ${pointData.HBP}`,
                    `SF: ${pointData.SF}`,
                    `TB: ${pointData.TB}`,
                  ];
                }
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: yLabel,
              font: {
                size: 14,
                weight: 'bold',
              },
              padding: { left: 20 },
            },
            ticks: {
              callback: function (value) {
                return Number.isInteger(value) ? value : value.toFixed(3);
              },
            },
          },
        },
      },
    });

    return () => {
      lineChart.destroy();
    };
  }, [lineData, yLabel, avgData]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default LineChart;
