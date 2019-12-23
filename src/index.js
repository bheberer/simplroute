import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { pathToRegexp } from "path-to-regexp";
import './index.css';
import * as serviceWorker from './serviceWorker';

function Switch({ children }) {
  const [path, setPath] = useState(window.location.pathname);
  const locationStateHandler = useCallback(() => {
    setPath(window.location.pathname);
  }, []);

  // monkeypatch in a 'pushState' event as it isn't natively supported
  useEffect(() => {
    const pushState = window.history.pushState;

    window.history.pushState = function() {
      const result = pushState.apply(this, arguments);
      const event = new Event('pushState');
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  }, [])

  // listen for location changes
  useEffect(() => {
    window.addEventListener("popstate", locationStateHandler);
    window.addEventListener('pushState', locationStateHandler);
    return () => {
      window.removeEventListener("popstate", locationStateHandler);
      window.removeEventListener("pushState", locationStateHandler);
    };
  }, [locationStateHandler]);

  let matchedRoute = null;
  let params = {};

  // match children to path and select one to render + pass params to
  React.Children.forEach(children, child => {
    const keys = [];
    const regexp = pathToRegexp(child.props.path, keys);
    const match = regexp.exec(path);
    if (match) {
      matchedRoute = child;
      params = keys.reduce((acc, key) => {
        acc[key.name] = match[1];
        return acc;
      }, {})
    }
  });

  return React.cloneElement(matchedRoute, params);
}

function Route({ children, ...rest }) {
  return typeof children === 'string' ? children : React.cloneElement(children, rest);
}

function Link({ to, children }) {
  return (
    <a
      href={ to }
      onClick={ (e) => {
        e.preventDefault();
        window.history.pushState(0, 0, to);
      } }
    >
      { children }
    </a>
  )
}

function Color({ color }) {
  return color;
}
 
function App() {
  console.log('la')
  return (
    <div className="App">
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
        <Link to='/color/red'>Red</Link>
        <Link to='/color/blue'>Blue</Link>
        <Link to='/color/green'>Green</Link>
      </nav>
      <Switch>
        <Route path="/">Home</Route>
        <Route path='/about'>About</Route>
        <Route path='/color/:color'><Color /></Route>
      </Switch>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
