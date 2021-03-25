import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import "../App.css";

function defaultFoundCities() {
  const localStorageValue = window.localStorage.getItem("foundCities");
  if (localStorageValue) {
    return JSON.parse(localStorageValue);
  } else {
    return [];
  }
}

function defaultStats(states) {
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

    Object.entries(states).forEach((e) => {
      const id = e[0];
      const values = e[1];
      out.states[id] = { ...values, populationFound: 0 };
    });
    return out;
  }
}

function FindPopulation() {
  const routerParams = useParams();
  const [isLoading, setLoading] = React.useState(true);

  const [fetchedData, setFetchedData] = React.useState();

  const [foundCities, setFoundCities] = React.useState(defaultFoundCities);
  const [stats, setStats] = React.useState();

  const [inputState, setInputState] = React.useState("");

  // width settings
  const width = fetchedData ? fetchedData.map.width : 100;
  const height = fetchedData ? fetchedData.map.height : 100;

  React.useEffect(() => {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 400) {
          window.location.href = "/404";
          return;
        }
      }
    );

    axios.get("/api/countries/" + routerParams.country).then((res) => {
      let cities = {};
      res.data["cities"].forEach((e) => (cities[e.name.toLowerCase()] = e));

      setFetchedData({
        cities: cities,
        states: res.data["states"][0],
        map: res.data.map,
      });
      setStats(defaultStats(res.data["states"][0]));
      setLoading(false);
    });
  }, [routerParams]);

  React.useEffect(() => {
    window.localStorage.setItem("foundCities", JSON.stringify(foundCities));
    if (stats) {
      window.localStorage.setItem("stats", JSON.stringify(stats));
    }
  }, [foundCities, stats]);

  if (isLoading) {
    return <div id="loading-page"></div>;
  }

  function restartGame() {
    window.localStorage.clear();
    setStats(defaultStats(fetchedData.states));
    setFoundCities(defaultFoundCities);
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleInput(e) {
    setInputState(e.target.value);

    const input = e.target.value.toLowerCase();
    const result = fetchedData.cities[input];

    if (result) {
      const matches = (c) => c.name === result.name;
      const match = foundCities.some(matches);
      if (!match) {
        setFoundCities([
          {
            name: result.name,
            x:
              (result.long - fetchedData.map.longstart) /
              (fetchedData.map.longend - fetchedData.map.longstart),
            y:
              (result.lat - fetchedData.map.latstart) /
              (fetchedData.map.latend - fetchedData.map.latstart),
            p: result.population,
          },
          ...foundCities,
        ]);
        const isTop100 = Object.keys(fetchedData.cities)
          .slice(0, 100)
          .includes(input);

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

        setInputState("");
      }
    }
  }

  return (
    <div id="app">
      <div id="top">
        <h1 id="title">Bevölkerung in Deutschland</h1>
      </div>
      <div id="game">
        <div className="flex-column align-center">
          <div id="map" style={{ width: `calc(60vh * (${width}/${height}))` }}>
            <img
              src={"/maps/countries/" + fetchedData.map.src}
              alt="Karte von Deutschland"
              id="map-img"
            ></img>
            <svg viewBox={`0 0 ${width + 200} ${height}`} id="circles">
              {foundCities.map((c) => {
                return (
                  <g key={c.x + c.y}>
                    <circle
                      cx={c.x * width}
                      cy={c.y * height}
                      r={c.p / 150000 < 3 ? 3 : c.p / 150000}
                    ></circle>
                    <foreignObject
                      className="hovertag"
                      x={c.x * width}
                      y={c.y * height}
                    >
                      <span className="hovertext">{c.name}</span>
                    </foreignObject>
                  </g>
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
              autoFocus={true}
              name="safarisearch"
            ></input>
          </form>
          <button id="restart-button" onClick={restartGame}>
            Karte Zurücksetzen
          </button>
        </div>

        <div className="flex-column stats">
          <h2>Gefunden</h2>
          <div id="population-counter">
            {"Bevölkerung: " +
              stats.populationFound
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </div>
          <div id="population-counter-percentage">
            {"Gesamte Bevölkerung: " +
              ((stats.populationFound / stats.population) * 100).toFixed(2) +
              "%"}
          </div>
          <div id="total-cities">Städte: {foundCities.length}</div>
          <div id="found-top-100">100 größte Städte: {stats.top100}</div>
          <h2>Bundesländer</h2>
          {Object.entries(stats.states).map((s) => {
            const [key, value] = s;
            return (
              <div key={key} className="states">
                {value.name +
                  ": " +
                  ((value.populationFound / value.population) * 100).toFixed(
                    1
                  ) +
                  "%"}
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

export default FindPopulation;
