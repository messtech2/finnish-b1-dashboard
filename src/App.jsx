import Dashboard from './pages/Dashboard';
import InstallButton from './components/InstallButton';
import UpdateNotifier from './components/UpdateNotifier';

function App() {
  return (
    <>
      <UpdateNotifier />
      <InstallButton />
      <Dashboard />
    </>
  );
}

export default App;
