//import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NotFound from './pages/404NotFound';
import AllTransactions from './pages/AllTransactions';
import Dashboard from './pages/Dashboard';
//screens
import Login from './pages/Login';
import Profile from './pages/Profile';
import Registration from './pages/Register';
import UserAccounts from './pages/UserAccounts';
//route
import PrivateRoute from './routers/PrivateRoute';
//style
import '../src/App.css';
import { useEffect } from 'react';


function App() {
  useEffect(()=>{
    window.scrollTo(0, 0);
  },[]);
  
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <Switch>
          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute exact path="/transactions" component={AllTransactions} />
          <PrivateRoute exact path="/accounts" component={UserAccounts} />
          <Route path="/login" component={Login} />
          <Route path="/registration" component={Registration} />
          <Route path="*" component={NotFound} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
