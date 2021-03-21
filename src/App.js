import React from "react";

import "./App.css";
import mapSvg from "./img/Germany_adm_location_map.svg";
import jsonData from "./data/data.json";

// convert json file to object
function defaultCities() {
  var out = {};
  jsonData.forEach((e) => (out[e.name.toLowerCase()] = e));
  return out;
}

// map borders
const longstart = 5.5;
const longend = 15.5;
const latstart = 55.1;
const latend = 47.2;

// width settings
const width = 536;
const height = 635;

function App() {
  const [cities, setCities] = React.useState(defaultCities);
  const [foundCities, setFoundCities] = React.useState([]);
  const [foundPopulation, setFoundPopulation] = React.useState(0);
  const [inputState, setInputState] = React.useState("");

  function handleInput(e) {
    setInputState(e.target.value);

    const input = e.target.value.toLowerCase();
    const result = cities[input];
    if (result) {
      if (!result.found) {
        setFoundCities([
          ...foundCities,
          {
            name: input,
            x: (result.long - longstart) / (longend - longstart),
            y: (result.lat - latstart) / (latend - latstart),
            p: result.population,
          },
        ]);
        setFoundPopulation(foundPopulation + result.population);
        setCities({ ...cities, [input]: { ...cities[input], found: true } });
        setInputState("");
      }
    }
  }

  return (
    <div>
      <div id="map">
        <img
          src={mapSvg}
          alt={"Karte von Deutschland"}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
        ></img>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          {foundCities.map((c) => {
            return (
              <circle
                cx={c.x * width}
                cy={c.y * height}
                r={c.p / 150000 < 3 ? 3 : c.p / 150000}
                fill="lightskyblue"
                key={c.x + c.y}
              ></circle>
            );
          })}
        </svg>
      </div>
      <div>
        <form>
          <label htmlFor="city-input">Stadt: </label>
          <input
            value={inputState}
            onChange={handleInput}
            id="city-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          ></input>
        </form>
      </div>
      <div id={"population-counter"}>{foundPopulation}</div>
      <div id={"city-counter"}>{foundCities.length}</div>
    </div>
  );
}

export default App;
