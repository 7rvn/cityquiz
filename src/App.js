import React from "react";

import "./App.css";
import mapSvg from "./img/germany_edited.svg";
import jsonData from "./data/data.json";

// convert json file to object
function defaultCities() {
  var out = {};
  jsonData.forEach((e) => (out[e.name.toLowerCase()] = e));
  return out;
}

const defaultStats = {
  top100: 0,
  populationFound: 0,
  population: 83166711,
  states: {
    "01": {
      name: "Schleswig-Holstein",
      population: 2903773,
      cities: 1106,
      populationFound: 0,
      citiesFound: 0,
    },
    "02": {
      name: "Hamburg",
      population: 1847253,
      cities: 1,
      populationFound: 0,
      citiesFound: 0,
    },
    "03": {
      name: "Niedersachsen",
      population: 7993608,
      cities: 944,
      populationFound: 0,
      citiesFound: 0,
    },
    "04": {
      name: "Bremen",
      population: 681202,
      cities: 2,
      populationFound: 0,
      citiesFound: 0,
    },
    "05": {
      name: "Nordrhein-Westfalen",
      population: 17947221,
      cities: 396,
      populationFound: 0,
      citiesFound: 0,
    },
    "06": {
      name: "Hessen",
      population: 6288080,
      cities: 422,
      populationFound: 0,
      citiesFound: 0,
    },
    "07": {
      name: "Rheinland-Pfalz",
      population: 4093903,
      cities: 2301,
      populationFound: 0,
      citiesFound: 0,
    },
    "08": {
      name: "Baden-Württemberg",
      population: 11100394,
      cities: 1101,
      populationFound: 0,
      citiesFound: 0,
    },
    "09": {
      name: "Bayern",
      population: 13124737,
      cities: 2056,
      populationFound: 0,
      citiesFound: 0,
    },
    10: {
      name: "Saarland",
      population: 986887,
      cities: 52,
      populationFound: 0,
      citiesFound: 0,
    },
    11: {
      name: "Berlin",
      population: 3669491,
      cities: 1,
      populationFound: 0,
      citiesFound: 0,
    },
    12: {
      name: "Brandenburg",
      population: 2521893,
      cities: 416,
      populationFound: 0,
      citiesFound: 0,
    },
    13: {
      name: "Mecklenburg-Vorpommern",
      population: 1608138,
      cities: 726,
      populationFound: 0,
      citiesFound: 0,
    },
    14: {
      name: "Sachsen",
      population: 4071971,
      cities: 419,
      populationFound: 0,
      citiesFound: 0,
    },
    15: {
      name: "Sachsen-Anhalt",
      population: 2194782,
      cities: 218,
      populationFound: 0,
      citiesFound: 0,
    },
    16: {
      name: "Thüringen",
      population: 2133378,
      cities: 631,
      populationFound: 0,
      citiesFound: 0,
    },
  },
};

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
  const [inputState, setInputState] = React.useState("");

  const [stats, setStats] = React.useState(defaultStats);

  function handleInput(e) {
    setInputState(e.target.value);

    const input = e.target.value.toLowerCase();
    const result = cities[input];
    if (result) {
      if (!result.found) {
        setFoundCities([
          {
            name: input,
            x: (result.long - longstart) / (longend - longstart),
            y: (result.lat - latstart) / (latend - latstart),
            p: result.population,
          },
          ...foundCities,
        ]);
        const isTop100 = Object.keys(cities).slice(0, 100).includes(input);

        setStats({
          ...stats,
          populationFound: stats.populationFound + result.population,
          top100: isTop100 ? stats.top100 + 1 : stats.top100,
          states: {
            ...stats.states,
            [result.state]: {
              ...stats.states[result.state],
              populationFound:
                stats.states[result.state].populationFound + result.population,
              citiesFound: stats.states[result.state].citiesFound + 1,
            },
          },
        });

        setCities({ ...cities, [input]: { ...cities[input], found: true } });
        setInputState("");
      }
    }
  }

  return (
    <div id="app">
      <div id="top">
        <h1 id="title">Deutschland</h1>
      </div>
      <div id="game">
        <div id="left">
          <div id="map">
            <img
              src={mapSvg}
              alt="Karte von Deutschland"
              viewBox={`0 0 ${width} ${height}`}
              width={width}
              height={height}
            ></img>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width={width}
              height={height}
            >
              {foundCities.map((c) => {
                return (
                  <circle
                    cx={c.x * width}
                    cy={c.y * height}
                    r={c.p / 150000 < 3 ? 3 : c.p / 150000}
                    fill="#bbe1fa"
                    key={c.x + c.y}
                  ></circle>
                );
              })}
            </svg>
          </div>

          <form id="game-form">
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

        <div id="left">
          <div id="population-counter">
            total: {stats.populationFound}{" "}
            {((stats.populationFound / stats.population) * 100).toFixed(2)}%
          </div>
          <div id="found-top-100">top100: {stats.top100}/100</div>
          {Object.entries(stats.states).map((s) => {
            const [key, value] = s;
            return (
              <div key={key} className="states">
                {value.name}: {value.citiesFound}/{value.cities}{" "}
                {value.populationFound}/{value.population}
              </div>
            );
          })}
          <div id="found-cities">
            {foundCities.map((x) => {
              return <div key={x.x + x.y}>{x.name}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
