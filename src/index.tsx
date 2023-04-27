import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components/macro'

import App from 'src/App';
import reportWebVitals from 'src/reportWebVitals';
import * as serviceWorkerRegistration from 'src/serviceWorkerRegistration';

const GlobalStyle = createGlobalStyle`
  :root {
    --shadow-color: 0deg 0% 65%;
    --shadow-elevation-low:
      0px 0.1px 0.1px hsl(var(--shadow-color) / 0.15),
      0px 0.2px 0.3px -0.6px hsl(var(--shadow-color) / 0.26),
      0px 0.3px 0.4px -1.2px hsl(var(--shadow-color) / 0.36);
    --shadow-elevation-medium:
      0px 0.1px 0.1px hsl(var(--shadow-color) / 0.16),
      0px 0.4px 0.5px -0.4px hsl(var(--shadow-color) / 0.24),
      0px 0.8px 1.1px -0.8px hsl(var(--shadow-color) / 0.32),
      0px 1.7px 2.2px -1.2px hsl(var(--shadow-color) / 0.4);
    --shadow-elevation-high:
      0px 0.1px 0.1px hsl(var(--shadow-color) / 0.15),
      0px 0.7px 0.9px -0.2px hsl(var(--shadow-color) / 0.19),
      0px 1.2px 1.6px -0.4px hsl(var(--shadow-color) / 0.23),
      0px 1.8px 2.4px -0.5px hsl(var(--shadow-color) / 0.26),
      0.1px 2.7px 3.5px -0.7px hsl(var(--shadow-color) / 0.3),
      0.1px 3.9px 5.1px -0.9px hsl(var(--shadow-color) / 0.34),
      0.1px 5.7px 7.5px -1.1px hsl(var(--shadow-color) / 0.38),
      0.2px 8.1px 10.6px -1.2px hsl(var(--shadow-color) / 0.41);
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
    height: fit-content;
    min-height: 100vh;
    font-family: 'Helvetica Neue';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;  
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 40px 80px 40px;
    box-sizing: border-box;
    color: #454545;
    position: relative;
    &:after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      min-height: 100%;
      opacity: 0.6;
      background-image: url(${process.env.PUBLIC_URL}/grid.png);
      z-index: -2;
    }
  }

  code {
    font-family: source-code-pro,
    Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  pre {
    font-family: 'Helvetica Neue';
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
