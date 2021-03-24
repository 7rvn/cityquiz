import React from "react";
import "./App.css";
import FindPopulation from "./pages/FindPopulation";
import Error404 from "./pages/Error404";

import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route
          path="/findpopulation/:country"
          component={FindPopulation}
        ></Route>
        <Route path="*" exact component={Error404} />
      </Switch>
    </Router>
  );
}

export default App;
