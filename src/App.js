import React from "react";

import "./App.css";
import mapSvg from "./img/germany.svg";
import jsonData from "./data/data.json";

// convert json file to object
function defaultCities() {
  const localStorageValue = window.localStorage.getItem("cities");
  if (localStorageValue) {
    return JSON.parse(localStorageValue);
  } else {
    var out = {};
    jsonData["cities"].forEach((e) => (out[e.name.toLowerCase()] = e));
    return out;
  }
}

function defaultStats() {
  const localStorageValue = window.localStorage.getItem("stats");
  if (localStorageValue) {
    return JSON.parse(localStorageValue);
  } else {
    var out = {
      top100: 0,
      populationFound: 0,
      population: 83166711,
      states: {},
    };

    Object.entries(jsonData["states"][0]).forEach((e) => {
      const id = e[0];
      const values = e[1];
      out.states[id] = { ...values, populationFound: 0 };
    });
    return out;
  }
}

function defaultFoundCities() {
  const localStorageValue = window.localStorage.getItem("foundCities");
  if (localStorageValue) {
    return JSON.parse(localStorageValue);
  } else {
    return [];
  }
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
  const [foundCities, setFoundCities] = React.useState(defaultFoundCities);
  const [inputState, setInputState] = React.useState("");

  const [stats, setStats] = React.useState(defaultStats);

  function restartGame() {
    window.localStorage.clear();
    setCities(defaultCities);
    setStats(defaultStats);
    setFoundCities(defaultFoundCities);
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleInput(e) {
    setInputState(e.target.value);

    const input = e.target.value.toLowerCase();
    const result = cities[input];
    if (result) {
      if (!result.found) {
        setFoundCities([
          {
            name: result.name,
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
                (stats.states[result.state].populationFound || 0) +
                result.population,
            },
          },
        });

        setCities({ ...cities, [input]: { ...cities[input], found: true } });
        setInputState("");
      }
    }
  }

  React.useEffect(() => {
    window.localStorage.setItem("cities", JSON.stringify(cities));
    window.localStorage.setItem("foundCities", JSON.stringify(foundCities));
    window.localStorage.setItem("stats", JSON.stringify(stats));
  }, [cities, foundCities, stats]);

  return (
    <div id="app">
      <div id="top">
        <h1 id="title">Städte in Deutschland</h1>
      </div>
      <div id="game">
        <div className="flex-column align-center">
          <div id="map" style={{ width: `calc(60vh * (${width}/${height}))` }}>
            <img src={mapSvg} alt="Karte von Deutschland" id="map-img"></img>
            <svg viewBox={`0 0 ${width} ${height}`} id="circles">
              {foundCities.map((c) => {
                return (
                  <circle
                    cx={c.x * width}
                    cy={c.y * height}
                    r={c.p / 150000 < 3 ? 3 : c.p / 150000}
                    key={c.x + c.y}
                  ></circle>
                );
              })}
            </svg>
          </div>

          <form id="game-form" onSubmit={handleSubmit}>
            <label htmlFor="city-input"></label>
            <input
              value={inputState}
              onChange={handleInput}
              id="city-input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Stadt in Deutschland"
            ></input>
          </form>
          <button id="restart-button" onClick={restartGame}>
            Karte Zurücksetzen
          </button>
        </div>

        <div className="flex-column">
          <h2>Gefunden</h2>
          <div id="population-counter">
            Einwohner:{" "}
            {stats.populationFound
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </div>
          <div id="population-counter-percentage">
            Gesamte Bevölkerung{" "}
            {((stats.populationFound / stats.population) * 100).toFixed(2)}%
          </div>
          <div id="found-top-100">100 größte Städte: {stats.top100}</div>
          <div id="total-cities">Städte insgesamt: {foundCities.length}</div>
          <h2>Bundesländer</h2>
          {Object.entries(stats.states).map((s) => {
            const [key, value] = s;
            return (
              <div key={key} className="states">
                {value.name}:{" "}
                {((value.populationFound / value.population) * 100).toFixed(1)}%
              </div>
            );
          })}
          <h2>Gefundene Städte</h2>
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
