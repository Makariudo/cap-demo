import React, { useState, useMemo, ChangeEvent, JSX, useEffect } from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { dataDistance, NameToDistance, DistanceIntermediairesEnum } from './lib/distance_models'; // Import distance data and type
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// Type definitions
interface DistanceData {
  label: string;
  meters: number;
}
interface PaceData {
  label: string;
  seconds: number;
}
const INTERVAL_OPTIONS: number[] = [1, 5, 10, 15, 20, 25, 30];
const CONTROL_PADDING_Y = '0.35rem';
const CONTROL_PADDING_X = '0.75rem';
const CONTROL_BORDER_RADIUS = '8px';
const REFERENCE_DISTANCE_OPTIONS: Array<{ value: DistanceIntermediairesEnum; label: string }> = [
  { value: DistanceIntermediairesEnum['5000M'], label: '5 km' },
  { value: DistanceIntermediairesEnum['10KM'], label: '10 km' },
  { value: DistanceIntermediairesEnum['SEMI'], label: 'Semi-marathon' },
];
type TableViewMode = 'official' | 'fraction' | 'intermediate';

const TABLE_VIEW_OPTIONS: Array<{ value: TableViewMode; label: string }> = [
  { value: 'official', label: 'Distances officielles' },
  { value: 'fraction', label: 'Fractionnees' },
  { value: 'intermediate', label: 'Intermediaires' },
];

const FRACTION_DISTANCES_METERS: number[] = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 1600, 2000, 2500, 3000, 4000, 5000];

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
    const defaultInterval = 15;
    if (!saved) return defaultInterval;
    const parsed = parseInt(saved, 10);
    return INTERVAL_OPTIONS.includes(parsed) ? parsed : defaultInterval; // Default Interval: 15s
  });
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [tableViewMode, setTableViewMode] = useState<TableViewMode>('official');
  const [intermediateDistance, setIntermediateDistance] = useState<DistanceIntermediairesEnum>(DistanceIntermediairesEnum['10KM']);
  const [referenceDistance, setReferenceDistance] = useState<DistanceIntermediairesEnum>(REFERENCE_DISTANCE_OPTIONS[0].value);
  const [referenceHours, setReferenceHours] = useState<string>('0');
  const [referenceMinutes, setReferenceMinutes] = useState<string>('25');
  const [referenceSeconds, setReferenceSeconds] = useState<string>('0');
  const [referenceError, setReferenceError] = useState<string>('');
  const [computedVma, setComputedVma] = useState<number | null>(null);
  const [showReferenceEstimator, setShowReferenceEstimator] = useState<boolean>(false);
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
  useEffect(() => {
    document.title = 'Calculateur d\'allure';
  }, []);
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
  // Use distances from the imported model
  const distances: DistanceData[] = useMemo(() => {
    if (tableViewMode === 'fraction') {
      return FRACTION_DISTANCES_METERS.map(meters => ({
        label: `${meters} m`,
        meters,
      }));
    }

    if (tableViewMode === 'intermediate') {
      const referenceInfo = dataDistance[intermediateDistance];
      if (!referenceInfo) {
        return [];
      }

      const formatSplitLabel = (splitMeters: number) => {
        if (splitMeters >= 1000) {
          const kmValue = splitMeters / 1000;
          const formatted = Number.isInteger(kmValue)
            ? kmValue.toString()
            : kmValue.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
          return `${formatted} km`;
        }
        return `${splitMeters} m`;
      };

      const seen = new Set<number>();
      return referenceInfo.tempsIntermediaires
        .filter(split => {
          if (seen.has(split)) {
            return false;
          }
          seen.add(split);
          return true;
        })
        .map(split => ({
          label: formatSplitLabel(split),
          meters: split,
        }));
    }

    return Object.values(dataDistance).map((distInfo: NameToDistance) => ({
      label: distInfo.label,
      meters: distInfo.distance,
    }));
  }, [tableViewMode, intermediateDistance]);
  const distanceLookup = useMemo(() => {
    const lookup = new Map<string, NameToDistance>();
    Object.values(dataDistance).forEach(info => {
      lookup.set(info.label, info);
    });
    return lookup;
  }, []);

  const intermediateDistanceInfo = useMemo(() => {
    return dataDistance[intermediateDistance];
  }, [intermediateDistance]);

  // Generate paces based on state using useMemo
  const paces: PaceData[] = useMemo(() => {
    const generatedPaces: PaceData[] = [];
    const maxTotalSeconds: number = maxPaceMin * 60 + maxPaceSec;
    const minTotalSeconds: number = minPaceMin * 60 + minPaceSec;
    const interval: number = paceIntervalSec;
    // Define absolute limits
    const absoluteMinSeconds = 2 * 60; // 2:00/km
    const absoluteMaxSeconds = 9 * 60; // 9:00/km
    if (maxTotalSeconds < minTotalSeconds || interval <= 0 || maxTotalSeconds < absoluteMinSeconds || minTotalSeconds > absoluteMaxSeconds) {
      return []; // Invalid range or interval
    }
    // Clamp the iteration range to absolute limits
    const startSeconds = Math.min(maxTotalSeconds, absoluteMaxSeconds);
    const endSeconds = Math.max(minTotalSeconds, absoluteMinSeconds);
    for (let currentSeconds = startSeconds; currentSeconds >= endSeconds; currentSeconds -= interval) {
      const currentMin: number = Math.floor(currentSeconds / 60);
      const currentSec: number = currentSeconds % 60;
      generatedPaces.push({
        label: `${currentMin}:${String(currentSec).padStart(2, '0')}`,
        seconds: currentSeconds
      });
    }
    // Ensure the exact minimum pace (endSeconds) is included if within absolute limits and not caught by loop steps
    if (endSeconds >= absoluteMinSeconds && !generatedPaces.some(p => p.seconds === endSeconds)) {
      const minMin = Math.floor(endSeconds / 60);
      const minSec = endSeconds % 60;
      generatedPaces.push({ label: `${minMin}:${String(minSec).padStart(2, '0')}`, seconds: endSeconds });
    }
    // Ensure the exact maximum pace (startSeconds) is included if within absolute limits and not caught by loop steps, and different from min
    if (startSeconds <= absoluteMaxSeconds && startSeconds !== endSeconds && !generatedPaces.some(p => p.seconds === startSeconds)) {
      const maxMin = Math.floor(startSeconds / 60);
      const maxSec = startSeconds % 60;
      generatedPaces.push({ label: `${maxMin}:${String(maxSec).padStart(2, '0')}`, seconds: startSeconds });
    }
    // Sort paces descending by seconds (slowest first)
    generatedPaces.sort((a, b) => b.seconds - a.seconds);
    return generatedPaces;
  }, [maxPaceMin, maxPaceSec, minPaceMin, minPaceSec, paceIntervalSec]);
  // Helper options for selects
  const minuteOptions: number[] = Array.from({ length: 8 }, (_, i) => 2 + i); // 2 to 9
  const secondOptions: number[] = Array.from({ length: 60 }, (_, i) => i);
  const intervalOptions: number[] = INTERVAL_OPTIONS;
  // Handlers for pace inputs
  const handleMaxPaceMinChange = (e: ChangeEvent<HTMLSelectElement>) => setMaxPaceMin(parseInt(e.target.value, 10));
  const handleMaxPaceSecChange = (e: ChangeEvent<HTMLSelectElement>) => setMaxPaceSec(parseInt(e.target.value, 10));
  const handleMinPaceMinChange = (e: ChangeEvent<HTMLSelectElement>) => setMinPaceMin(parseInt(e.target.value, 10));
  const handleMinPaceSecChange = (e: ChangeEvent<HTMLSelectElement>) => setMinPaceSec(parseInt(e.target.value, 10));
  const handleIntervalChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = parseInt(e.target.value, 10);
    if (INTERVAL_OPTIONS.includes(nextValue)) {
      setPaceIntervalSec(nextValue);
    }
  };
  const handleColumnSelect = (columnIndex: number) => {
    setSelectedColumnIndex(prev => (prev === columnIndex ? null : columnIndex));
  };
  const handleRowSelect = (rowIndex: number) => {
    setSelectedRowIndex(prev => (prev === rowIndex ? null : rowIndex));
  };

  const parsePositiveInt = (value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return Math.max(0, parsed);
  };

  const handleReferenceDistanceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setReferenceDistance(e.target.value as DistanceIntermediairesEnum);
  };

  const handleReferenceHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReferenceHours(e.target.value);
  };

  const handleReferenceMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReferenceMinutes(e.target.value);
  };

  const handleReferenceSecondsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReferenceSeconds(e.target.value);
  };

  const handleEstimateVmaFromReference = () => {
    const hours = parsePositiveInt(referenceHours);
    const minutes = parsePositiveInt(referenceMinutes);
    const seconds = parsePositiveInt(referenceSeconds);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setReferenceError('Renseignez un temps de course valide.');
      return;
    }

    const referenceInfo = dataDistance[referenceDistance];

    if (!referenceInfo) {
      setReferenceError('Distance de reference inconnue.');
      return;
    }

    const averageSupportRatio = ((referenceInfo.minSoutien + referenceInfo.maxSoutien) / 2) / 100;

    if (averageSupportRatio <= 0) {
      setReferenceError('Impossible de calculer la VMA pour cette distance.');
      return;
    }

    const raceSpeed = (referenceInfo.distance / 1000) / (totalSeconds / 3600);

    if (!Number.isFinite(raceSpeed) || raceSpeed <= 0) {
      setReferenceError('Vitesse de course invalide.');
      return;
    }

    const estimatedVma = raceSpeed / averageSupportRatio;

    if (!Number.isFinite(estimatedVma) || estimatedVma <= 0) {
      setReferenceError('Resultat de VMA invalide.');
      return;
    }

    setReferenceError('');
    setComputedVma(estimatedVma);
    setVma(estimatedVma.toFixed(2));
    setSelectedColumnIndex(null);
    setSelectedRowIndex(null);
  };

  const handleTableViewModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as TableViewMode;
    setTableViewMode(mode);
    setSelectedColumnIndex(null);
    setSelectedRowIndex(null);
  };

  const handleIntermediateDistanceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setIntermediateDistance(e.target.value as DistanceIntermediairesEnum);
    setSelectedColumnIndex(null);
    setSelectedRowIndex(null);
  };

  const toggleReferenceEstimator = () => {
    setShowReferenceEstimator(prev => {
      if (prev) {
        setReferenceError('');
      }
      return !prev;
    });
  };
  // Handler for VMA (unused for display logic now)
  const handleVmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVma(e.target.value);
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  // Function to calculate the background color based on pace and VMA
  const getPaceColor = (paceSeconds: number, distance: NameToDistance | undefined, currentVMA: number): string => {
    if (!Number.isFinite(currentVMA) || currentVMA <= 0) {
      return '';
    }

    const vmaPaceSeconds = 3600 / currentVMA; // seconds per km at 100% VMA

    if (!distance) {
      const minFactor = 0.75; // ~125% VMA speed
      const maxFactor = 1.6; // ~62% VMA speed
      const ratio = paceSeconds / vmaPaceSeconds;
      const normalized = Math.min(Math.max((ratio - minFactor) / (maxFactor - minFactor), 0), 1);
      const inverted = 1 - normalized;
      const red = Math.round(inverted * 255);
      const green = 255 - red;
      return `rgb(${red}, ${green}, 0)`;
    }

    const minPacePercentage = distance.minSoutien / 100;
    const maxPacePercentage = distance.maxSoutien / 100;
    const minPaceSeconds = vmaPaceSeconds / maxPacePercentage;
    const maxPaceSeconds = vmaPaceSeconds / minPacePercentage;
    if (paceSeconds < minPaceSeconds || paceSeconds > maxPaceSeconds) {
      return ''; // No color if outside the range
    }
    const normalizedPace = (paceSeconds - minPaceSeconds) / (maxPaceSeconds - minPaceSeconds);
    const invertedPace = 1 - normalizedPace;
    const red = Math.round(invertedPace * 255);
    const green = 255 - red;
    return `rgb(${red}, ${green}, 0)`;
  };
  const toggleColorMode = () => {
    setIsColorModeEnabled(!isColorModeEnabled);
  };
  const printTable = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentPaces = selectedRowIndex !== null ? [paces[selectedRowIndex]] : paces;
    const title = `Temps de passage - ${TABLE_VIEW_OPTIONS.find(o => o.value === tableViewMode)?.label}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: center; }
            th { background-color: #f4f4f4; font-weight: bold; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead>
              <tr>
                <th>Allure (min/km)</th>
                ${distances.map(d => `<th>${d.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${currentPaces.map(pace => `
                <tr>
                  <td><strong>${pace.label}</strong></td>
                  ${distances.map(dist => `<td>${formatTime(calculateTime(dist.meters, pace.seconds))}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              // window.close(); // Optionnel : fermer l'onglet après impression
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#3b82f6', // Modern Blue
      },
      secondary: {
        main: '#10b981', // Modern Emerald
      },
      background: {
        default: isDarkMode ? '#0f172a' : '#f8fafc',
        paper: isDarkMode ? '#1e293b' : '#ffffff',
      }
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    shape: {
      borderRadius: 8,
    }
  });
  const StyledSelect = styled.select<{ theme: any }>`
    background-color: ${props => props.theme.palette.mode === 'dark' ? '#334155' : '#ffffff'};
    color: ${props => props.theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
    border: 1px solid ${props => props.theme.palette.mode === 'dark' ? '#475569' : '#cbd5e1'};
    border-radius: ${CONTROL_BORDER_RADIUS};
    padding: ${CONTROL_PADDING_Y} ${CONTROL_PADDING_X};
    font-size: 0.9rem;
    line-height: 1.4;
    transition: all .2s ease-in-out;
    &:focus {
      border-color: #3b82f6;
      outline: 0;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
  `;
  const StyledTextField = styled(TextField) <{ theme: any }>`
    .MuiOutlinedInput-root {
      background-color: ${props => props.theme.palette.mode === 'dark' ? '#334155' : '#ffffff'};
      color: ${props => props.theme.palette.mode === 'dark' ? '#f1f5f9' : 'inherit'};
      font-size: 0.9rem;
      border-radius: ${CONTROL_BORDER_RADIUS};
      transition: all .2s ease-in-out;
      .MuiOutlinedInput-input,
      .MuiSelect-select {
        padding: ${CONTROL_PADDING_Y} ${CONTROL_PADDING_X};
      }
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.mode === 'dark' ? '#475569' : '#cbd5e1'};
        border-radius: ${CONTROL_BORDER_RADIUS};
      }
      .MuiOutlinedInput-notchedOutline legend {
        display: none;
      }
      &:hover .MuiOutlinedInput-notchedOutline {
        border-color: #80bdff;
      }
      &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: #80bdff;
        box-shadow: 0 0 0 .2rem rgba(0,123,255,.25);
      }
    }
    .MuiInputLabel-root {
      color: ${props => props.theme.palette.mode === 'dark' ? '#fff' : 'inherit'};
    }
  `;
  return (
    <ThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <div className={`App ${isDarkMode ? 'dark' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h1>Calculateur d'allure</h1>
          </div>
          <div className="top-controls-grid">
            <div className="top-card top-card--mode">
              {/* VMA Input - Kept but doesn't affect table */}
              <div className="vma-input">
                <TextField
                  type="number"
                  id="vma"
                  value={vma}
                  onChange={handleVmaChange}
                  placeholder="ex: 15"
                  label="Votre VMA (km/h)"
                  variant="outlined"
                  size="small"
                />
                {vma && parseFloat(vma) > 0 && (
                  <div className="vma-pace-hint">
                    Allure VMA : <strong>{formatTime(3600 / parseFloat(vma))}/km</strong>
                  </div>
                )}
              </div>
              <div className="reference-toggle">
                <Button variant="text" size="small" onClick={toggleReferenceEstimator}>
                  {showReferenceEstimator ? "Masquer l'estimation VMA" : 'Je ne connais pas ma VMA'}
                </Button>
              </div>
              {showReferenceEstimator && (
                <div className="reference-estimator">
                  <h3>Estimer la VMA a partir d'un temps</h3>
                  <div className="reference-row">
                    <label htmlFor="reference-distance">Distance de reference</label>
                    <StyledSelect
                      id="reference-distance"
                      value={referenceDistance}
                      onChange={handleReferenceDistanceChange}
                    >
                      {REFERENCE_DISTANCE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                  <div className="reference-row reference-time">
                    <span>Temps :</span>
                    <StyledTextField
                      type="number"
                      label="h"
                      value={referenceHours}
                      onChange={handleReferenceHoursChange}
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                    <StyledTextField
                      type="number"
                      label="min"
                      value={referenceMinutes}
                      onChange={handleReferenceMinutesChange}
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                    <StyledTextField
                      type="number"
                      label="sec"
                      value={referenceSeconds}
                      onChange={handleReferenceSecondsChange}
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  </div>
                  <div className="reference-actions">
                    <Button variant="outlined" onClick={handleEstimateVmaFromReference}>
                      Calculer la VMA
                    </Button>
                  </div>
                  {referenceError && <p className="reference-error">{referenceError}</p>}
                  {computedVma !== null && !referenceError && (
                    <p className="reference-hint">VMA estimee : {computedVma.toFixed(2)} km/h (valeur appliquee ci-dessus).</p>
                  )}
                </div>
              )}
              <div className="table-controls">
                <div className="control-group">
                  <label htmlFor="table-view-mode">Mode :</label>
                  <StyledSelect
                    id="table-view-mode"
                    value={tableViewMode}
                    onChange={handleTableViewModeChange}
                  >
                    {TABLE_VIEW_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </StyledSelect>
                </div>
                {tableViewMode === 'intermediate' && (
                  <div className="control-group">
                    <label htmlFor="intermediate-distance">Distance :</label>
                    <StyledSelect
                      id="intermediate-distance"
                      value={intermediateDistance}
                      onChange={handleIntermediateDistanceChange}
                    >
                      {(Object.values(DistanceIntermediairesEnum) as DistanceIntermediairesEnum[]).map(distanceLabel => (
                        <option key={distanceLabel} value={distanceLabel}>
                          {distanceLabel}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                )}
              </div>
            </div>

            <div className="top-card top-card--pace">
              {/* Pace Configuration */}
              <div className="pace-config">
                <h3>Configurer l'affichage des allures</h3>
                <div className="config-row">
                  <label>Allure min :</label>
                  <div> {/* Wrap selects for better control */}
                    <StyledSelect
                      value={maxPaceMin}
                      onChange={handleMaxPaceMinChange}
                    >
                      {minuteOptions.map(min => <option key={`max-min-${min}`} value={min}>{min}</option>)}
                    </StyledSelect>
                    <span>:</span>
                    <StyledSelect
                      value={maxPaceSec}
                      onChange={handleMaxPaceSecChange}
                    >
                      {secondOptions.map(sec => <option key={`max-sec-${sec}`} value={sec}>{String(sec).padStart(2, '0')}</option>)}
                    </StyledSelect>
                    <span>
                      min/km <span className="mobile-hide">(max 9:00)</span>
                    </span>
                  </div>
                </div>
                <div className="config-row">
                  <label>Allure max :</label>
                  <div>
                    <StyledSelect
                      value={minPaceMin}
                      onChange={handleMinPaceMinChange}
                    >
                      {minuteOptions.map(min => <option key={`min-min-${min}`} value={min}>{min}</option>)}
                    </StyledSelect>
                    <span>:</span>
                    <StyledSelect
                      value={minPaceSec}
                      onChange={handleMinPaceSecChange}
                    >
                      {secondOptions.map(sec => <option key={`min-sec-${sec}`} value={sec}>{String(sec).padStart(2, '0')}</option>)}
                    </StyledSelect>
                    <span>
                      min/km <span className="mobile-hide">(min 2:00)</span>
                    </span>
                  </div>
                </div>
                <div className="config-row">
                  <label htmlFor="interval">Intervalle (secondes):</label>
                  <div>
                    <StyledTextField
                      id="interval"
                      select
                      value={paceIntervalSec}
                      onChange={handleIntervalChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        notched: false,
                      }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {intervalOptions.map(sec => (
                        <option key={`interval-${sec}`} value={sec}>
                          {sec}s
                        </option>
                      ))}
                    </StyledTextField>
                  </div>
                </div>
              </div>
            </div>

            <div className="top-card top-card--actions">
              <h3 className="top-card-title">Actions rapides</h3>
              <div className="action-buttons">
                <Button variant="outlined" onClick={toggleDarkMode}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button variant="outlined" onClick={toggleColorMode}>
                  {isColorModeEnabled ? 'Disable Color Mode' : 'Enable Color Mode'}
                </Button>
                <Button variant="outlined" onClick={printTable}>
                  Print Table
                </Button>
              </div>
            </div>
          </div>

          <h2 className="table-title">
            Tableau des Temps par Allure
            <span className="mode-badge">
              {TABLE_VIEW_OPTIONS.find(option => option.value === tableViewMode)?.label ?? ""}
            </span>
          </h2>
          {paces.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th
                      className={`column-header ${selectedColumnIndex === 0 ? 'selected-column' : ''}`}
                      onClick={() => handleColumnSelect(0)}
                    >
                      Allure (min/km)
                    </th>
                    {distances.map((dist, distIndex) => {
                      const columnIndex = distIndex + 1;
                      const isSelected = selectedColumnIndex === columnIndex;
                      return (
                        <th
                          key={dist.label}
                          className={`column-header ${isSelected ? 'selected-column' : ''}`}
                          onClick={() => handleColumnSelect(columnIndex)}
                        >
                          {dist.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paces.map((pace, rowIndex) => {
                    const currentVMA = parseFloat(vma) || 15;
                    const isRowSelected = selectedRowIndex === rowIndex;
                    return (
                      <tr
                        key={pace.seconds}
                        className={isRowSelected ? 'selected-row' : undefined}
                        onClick={() => handleRowSelect(rowIndex)}
                      >
                        <td className={selectedColumnIndex === 0 ? 'selected-column' : undefined}>{pace.label}</td>
                        {distances.map((dist, distIndex) => {
                          const columnIndex = distIndex + 1;
                          const isSelected = selectedColumnIndex === columnIndex;
                          const distanceInfoForColor = tableViewMode === 'official'
                            ? distanceLookup.get(dist.label)
                            : tableViewMode === 'intermediate'
                              ? intermediateDistanceInfo
                              : undefined;
                          const paceColor = isColorModeEnabled && distanceInfoForColor
                            ? getPaceColor(pace.seconds, distanceInfoForColor, currentVMA)
                            : '';
                          return (
                            <td
                              key={`${pace.seconds}-${dist.meters}`}
                              className={isSelected ? 'selected-column' : undefined}
                              style={{ backgroundColor: paceColor }}
                            >
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
            <p className="info-message">Configuration d'allure invalide. Verifiez que l'allure min est plus lente que l'allure max et respecte les limites (2:00-9:00).</p>
          )}
        </div>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}
export default App;




