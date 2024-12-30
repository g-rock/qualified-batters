import React from 'react';

// The values passed in are all props. It took me a while to understand that.
const AxisSelector = ({ xLabel, yLabel, setXLabel, setYLabel, options, showXAxisSelector }) => {
  const handleXChange = (e) => {
    setXLabel(e.target.value);
  };

  const handleYChange = (e) => {
    setYLabel(e.target.value);
  };

  return (
    <div className="controls">
      {showXAxisSelector && (
        <div>
          <label htmlFor="x-axis-select">X Axis: </label>
          <select
            id="x-axis-select"
            value={xLabel}
            onChange={handleXChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="y-axis-select">Y Axis: </label>
        <select
          id="y-axis-select"
          value={yLabel}
          onChange={handleYChange}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AxisSelector;
