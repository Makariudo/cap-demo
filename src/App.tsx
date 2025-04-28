import React, { useState, useMemo, ChangeEvent, JSX, useEffect } from 'react';
import './App.css';
import { dataDistance, NameToDistance, DistanceIntermediairesEnum } from './lib/distance_models'; // Import distance data and type

// Type definitions
interface DistanceData {
  label: string;
  meters: number;
  minSoutien?: number;
  maxSoutien?: number;
}

interface PaceData {
  label: string;
  seconds: number;
}

// Define interval distances (similar structure to NameToDistance for consistency)
const intervalDistances: { [key: string]: DistanceData } = {
  '100m': { label: '100m', meters: 100 },
  '200m': { label: '200m', meters: 200 },
  '300m': { label: '300m', meters: 300 },
  '400m': { label: '400m', meters: 400 },
  '500m': { label: '500m', meters: 500 },
  '600m': { label: '600m', meters: 600 },
  '800m': { label: '800m', meters: 800 },
  '1000m': { label: '1000m', meters: 1000 },
  '1500m': { label: '1500m', meters: 1500 },
  '2000m': { label: '2000m', meters: 2000 },
  '3000m': { label: '3000m', meters: 3000 },
  '5000m': { label: '5000m', meters: 5000 },
};

// Function to generate intermediate splits with a configurable interval
function getIntermediateSplits(raceDistanceMeters: number, raceLabel: string, splitIntervalMeters: number): DistanceData[] {
  const splits: DistanceData[] = [];
  if (splitIntervalMeters <= 0 || raceDistanceMeters <= 0) return []; // Prevent infinite loops or invalid calculations

  for (let d = splitIntervalMeters; d <= raceDistanceMeters; d += splitIntervalMeters) {
    // Use km for label if >= 1000m, otherwise use meters
    const label = d >= 1000 ? `${d / 1000}km` : `${d}m`;
    splits.push({ label: label, meters: d });
  }

  // Ensure the final race distance is included if not perfectly divisible by the interval
  if (raceDistanceMeters % splitIntervalMeters !== 0) {
    // Check if the last split is already the race distance to avoid duplicates
    if (splits.length === 0 || splits[splits.length - 1].meters !== raceDistanceMeters) {
      splits.push({ label: raceLabel, meters: raceDistanceMeters });
    }
  } else if (splits.length > 0 && splits[splits.length - 1].meters === raceDistanceMeters) {
    // If it was divisible and the last split IS the race distance, ensure the label is the race label
    splits[splits.length - 1].label = raceLabel;
  } else if (splits.length === 0) {
    // Handle cases where the race distance is less than the split interval
    splits.push({ label: raceLabel, meters: raceDistanceMeters });
  }

  return splits;
}

// Helper function to format seconds into hh:mm:ss or mm:ss
function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) {
    return '--:--';
  }
  let hours: number = Math.floor(totalSeconds / 3600);
  let minutes: number = Math.floor((totalSeconds % 3600) / 60);
  let seconds: number = Math.round(totalSeconds % 60);

  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }
  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  }

  const paddedSeconds: string = String(seconds).padStart(2, '0');
  const paddedMinutes: string = String(minutes).padStart(2, '0');

  if (hours > 0) {
    const paddedHours: string = String(hours).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  } else {
    return `${paddedMinutes}:${paddedSeconds}`;
  }
}

// Helper function to calculate time in seconds for a distance at a given pace
function calculateTime(distanceMeters: number, paceSecondsPerKm: number): number {
  if (paceSecondsPerKm <= 0) return NaN;
  const speedMetersPerSecond: number = 1000 / paceSecondsPerKm;
  return distanceMeters / speedMetersPerSecond;
}

// Component
function App(): JSX.Element {
  // State for mode selection
  type CalculatorMode = 'official' | 'interval' | 'intermediate';
  const [mode, setMode] = useState<CalculatorMode>('official');
  const [selectedIntermediateRaceKey, setSelectedIntermediateRaceKey] = useState<DistanceIntermediairesEnum | null>(null);
  // State for intermediate split interval
  const [intermediateSplitInterval, setIntermediateSplitInterval] = useState<number>(1000); // Default to 1km

  // State for pace configuration - Initialize from localStorage or defaults
  const [maxPaceMin, setMaxPaceMin] = useState<number>(() => {
    const saved = localStorage.getItem('paceConfigMaxMin');
    return saved ? parseInt(saved, 10) : 7; // Default Max: 7:00/km
  });
  const [maxPaceSec, setMaxPaceSec] = useState<number>(() => {
    const saved = localStorage.getItem('paceConfigMaxSec');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [minPaceMin, setMinPaceMin] = useState<number>(() => {
    const saved = localStorage.getItem('paceConfigMinMin');
    return saved ? parseInt(saved, 10) : 3; // Default Min: 3:00/km
  });
  const [minPaceSec, setMinPaceSec] = useState<number>(() => {
    const saved = localStorage.getItem('paceConfigMinSec');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [paceIntervalSec, setPaceIntervalSec] = useState<number>(() => {
    const saved = localStorage.getItem('paceConfigInterval');
    return saved ? parseInt(saved, 10) : 15; // Default Interval: 15s
  });

  // VMA state - Initialize from localStorage or default to '15'
  const [vma, setVma] = useState<string>(() => {
    const savedVma = localStorage.getItem('userVma');
    return savedVma ? savedVma : '15';
  });
  const [isColorModeEnabled, setIsColorModeEnabled] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect to save VMA to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userVma', vma);
  }, [vma]);

  // Effects to save pace config to localStorage
  useEffect(() => {
    localStorage.setItem('paceConfigMaxMin', String(maxPaceMin));
  }, [maxPaceMin]);

  useEffect(() => {
    localStorage.setItem('paceConfigMaxSec', String(maxPaceSec));
  }, [maxPaceSec]);

  useEffect(() => {
    localStorage.setItem('paceConfigMinMin', String(minPaceMin));
  }, [minPaceMin]);

  useEffect(() => {
    localStorage.setItem('paceConfigMinSec', String(minPaceSec));
  }, [minPaceSec]);

  useEffect(() => {
    localStorage.setItem('paceConfigInterval', String(paceIntervalSec));
  }, [paceIntervalSec]);

  // Use distances based on the selected mode
  const distances: DistanceData[] = useMemo(() => {
    switch (mode) {
      case 'interval':
        return Object.values(intervalDistances);
      case 'intermediate':
        if (selectedIntermediateRaceKey && dataDistance[selectedIntermediateRaceKey]) {
          const raceInfo = dataDistance[selectedIntermediateRaceKey];
          // Pass the selected interval to the split function
          return getIntermediateSplits(raceInfo.distance, raceInfo.label, intermediateSplitInterval);
        }
        return []; // Return empty if no race is selected
      case 'official':
      default:
        return Object.values(dataDistance).map((distInfo: NameToDistance) => ({
          label: distInfo.label,
          meters: distInfo.distance,
          minSoutien: distInfo.minSoutien,
          maxSoutien: distInfo.maxSoutien,
        }));
    }
  }, [mode, selectedIntermediateRaceKey, intermediateSplitInterval]); // Add intermediateSplitInterval dependency

  // Generate paces based on state using useMemo
  const paces: PaceData[] = useMemo(() => {
    const generatedPaces: PaceData[] = [];
    const maxTotalSeconds: number = maxPaceMin * 60 + maxPaceSec;
    const minTotalSeconds: number = minPaceMin * 60 + minPaceSec;
    const interval: number = paceIntervalSec;

    const absoluteMinSeconds = 2 * 60; // 2:00/km
    const absoluteMaxSeconds = 9 * 60; // 9:00/km

    if (maxTotalSeconds < minTotalSeconds || interval <= 0 || maxTotalSeconds < absoluteMinSeconds || minTotalSeconds > absoluteMaxSeconds) {
      return [];
    }

    const startSeconds = Math.min(maxTotalSeconds, absoluteMaxSeconds);
    const endSeconds = Math.max(minTotalSeconds, absoluteMinSeconds);

    for (let currentSeconds = startSeconds; currentSeconds >= endSeconds; currentSeconds -= interval) {
      const currentMin: number = Math.floor(currentSeconds / 60);
      const currentSec: number = currentSeconds % 60;
      generatedPaces.push({
        label: `${currentMin}:${String(currentSec).padStart(2, '0')}`,
        seconds: currentSeconds,
      });
    }

    if (endSeconds >= absoluteMinSeconds && !generatedPaces.some(p => p.seconds === endSeconds)) {
      const minMin = Math.floor(endSeconds / 60);
      const minSec = endSeconds % 60;
      generatedPaces.push({ label: `${minMin}:${String(minSec).padStart(2, '0')}`, seconds: endSeconds });
    }
    if (startSeconds <= absoluteMaxSeconds && startSeconds !== endSeconds && !generatedPaces.some(p => p.seconds === startSeconds)) {
      const maxMin = Math.floor(startSeconds / 60);
      const maxSec = startSeconds % 60;
      generatedPaces.push({ label: `${maxMin}:${String(maxSec).padStart(2, '0')}`, seconds: startSeconds });
    }

    generatedPaces.sort((a, b) => b.seconds - a.seconds);
    return generatedPaces;
  }, [maxPaceMin, maxPaceSec, minPaceMin, minPaceSec, paceIntervalSec]);

  const minuteOptions: number[] = Array.from({ length: 8 }, (_, i) => 2 + i);
  const secondOptions: number[] = [0, 15, 30, 45];
  const intervalOptions: number[] = Array.from({ length: 30 }, (_, i) => 1 + i);
  // Options for intermediate split interval
  const splitIntervalOptions: number[] = [100, 200, 400, 800, 1000]; // Example options in meters

  const handleMaxPaceMinChange = (e: ChangeEvent<HTMLSelectElement>) => setMaxPaceMin(parseInt(e.target.value, 10));
  const handleMaxPaceSecChange = (e: ChangeEvent<HTMLSelectElement>) => setMaxPaceSec(parseInt(e.target.value, 10));
  const handleMinPaceMinChange = (e: ChangeEvent<HTMLSelectElement>) => setMinPaceMin(parseInt(e.target.value, 10));
  const handleMinPaceSecChange = (e: ChangeEvent<HTMLSelectElement>) => setMinPaceSec(parseInt(e.target.value, 10));
  const handleIntervalChange = (e: ChangeEvent<HTMLSelectElement>) => setPaceIntervalSec(parseInt(e.target.value, 10));
  const handleVmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVma(e.target.value);
  };
  // Handler for intermediate split interval change
  const handleSplitIntervalChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setIntermediateSplitInterval(parseInt(e.target.value, 10));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getPaceColor = (paceSeconds: number, distance: DistanceData, currentVMA: number): string => {
    if (mode !== 'official' || !distance.minSoutien || !distance.maxSoutien || currentVMA <= 0) {
      return '';
    }

    const vmaPaceSeconds = 3600 / currentVMA;
    const minPacePercentage = distance.minSoutien / 100;
    const maxPacePercentage = distance.maxSoutien / 100;

    const minPaceSeconds = vmaPaceSeconds / maxPacePercentage;
    const maxPaceSeconds = vmaPaceSeconds / minPacePercentage;

    if (paceSeconds < minPaceSeconds || paceSeconds > maxPaceSeconds) {
      return '';
    }

    const normalizedPace = (paceSeconds - minPaceSeconds) / (maxPaceSeconds - minPaceSeconds);
    const red = Math.round(normalizedPace * 255);
    const green = 255 - red;
    return `rgb(${red}, ${green}, 0)`;
  };

  const toggleColorMode = () => {
    setIsColorModeEnabled(!isColorModeEnabled);
  };

  const printTable = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .table-container, .table-container * {
          visibility: visible;
        }
        .table-container {
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h1>Calculateur d'Allure</h1>
        <button className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1" onClick={toggleDarkMode}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Mode Selection */}
      <div className="mode-selection mb-4">
        <span className="mr-2">Mode:</span>
        <label className="mr-2">
          <input
            type="radio"
            name="mode"
            value="official"
            checked={mode === 'official'}
            onChange={() => setMode('official')}
            className="mr-1"
          />
          Distances Officielles
        </label>
        <label className="mr-2">
          <input
            type="radio"
            name="mode"
            value="interval"
            checked={mode === 'interval'}
            onChange={() => setMode('interval')}
            className="mr-1"
          />
          Fractionnés
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="intermediate"
            checked={mode === 'intermediate'}
            onChange={() => setMode('intermediate')}
            className="mr-1"
          />
          Temps Intermédiaires
        </label>
      </div>

      {/* Intermediate Race Selection (Conditional) */}
      {mode === 'intermediate' && (
        <div className="intermediate-config mb-4 flex items-center space-x-4">
          <div>
            <label htmlFor="intermediateRace" className="mr-2">Course:</label>
            <select
              id="intermediateRace"
              value={selectedIntermediateRaceKey ?? ''}
              onChange={(e) => setSelectedIntermediateRaceKey(e.target.value as DistanceIntermediairesEnum)}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
            >
              <option value="" disabled>-- Sélectionner --</option>
              {Object.entries(dataDistance).map(([key, distInfo]) => (
                <option key={key} value={key}>{distInfo.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="splitInterval" className="mr-2">Intervalle:</label>
            <select
              id="splitInterval"
              value={intermediateSplitInterval}
              onChange={handleSplitIntervalChange}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
              disabled={!selectedIntermediateRaceKey} // Disable if no race is selected
            >
              {splitIntervalOptions.map(interval => (
                <option key={interval} value={interval}>
                  {interval >= 1000 ? `${interval / 1000}km` : `${interval}m`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* VMA Input - Kept but doesn't affect table */}
      <div className="vma-input">
        <label htmlFor="vma">Votre VMA (km/h): </label>
        <input
          type="number"
          id="vma"
          value={vma}
          onChange={handleVmaChange}
          placeholder="ex: 15"
          className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
        />
        {vma && parseFloat(vma) > 0 && <span> (Allure VMA: {formatTime(3600 / parseFloat(vma))}/km)</span>}
      </div>
      <button className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1 mr-2" onClick={toggleColorMode}>
        {isColorModeEnabled ? 'Disable Color Mode' : 'Enable Color Mode'}
      </button>
      <button className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1" onClick={printTable}>
        Print Table
      </button>

      {/* Pace Configuration */}
      <div className="pace-config">
        <h3>Configurer l'affichage des allures</h3>
        <div className="config-row">
          <label>Allure Max (lente):</label>
          <div>
            <select
              value={maxPaceMin}
              onChange={handleMaxPaceMinChange}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
            >
              {minuteOptions.map(min => <option key={`max-min-${min}`} value={min}>{min}</option>)}
            </select>
            <span>:</span>
            <select
              value={maxPaceSec}
              onChange={handleMaxPaceSecChange}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
            >
              {secondOptions.map(sec => <option key={`max-sec-${sec}`} value={sec}>{String(sec).padStart(2, '0')}</option>)}
            </select>
            <span> min/km (max 9:00)</span>
          </div>
        </div>
        <div className="config-row">
          <label>Allure Min (rapide):</label>
          <div>
            <select
              value={minPaceMin}
              onChange={handleMinPaceMinChange}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
            >
              {minuteOptions.map(min => <option key={`min-min-${min}`} value={min}>{min}</option>)}
            </select>
            <span>:</span>
            <select
              value={minPaceSec}
              onChange={handleMinPaceSecChange}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
            >
              {secondOptions.map(sec => <option key={`min-sec-${sec}`} value={sec}>{String(sec).padStart(2, '0')}</option>)}
            </select>
            <span> min/km (min 2:00)</span>
          </div>
        </div>
        <div className="config-row">
          <label htmlFor="interval">Intervalle (secondes):</label>
          <div>
            <select
              id="interval"
              value={paceIntervalSec}
              onChange={handleIntervalChange}
              className="bg-gray-100 text-black border border-gray-300 rounded px-2 py-1"
            >
              {intervalOptions.map(sec => <option key={`interval-${sec}`} value={sec}>{sec}s</option>)}
            </select>
          </div>
        </div>
      </div>

      <h2>
        {mode === 'official' && "Tableau des Temps par Allure (Distances Officielles)"}
        {mode === 'interval' && "Tableau des Temps par Allure (Fractionnés)"}
        {mode === 'intermediate' && `Tableau des Temps Intermédiaires (${selectedIntermediateRaceKey ? dataDistance[selectedIntermediateRaceKey].label : 'Sélectionner distance'})`}
      </h2>
      {(paces.length > 0 && distances.length > 0) ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Allure (min/km)</th>
                {distances.map(dist => (
                  <th key={dist.label}>{dist.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paces.map(pace => {
                const currentVMA = parseFloat(vma) || 0;
                return (
                  <tr key={pace.seconds}>
                    <td>{pace.label}</td>
                    {distances.map(dist => {
                      const paceColor = isColorModeEnabled ? getPaceColor(pace.seconds, dist, currentVMA) : '';
                      return (
                        <td key={`${pace.seconds}-${dist.meters}`} style={{ backgroundColor: paceColor }}>
                          {formatTime(calculateTime(dist.meters, pace.seconds))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        mode === 'intermediate' && !selectedIntermediateRaceKey ?
          <p className="info-message">Veuillez sélectionner une distance de course pour voir les temps intermédiaires.</p> :
          paces.length === 0 ?
            <p className="info-message">Configuration d'allure invalide. Vérifiez que l'allure max est plus lente que l'allure min et dans les limites (2:00-9:00).</p> :
            <p className="info-message">Aucune distance à afficher pour le mode sélectionné.</p>
      )}
    </div>
  );
}

export default App;