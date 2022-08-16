import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components/macro'

import App from 'src/App';
import reportWebVitals from 'src/reportWebVitals';
import * as serviceWorkerRegistration from 'src/serviceWorkerRegistration';

const GlobalStyle = createGlobalStyle`
  :root {
    --shadow-color: 206deg 8% 70%;
    --shadow-elevation-low:
      0px 0.3px 0.4px hsl(var(--shadow-color) / 0.25),
      0px 0.9px 1.1px -1.9px hsl(var(--shadow-color) / 0.34);
    --shadow-elevation-medium:
      0px 0.3px 0.4px hsl(var(--shadow-color) / 0.36),
      -0.1px 4.4px 5.3px -1.9px hsl(var(--shadow-color) / 0.47);
    --shadow-elevation-high:
      0px 0.3px 0.4px hsl(var(--shadow-color) / 0.33),
      -0.1px 2.7px 3.3px -0.6px hsl(var(--shadow-color) / 0.38),
      -0.1px 7.1px 8.6px -1.3px hsl(var(--shadow-color) / 0.44),
      -0.3px 17.4px 21.1px -1.9px hsl(var(--shadow-color) / 0.49);
    --standard-width: 600px;
    font-size: 0.875em;
    height: 100%;
    --card-shade: #fff;
    // --card-shade: #fcfcfc;
    --highlight-color: #0095ffb0;
    --active-color: #0095ffd9;
    --strong-highlight-color: #0095ffcc;
    --gray-highlight-color: #fafafa;
  }

  body {
    // height: 100%;
    height: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;  
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 40px 80px 40px;
    color: #454545;
    // background-color: hsla(206, 24%, 94%, 0.2);
    background-color: #fefefe;
  }

  code {
    font-family: source-code-pro,
    Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  input {
    all: unset;
    font-size: inherit;
  }

  #root {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <GlobalStyle />
    <Router>
      <App />
    </Router>
  </>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
