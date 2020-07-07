import React from 'react';
import TopBar from "./components/Topbar";
import Filters from "./components/Filters";
import Contacts from "./components/Contacts";

import './App.scss';

class App extends React.Component {
  render() {
	return (
    <div className="app" data-testid="app">
      
      <React.Fragment>
      <TopBar />
      <Filters />
      <Contacts />
      </React.Fragment>

    </div>
	  
	)
  }
}

export default App;
