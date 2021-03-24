import React from "react";
import "./App.css";
import FindPopulation from "./pages/FindPopulation";
import Error404 from "./pages/Error404";

import { Route, BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Route path="/findpopulation/:country" component={FindPopulation}></Route>
      <Route path="*" exact={true} component={Error404} />
    </Router>
  );
}

export default App;
