import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';

function darkenColor(color, amount = 0.3) {
  // Remove # if present
  color = color.replace('#', '');
  // Parse r, g, b values
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
    const usedColors = groups.filter(g => g.name !== "Löschen").map(g => g.color);
    const availableColors = predefinedColors.filter(c => !usedColors.includes(c));
    const randomColor = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
    setNewGroupColor(randomColor);
  }, [groups]);

  const addGroup = () => {
    if (newGroupName.trim() && newGroupName.trim() !== "Löschen") {
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
    if (groups[index].name !== "Löschen") {
      setEditingGroup(index);
      setEditName(groups[index].name);
    }
  };

  const saveEditGroup = () => {
    if (editName.trim() && editName.trim() !== "Löschen") {
      setGroups(groups.map((g, i) => i === editingGroup ? { ...g, name: editName } : g));
    }
    setEditingGroup(null);
    setEditName('');
  };

  const toggleSeatInGroup = (rowIndex, seatIndex) => {
    if (selectedGroup === null) return;
    
    const seatId = `${rowIndex}-${seatIndex}`;
    const selectedGroupData = groups[selectedGroup];
    
    // Wenn die Lösch-Gruppe ausgewählt ist
    if (selectedGroupData.name === "Löschen") {
      // Entferne den Sitz aus allen FARB-Gruppen und füge ihn zur Lösch-Gruppe hinzu
      setGroups(groups.map(g => {
        const newSeats = new Set(g.seats);
        if (g.name === "Löschen") {
          // Zur Lösch-Gruppe hinzufügen
          if (newSeats.has(seatId)) {
            newSeats.delete(seatId); // Entfernen, wenn schon drin
          } else {
            newSeats.add(seatId); // Hinzufügen, wenn nicht drin
          }
        } else {
          // Aus allen anderen Gruppen entfernen
          newSeats.delete(seatId);
        }
        return { ...g, seats: newSeats };
      }));
    } else {
      // Normales Verhalten für FARB-Gruppen
      setGroups(groups.map((g, i) => {
        const newSeats = new Set(g.seats);
        if (i === selectedGroup) {
          if (newSeats.has(seatId)) {
            newSeats.delete(seatId);
          } else {
            newSeats.add(seatId);
            // Wenn zu einer Farb-Gruppe hinzugefügt, aus Lösch-Gruppe entfernen
            const deleteGroup = groups.find(g => g.name === "Löschen");
            if (deleteGroup) {
              const deleteIndex = groups.indexOf(deleteGroup);
              if (deleteIndex !== -1 && deleteIndex !== selectedGroup) {
                const deleteSeats = new Set(groups[deleteIndex].seats);
                deleteSeats.delete(seatId);
                groups[deleteIndex] = { ...groups[deleteIndex], seats: deleteSeats };
              }
            }
          }
        } else if (g.name !== "Löschen") {
          // Remove from other color groups (but not from delete group)
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

  const exportToPDF = async () => {
    const element = layoutRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape'); // landscape for lengthwise printing
    const imgWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('orchestra-seats.pdf');
  };

  // Funktion zum Zählen der gelöschten Sitze pro Reihe
  const getDeletedSeatsPerRow = () => {
    const deleteGroupObj = groups.find(g => g.name === "Löschen");
    if (!deleteGroupObj) return new Array(numRows).fill(0);
    
    const deletedPerRow = new Array(numRows).fill(0);
    
    // Zähle gelöschte Sitze pro Reihe
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
  const deleteGroupObj = groups.find(g => g.name === "Löschen");
  const otherGroups = groups.filter(g => g.name !== "Löschen");
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
            
            {/* Lösch-Gruppe immer zuoberst */}
            {deleteGroupObj && (
              <div className={`group-item ${selectedGroup === groups.indexOf(deleteGroupObj) ? 'selected' : ''}`} style={{marginBottom: '15px', border: '2px solid #ccc'}}>
                <span 
                  style={{ 
                    color: '#666',
                    fontStyle: 'italic'
                  }} 
                >
                  Löschen
                </span>
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
            
            {/* "Löschen" Gruppe Button nur wenn nicht existiert */}
            {!deleteGroupObj && (
              <button 
                onClick={() => {
                  setGroups([{ name: "Löschen", color: "#ffffff", seats: new Set() }, ...groups]);
                }}
                style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#f0f0f0', 
                  color: '#333',
                  border: '1px solid #ccc'
                }}
              >
                + Löschen-Gruppe hinzufügen
              </button>
            )}
            
            {/* Andere Gruppen */}
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
                        <span 
                          style={{ color: group.color }} 
                          onClick={() => startEditGroup(originalIndex)}
                        >
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
            <button onClick={exportToPDF}>PDF Export</button>
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
                rowSeatSize = arcDistance * 0.9; // reduce to 90% of arc distance to avoid touching
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
                    const isDeleteGroupSelected = selectedGroup !== null && groups[selectedGroup]?.name === "Löschen";
                    const isDeleteGroupSeat = groupForSeat?.name === "Löschen";
                    const isColorGroupSeat = groupForSeat && groupForSeat.name !== "Löschen";
                    
                    // Bestimme die Hintergrundfarbe
                    let backgroundColor = '#ccc'; // Standard grau
                    if (isDeleteGroupSeat) {
                      backgroundColor = '#ffffff'; // Weiß für Lösch-Gruppe
                    } else if (isColorGroupSeat) {
                      backgroundColor = groupForSeat.color; // Gruppenfarbe für Farb-Gruppen
                    }
                    
                    // Bestimme die Randfarbe
                    let borderColor = '#000'; // Standard schwarz
                    if (isDeleteGroupSeat) {
                      borderColor = '#ccc'; // Hellgrauer Rand für Lösch-Gruppe
                    } else if (isColorGroupSeat) {
                      borderColor = darkenColor(groupForSeat.color); // Abgedunkelte Gruppenfarbe
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
                          // Spezielle Styling für Löschen-Gruppe
                          color: isDeleteGroupSeat ? '#ffffff' : '#000',
                          opacity: isDeleteGroupSeat && !isDeleteGroupSelected ? 0 : 1,
                          cursor: isDeleteGroupSelected ? 'pointer' : 'default',
                        }}
                        onClick={() => toggleSeatInGroup(rowIndex, seatIndex)}
                      >
                        {(() => {
                          if (isDeleteGroupSeat) {
                            // Für Löschen-Gruppe: Leerer Text im Normalzustand
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
                      <td key={index} >{active}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="groups-info">
              <h4>Gruppen:</h4>
              {deleteGroupObj && (
                <div className="legend-group">
                  <div 
                    className="color-box" 
                    style={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #ccc'
                    }}
                  ></div>
                  <span style={{ fontStyle: 'italic' }}>Löschen</span>
                  <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                    ({deleteGroupObj.seats.size} Sitze)
                  </span>
                </div>
              )}
              {otherGroups.map((group, index) => {
                const originalIndex = groups.findIndex(g => g === group);
                return (
                  <div key={originalIndex} className="legend-group">
                    <div 
                      className="color-box" 
                      style={{ 
                        backgroundColor: group.color,
                        border: 'none'
                      }}
                    ></div>
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