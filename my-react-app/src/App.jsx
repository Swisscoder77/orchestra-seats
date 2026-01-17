import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import './App.css';

function darkenColor(color, amount = 0.3) {
  color = color.replace('#', '');
  const num = parseInt(color, 16);
  const amt = Math.round(2.55 * amount * 100);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function App() {
  const [numRows, setNumRows] = useState(4);
  const [seatsPerRow, setSeatsPerRow] = useState([10, 10, 10, 10]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#FF6B6B');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState('');
  const layoutRef = useRef();

  const handleNumRowsChange = (value) => {
    const newNum = Math.max(1, Math.min(10, parseInt(value) || 1));
    setNumRows(newNum);
    setSeatsPerRow(prev => {
      const newSeats = [...prev];
      newSeats.length = newNum;
      for (let i = prev.length; i < newNum; i++) {
        newSeats[i] = 10;
      }
      return newSeats;
    });
  };

  const handleSeatsChange = (rowIndex, value) => {
    const newSeats = [...seatsPerRow];
    newSeats[rowIndex] = Math.max(1, Math.min(30, parseInt(value) || 1));
    setSeatsPerRow(newSeats);
  };

  const predefinedColors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E', '#F1C40F', '#E91E63'];

  useEffect(() => {
    const usedColors = groups.filter(g => g.name !== "Ausblenden").map(g => g.color);
    const availableColors = predefinedColors.filter(c => !usedColors.includes(c));
    const randomColor = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
    setNewGroupColor(randomColor);
  }, [groups]);

  const addGroup = () => {
    if (newGroupName.trim() && newGroupName.trim() !== "Ausblenden") {
      setGroups([...groups, { name: newGroupName, color: newGroupColor, seats: new Set() }]);
      setNewGroupName('');
      setNewGroupColor('#FF6B6B');
    }
  };

  const deleteGroup = (index) => {
    setGroups(groups.filter((_, i) => i !== index));
    if (selectedGroup === index) setSelectedGroup(null);
    if (editingGroup === index) setEditingGroup(null);
  };

  const startEditGroup = (index) => {
    if (groups[index].name !== "Ausblenden") {
      setEditingGroup(index);
      setEditName(groups[index].name);
    }
  };

  const saveEditGroup = () => {
    if (editName.trim() && editName.trim() !== "Ausblenden") {
      setGroups(groups.map((g, i) => i === editingGroup ? { ...g, name: editName } : g));
    }
    setEditingGroup(null);
    setEditName('');
  };

  const toggleSeatInGroup = (rowIndex, seatIndex) => {
    if (selectedGroup === null) return;
    
    const seatId = `${rowIndex}-${seatIndex}`;
    const selectedGroupData = groups[selectedGroup];
    
    if (selectedGroupData.name === "Ausblenden") {
      setGroups(groups.map(g => {
        const newSeats = new Set(g.seats);
        if (g.name === "Ausblenden") {
          if (newSeats.has(seatId)) {
            newSeats.delete(seatId);
          } else {
            newSeats.add(seatId);
          }
        } else {
          newSeats.delete(seatId);
        }
        return { ...g, seats: newSeats };
      }));
    } else {
      setGroups(groups.map((g, i) => {
        const newSeats = new Set(g.seats);
        if (i === selectedGroup) {
          if (newSeats.has(seatId)) {
            newSeats.delete(seatId);
          } else {
            newSeats.add(seatId);
            const deleteGroup = groups.find(g => g.name === "Ausblenden");
            if (deleteGroup) {
              const deleteIndex = groups.indexOf(deleteGroup);
              if (deleteIndex !== -1 && deleteIndex !== selectedGroup) {
                const deleteSeats = new Set(groups[deleteIndex].seats);
                deleteSeats.delete(seatId);
                groups[deleteIndex] = { ...groups[deleteIndex], seats: deleteSeats };
              }
            }
          }
        } else if (g.name !== "Ausblenden") {
          newSeats.delete(seatId);
        }
        return { ...g, seats: newSeats };
      }));
    }
  };

  const stageSize = 600 + Math.max(0, numRows - 4) * 50;
  const maxRadius = stageSize / 2 - 30;
  const minRadius = 50;
  const seatSize = Math.max(20, 40 - Math.max(0, numRows - 4) * 2);

const exportToPDF = () => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // Berechne Sitzplan Skalierung
  const stageCenterX = pageWidth / 2;
  const stageCenterY = pageHeight / 2 + 40;
  const pdfStageSize = contentWidth;
  const pdfScale = pdfStageSize / stageSize;
  const pdfSeatSize = seatSize * pdfScale;
  
  // Zeichne Halbkreis für Sitzreihen
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  const pdfMaxRadius = (maxRadius * pdfScale);
  const pdfMinRadius = (minRadius * pdfScale);
  
  pdf.setDrawColor(255, 255, 255)
  for (let i = 0; i < numRows; i++) {
    const step = (pdfMaxRadius - pdfMinRadius) / numRows;
    const radius = pdfMinRadius + (i + 1) * step;
    pdf.circle(stageCenterX, stageCenterY, radius, 'S');
  }
  pdf.setDrawColor(200, 200, 200);

  // Zeichne Sitze als Vektoren
  Array.from({ length: numRows }).forEach((_, rowIndex) => {
    const seats = seatsPerRow[rowIndex];
    const step = (maxRadius - minRadius) / numRows;
    const radius = minRadius + (rowIndex + 1) * step;
    const angles = [];
    
    for (let i = 0; i < seats; i++) {
      angles.push(-90 + (180 / (seats - 1 || 1)) * i);
    }
    
    angles.forEach((angle, seatIndex) => {
      const rad = (angle * Math.PI) / 180;
      const x = radius * Math.sin(rad) * pdfScale;
      const y = -radius * Math.cos(rad) * pdfScale;
      
      const seatId = `${rowIndex}-${seatIndex}`;
      const groupForSeat = groups.find(g => g.seats.has(seatId));
      const isDeleteGroupSeat = groupForSeat?.name === "Ausblenden";
      const isColorGroupSeat = groupForSeat && groupForSeat.name !== "Ausblenden";
      
      // Bestimme Farben
      let fillColor = isDeleteGroupSeat ? [255, 255, 255] : 
                      isColorGroupSeat ? hexToRgb(groupForSeat.color) : 
                      [204, 204, 204];
      
      let borderColor = isDeleteGroupSeat ? [255, 255, 255] :
                        isColorGroupSeat ? hexToRgb(darkenColor(groupForSeat.color)) :
                        [0, 0, 0];
      
      // Zeichne Sitz
      pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.circle(stageCenterX + x, stageCenterY + y, pdfSeatSize/2, 'FD');
      
      // Sitznummer oder Gruppencode
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(pdfSeatSize);
      const label = isDeleteGroupSeat ? "" : 
                    groupForSeat ? groupForSeat.name.substring(0, 3) : 
                    (seatIndex + 1).toString();
      
      if (label) {
        pdf.text(label, stageCenterX + x, stageCenterY + y, { align: 'center', baseline: 'middle' });
      }
    });
  });
  
  // ZEICHNE DIRIGENTENPLATZ - KORRIGIERT
  pdf.setFillColor(100, 100, 100);
  pdf.setDrawColor(50, 50, 50);
  
  // Position für Dirigenten - unter den Sitzreihen
  const conductorWidth = pdfSeatSize * 2;
  const conductorHeight = pdfSeatSize * 1.7;
  const conductorX = pageWidth / 2;
  const conductorY = pageHeight/2 + 26; // 10mm Abstand unter den Sitzen
  
  // Rechteck für Dirigentenplatz
  pdf.rect(
    conductorX - conductorWidth/2, 
    conductorY, 
    conductorWidth, 
    conductorHeight, 
    'FD'
  );
  
  // "D" für Dirigent
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(pdfSeatSize * 3);
  pdf.text('D', conductorX, conductorY + conductorHeight/2, { 
    align: 'center', 
    baseline: 'middle' 
  });
  
    
    // Legende rechts
    let legendX = margin;
    let legendY = pageHeight*0.8 + 16;
    
    // Stühle pro Reihe Tabelle
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    pdf.text('Stühle pro Reihe:', legendX, legendY);
    pdf.line(legendX, legendY -8, pageWidth - margin, legendY -8);    
    legendY += 8;
    
    const tableColWidth = 15;
    const activeSeats = getActiveSeatsPerRow();
    
    // Tabellenkopf
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Reihe', legendX, legendY);
    for (let i = 0; i < numRows; i++) {
      pdf.text((i + 1).toString(), legendX + 20 + i * tableColWidth, legendY);
    }
    legendY += 6;
    
    // Aktive Stühle Zeile
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Aktive', legendX, legendY);
    activeSeats.forEach((seats, i) => {
      pdf.text(seats.toString(), legendX + 20 + i * tableColWidth, legendY);
    });
    legendX += 90;
    legendY -= 16;
    
    // Farb-Gruppen
    let groupsDrawn = 0;
    let currentColumnX = legendX;

    otherGroups.forEach((group, index) => {
      const color = hexToRgb(group.color);
      
      // Zeichne Gruppe an aktueller Position
      drawLegendItem(pdf, currentColumnX, legendY, color, group.name, group.seats.size, false);
      
      groupsDrawn++;
      legendY += 7; // Eine Zeile nach unten
      
      // Nach 3 Gruppen: Neue Spalte beginnen
      if (groupsDrawn % 3 === 0) {
        currentColumnX += 35; // 20mm nach rechts
        legendY = legendY - 21; // Zurück zum Anfang (3 * 7mm = 21mm)
      }
    });

    // Für weitere Elemente: legendX auf die nächste freie Position setzen
    legendX = currentColumnX + 20;
    // legendY auf die tiefste Position setzen
    if (otherGroups.length % 3 !== 0) {
      legendY = legendY + (3 - (otherGroups.length % 3)) * 7;
    }
        
    // Fußzeile
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    //pdf.text('Generiert mit Besatzung App', pageWidth / 2, pageHeight - 5, { align: 'center' });
    pdf.save('orchester-sitzplan.pdf');
  };

  // Hilfsfunktion für Hex zu RGB
  const hexToRgb = (hex) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  };

  // Hilfsfunktion für Legenden-Einträge
  const drawLegendItem = (pdf, x, y, color, name, count, isDelete) => {
    // Farbkästchen
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.setDrawColor(isDelete ? 150 : Math.max(0, color[0] - 50), 
                    isDelete ? 150 : Math.max(0, color[1] - 50), 
                    isDelete ? 150 : Math.max(0, color[2] - 50));
    pdf.rect(x, y - 2, 4, 4, 'FD');
    
    // Text
    pdf.setTextColor(isDelete ? 100 : 40, 
                    isDelete ? 100 : 40, 
                    isDelete ? 100 : 40);
    pdf.setFont(undefined, isDelete ? 'italic' : 'normal');
    pdf.text(`${name} (${count})`, x + 7, y);
};

  // Funktion zum Zählen der gelöschten Sitze pro Reihe
  const getDeletedSeatsPerRow = () => {
    const deleteGroupObj = groups.find(g => g.name === "Ausblenden");
    if (!deleteGroupObj) return new Array(numRows).fill(0);
    
    const deletedPerRow = new Array(numRows).fill(0);
    
    deleteGroupObj.seats.forEach(seatId => {
      const [rowIndex] = seatId.split('-').map(Number);
      if (rowIndex >= 0 && rowIndex < numRows) {
        deletedPerRow[rowIndex]++;
      }
    });
    
    return deletedPerRow;
  };

  // Funktion zum Berechnen der aktiven Sitze pro Reihe
  const getActiveSeatsPerRow = () => {
    const totalSeats = seatsPerRow.slice(0, numRows);
    const deletedSeats = getDeletedSeatsPerRow();
    
    return totalSeats.map((total, index) => {
      const deleted = deletedSeats[index] || 0;
      return Math.max(0, total - deleted);
    });
  };

  // Trenne die Lösch-Gruppe von anderen Gruppen
  const deleteGroupObj = groups.find(g => g.name === "Ausblenden");
  const otherGroups = groups.filter(g => g.name !== "Ausblenden");
  const activeSeatsPerRow = getActiveSeatsPerRow();
  const deletedSeatsPerRow = getDeletedSeatsPerRow();

  return (
    <div className="app">
      <h1>Besatzung</h1>
      <div className="main-layout">
        <div className="sidebar">
          <div className="controls">
            <div className="row-control">
              <label>Anzahl Reihen:</label>
              <input
                type="number"
                min="1"
                value={numRows}
                onChange={(e) => handleNumRowsChange(e.target.value)}
              />
            </div>
            {seatsPerRow.slice(0, numRows).map((seats, index) => (
              <div key={index} className="row-control">
                <label>Reihe {index + 1} Sitze:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={seats}
                  onChange={(e) => handleSeatsChange(index, e.target.value)}
                />
              </div>
            ))}
            <div className="group-control">
              <input
                type="text"
                placeholder="Gruppenname"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                maxLength={15}
              />
              <input
                type="color"
                value={newGroupColor}
                onChange={(e) => setNewGroupColor(e.target.value)}
              />
              <button onClick={addGroup}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {deleteGroupObj && (
              <div className={`group-item ${selectedGroup === groups.indexOf(deleteGroupObj) ? 'selected' : ''}`} style={{marginBottom: '15px', border: '2px solid #ccc'}}>
                <span style={{ color: '#666', fontStyle: 'italic' }}>Ausblenden</span>
                <button onClick={() => {
                  const deleteIndex = groups.indexOf(deleteGroupObj);
                  setSelectedGroup(selectedGroup === deleteIndex ? null : deleteIndex);
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
            
            {!deleteGroupObj && (
              <button 
                onClick={() => {
                  setGroups([{ name: "Ausblenden", color: "#ffffff", seats: new Set() }, ...groups]);
                }}
                style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#f0f0f0', 
                  color: '#333',
                  border: '1px solid #ccc'
                }}
              >
                + Ausblenden-Gruppe hinzufügen
              </button>
            )}
            
            <div className="groups-list">
              {otherGroups.map((group, index) => {
                const originalIndex = groups.findIndex(g => g === group);
                return (
                  <div key={originalIndex} className={`group-item ${selectedGroup === originalIndex ? 'selected' : ''}`}>
                    {editingGroup === originalIndex ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={saveEditGroup}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditGroup()}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span style={{ color: group.color }} onClick={() => startEditGroup(originalIndex)}>
                          {group.name}
                        </span>
                        <input
                          type="color"
                          value={group.color}
                          onChange={(e) => setGroups(groups.map((g, i) => i === originalIndex ? { ...g, color: e.target.value } : g))}
                          style={{ width: '30px', height: '30px', border: 'none', cursor: 'pointer' }}
                        />
                      </>
                    )}
                    <button onClick={() => setSelectedGroup(selectedGroup === originalIndex ? null : originalIndex)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button onClick={() => deleteGroup(originalIndex)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={exportToPDF} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 15px' }}>
              PDF Export (Vektorgrafiken)
            </button>
          </div>
        </div>
        <div className="layout" ref={layoutRef}>
          <div className="stage" style={{ width: stageSize, height: stageSize }}>
            {Array.from({ length: numRows }, (_, rowIndex) => {
              const seats = seatsPerRow[rowIndex];
              const step = (maxRadius - minRadius) / numRows;
              const radius = minRadius + (rowIndex + 1) * step;
              const deltaThetaDeg = 180 / (seats - 1 || 1);
              const deltaThetaRad = (deltaThetaDeg * Math.PI) / 180;
              const arcDistance = radius * deltaThetaRad;
              let rowSeatSize = seatSize;
              if (arcDistance <= seatSize) {
                rowSeatSize = arcDistance * 0.9;
              }
              const angles = [];
              for (let i = 0; i < seats; i++) {
                angles.push(-90 + (180 / (seats - 1 || 1)) * i);
              }
              return (
                <div key={rowIndex} className="row">
                  {angles.map((angle, seatIndex) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = radius * Math.sin(rad);
                    const y = -radius * Math.cos(rad);
                    
                    const seatId = `${rowIndex}-${seatIndex}`;
                    const groupForSeat = groups.find(g => g.seats.has(seatId));
                    const isDeleteGroupSelected = selectedGroup !== null && groups[selectedGroup]?.name === "Ausblenden";
                    const isDeleteGroupSeat = groupForSeat?.name === "Ausblenden";
                    const isColorGroupSeat = groupForSeat && groupForSeat.name !== "Ausblenden";
                    
                    let backgroundColor = '#ccc';
                    if (isDeleteGroupSeat) {
                      backgroundColor = '#ffffff';
                    } else if (isColorGroupSeat) {
                      backgroundColor = groupForSeat.color;
                    }
                    
                    let borderColor = '#000';
                    if (isDeleteGroupSeat) {
                      borderColor = '#ccc';
                    } else if (isColorGroupSeat) {
                      borderColor = darkenColor(groupForSeat.color);
                    }
                    
                    return (
                      <div
                        key={seatIndex}
                        className="seat"
                        style={{
                          backgroundColor: backgroundColor,
                          borderColor: borderColor,
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          width: rowSeatSize,
                          height: rowSeatSize,
                          fontSize: rowSeatSize / 2.5,
                          fontWeight: '500',
                          color: isDeleteGroupSeat ? '#ffffff' : '#000',
                          opacity: isDeleteGroupSeat && !isDeleteGroupSelected ? 0 : 1,
                          cursor: isDeleteGroupSelected ? 'pointer' : 'default',
                        }}
                        onClick={() => toggleSeatInGroup(rowIndex, seatIndex)}
                      >
                        {(() => {
                          if (isDeleteGroupSeat) {
                            return isDeleteGroupSelected ? "X" : "";
                          }
                          return groupForSeat ? groupForSeat.name.substring(0, 3) : seatIndex + 1;
                        })()}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div className="conductor" style={{ width: seatSize * 2, height: seatSize * 1.7, fontSize: seatSize * 0.8 }}>D</div>
          </div>
          <div className="legend">
            <h3>Legende</h3>
            <div className="rows-info">
              <h4>Stühle pro Reihe:</h4>
              <table className="rows-table">
                <tbody>
                  <tr>
                    <td>Reihe:</td>
                    {seatsPerRow.slice(0, numRows).map((_, index) => (
                      <td key={index}>{index + 1}</td>
                    ))}
                  </tr>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td>Anzahl Stühle:</td>
                    {activeSeatsPerRow.map((active, index) => (
                      <td key={index}>{active}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="groups-info">
              <h4>Gruppen:</h4>
              {deleteGroupObj && (
                <div className="legend-group">
                  <div className="color-box" style={{ backgroundColor: '#ffffff', border: '1px solid #ccc' }}></div>
                  <span style={{ fontStyle: 'italic' }}>Ausblenden</span>
                  <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                    ({deleteGroupObj.seats.size} Sitze)
                  </span>
                </div>
              )}
              {otherGroups.map((group, index) => {
                const originalIndex = groups.findIndex(g => g === group);
                return (
                  <div key={originalIndex} className="legend-group">
                    <div className="color-box" style={{ backgroundColor: group.color, border: 'none' }}></div>
                    <span>{group.name}</span>
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                      ({group.seats.size} Sitze)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;