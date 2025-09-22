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
const CONTROL_PADDING_Y = '0.25rem';
const CONTROL_PADDING_X = '0.5rem';
const CONTROL_BORDER_RADIUS = '0.2rem';
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
    // Extract label and meters from the imported dataDistance object
    // Add type assertion for distInfo
    return Object.values(dataDistance).map((distInfo: NameToDistance) => ({
        label: distInfo.label, // Use the label provided in dataDistance
        meters: distInfo.distance
    }));
    // If you specifically need the order from the Enum, you could map over Object.keys(DistanceIntermediairesEnum)
    // and look up in dataDistance, but Object.values(dataDistance) is simpler if order isn't critical.
  }, []); // Empty dependency array means this runs once
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
  // Handler for VMA (unused for display logic now)
  const handleVmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVma(e.target.value);
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  // Function to calculate the background color based on pace and VMA
  const getPaceColor = (paceSeconds: number, distance: NameToDistance, currentVMA: number): string => {
    const vmaPaceSeconds = 3600 / currentVMA; // seconds per km at 100% VMA
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
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
  });
  const StyledSelect = styled.select<{ theme: any }>`
    background-color: ${props => props.theme.palette.mode === 'dark' ? '#444' : '#f8f9fa'};
    color: ${props => props.theme.palette.mode === 'dark' ? '#fff' : '#495057'};
    border: 1px solid ${props => props.theme.palette.mode === 'dark' ? '#666' : '#ced4da'};
    border-radius: ${CONTROL_BORDER_RADIUS};
    padding: ${CONTROL_PADDING_Y} ${CONTROL_PADDING_X};
    font-size: 0.9rem;
    line-height: 1.4;
    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    &:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 .2rem rgba(0,123,255,.25);
    }
  `;
  const StyledTextField = styled(TextField)<{ theme: any }>`
    .MuiOutlinedInput-root {
      background-color: ${props => props.theme.palette.mode === 'dark' ? '#666' : '#f8f9fa'};
      color: ${props => props.theme.palette.mode === 'dark' ? '#fff' : 'inherit'};
      font-size: 0.9rem;
      border-radius: ${CONTROL_BORDER_RADIUS};
      .MuiOutlinedInput-input,
      .MuiSelect-select {
        padding: ${CONTROL_PADDING_Y} ${CONTROL_PADDING_X};
      }
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.mode === 'dark' ? '#888' : '#ced4da'};
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
            <Button variant="outlined" onClick={toggleDarkMode}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
           {/* VMA Input - Kept but doesn't affect table */}
           <div className="vma-input">
            <label htmlFor="vma">Votre VMA (km/h): </label>
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
             {vma && parseFloat(vma) > 0 && <span> (Allure VMA: {formatTime(3600 / parseFloat(vma))}/km)</span>}
           </div>
           <Button variant="outlined" onClick={toggleColorMode} sx={{ mr: 2 }}>
             {isColorModeEnabled ? 'Disable Color Mode' : 'Enable Color Mode'}
           </Button>
           <Button variant="outlined" onClick={printTable}>
             Print Table
           </Button>
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
               <span> min/km (max 9:00)</span>
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
               <span> min/km (min 2:00)</span>
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
         <h2>Tableau des Temps par Allure</h2>
         {paces.length > 0 ? (
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
                     const currentVMA = parseFloat(vma) || 15;
                     return (
                       <tr key={pace.seconds}>
                         <td>{pace.label}</td>
                         {distances.map(dist => {
                           const paceColor = isColorModeEnabled ? getPaceColor(pace.seconds, dataDistance[dist.label as DistanceIntermediairesEnum], currentVMA) : '';
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
               <p className="info-message">Configuration d'allure invalide. Vérifiez que l'allure min est plus lente que l'allure max et respecte les limites (2:00-9:00).</p>
           )}
       </div>
      </StyledThemeProvider>
    </ThemeProvider>
  );
}
export default App;


